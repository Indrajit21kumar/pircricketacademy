/**
 * Tests for the Bookings handler — slot availability, mark-paid, status, cleanup.
 * POST with Razorpay and POST verify are covered by integration tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

const { mockDb } = vi.hoisted(() => {
  process.env.JWT_SECRET = "test-super-secret-key-at-least-32-chars";
  process.env.DATABASE_URL = "postgresql://mock";

  function chain(data: unknown[] = []) {
    const obj: any = {
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(data),
      then: (resolve: Function) => Promise.resolve(data).then(resolve as any),
    };
    return obj;
  }

  const mockDb = {
    select: vi.fn().mockImplementation(() => chain()),
    insert: vi.fn().mockImplementation(() => chain()),
    update: vi.fn().mockImplementation(() => chain()),
    delete: vi.fn().mockImplementation(() => chain()),
    _chain: chain,
  };
  return { mockDb };
});

vi.mock("../_db.js", () => ({ db: mockDb }));

import { handleBookings } from "../_handlers.js";

const SECRET = process.env.JWT_SECRET!;
const adminToken = () => jwt.sign({ id: 1, username: "admin", role: "admin" }, SECRET, { expiresIn: "1h" });

function makeReq(
  method: string,
  body: Record<string, unknown> = {},
  headers: Record<string, string> = {},
  query: Record<string, string> = {},
) {
  return { method, body, headers, query } as any;
}

function makeRes() {
  const res = {
    _status: 200,
    _body: null as unknown,
    status(code: number) { this._status = code; return this; },
    json(body: unknown) { this._body = body; return this; },
  };
  return res;
}

beforeEach(() => vi.clearAllMocks());

// ── GET /bookings/slots ───────────────────────────────────────────────────────
describe("GET /bookings/slots", () => {
  it("returns 400 when date param is missing", async () => {
    const req = makeReq("GET", {}, {}, { facility: "box" });
    const res = makeRes();
    await handleBookings(req, res, ["slots"]);
    expect(res._status).toBe(400);
  });

  it("returns 400 when facility param is missing", async () => {
    const req = makeReq("GET", {}, {}, { date: "2025-12-01" });
    const res = makeRes();
    await handleBookings(req, res, ["slots"]);
    expect(res._status).toBe(400);
  });

  it("returns empty bookedSlots array when no bookings exist for the date", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));
    const req = makeReq("GET", {}, {}, { date: "2025-12-01", facility: "box" });
    const res = makeRes();
    await handleBookings(req, res, ["slots"]);
    expect(res._status).toBe(200);
    expect((res._body as any).bookedSlots).toEqual([]);
  });

  it("returns booked slots for confirmed bookings on the given date", async () => {
    // One confirmed booking for "box" from 06:00 AM, 2h duration
    const existingBooking = {
      id: 1, ref: "PIR001", facility: "box", date: "2025-12-01",
      slot: "06:00 AM", duration: 2, status: "confirmed",
    };
    mockDb.select.mockImplementationOnce(() => mockDb._chain([existingBooking]));

    const req = makeReq("GET", {}, {}, { date: "2025-12-01", facility: "box" });
    const res = makeRes();
    await handleBookings(req, res, ["slots"]);
    const { bookedSlots } = res._body as any;
    expect(bookedSlots).toContain("06:00 AM");
    expect(bookedSlots).toContain("07:00 AM");
  });

  it("does NOT include pending_payment bookings in booked slots", async () => {
    const pendingBooking = {
      id: 2, ref: "PIR002", facility: "turf", date: "2025-12-01",
      slot: "09:00 AM", duration: 1, status: "pending_payment",
    };
    mockDb.select.mockImplementationOnce(() => mockDb._chain([pendingBooking]));

    const req = makeReq("GET", {}, {}, { date: "2025-12-01", facility: "turf" });
    const res = makeRes();
    await handleBookings(req, res, ["slots"]);
    expect((res._body as any).bookedSlots).not.toContain("09:00 AM");
  });

  it("does NOT include slots from other facilities", async () => {
    const boxBooking = {
      id: 3, ref: "PIR003", facility: "box", date: "2025-12-01",
      slot: "10:00 AM", duration: 1, status: "confirmed",
    };
    mockDb.select.mockImplementationOnce(() => mockDb._chain([boxBooking]));

    const req = makeReq("GET", {}, {}, { date: "2025-12-01", facility: "turf" }); // different facility
    const res = makeRes();
    await handleBookings(req, res, ["slots"]);
    expect((res._body as any).bookedSlots).not.toContain("10:00 AM");
  });
});

// ── GET /bookings (admin list) ────────────────────────────────────────────────
describe("GET /bookings", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("GET");
    const res = makeRes();
    await handleBookings(req, res, []);
    expect(res._status).toBe(401);
  });

  it("returns all bookings as an array for admin", async () => {
    const rows = [{ id: 1, ref: "PIR001", status: "confirmed" }];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const req = makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleBookings(req, res, []);
    expect(res._status).toBe(200);
    expect(Array.isArray(res._body)).toBe(true);
  });

  it("filters by date when date query param is provided", async () => {
    const rows = [{ id: 2, ref: "PIR002", date: "2025-12-25", status: "confirmed" }];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const req = makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` }, { date: "2025-12-25" });
    const res = makeRes();
    await handleBookings(req, res, []);
    expect(res._status).toBe(200);
  });
});

// ── POST /bookings — cash payment (no Razorpay) ───────────────────────────────
describe("POST /bookings (cash payment)", () => {
  it("creates booking immediately without Razorpay for cash payment", async () => {
    // No conflicts (confirmed bookings = none)
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));
    // Insert returns new row
    const newRow = { id: 10, ref: "PIR1234ABCD", status: "confirmed", total: 1500 };
    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newRow]) }),
    }));

    const req = makeReq(
      "POST",
      {
        facility: "box", facilityName: "Batting Box",
        date: "2025-12-01", slot: "08:00 AM", duration: 1,
        rate: 1500, total: 1500, name: "Rahul", phone: "9876543210",
        paymentMethod: "cash",
      },
      { "x-forwarded-for": "5.5.5.5" },
    );
    const res = makeRes();
    await handleBookings(req, res, []);
    expect(res._status).toBe(201);
    expect((res._body as any).ref).toBeTruthy();
  });

  it("returns 409 when requested slot conflicts with a confirmed booking", async () => {
    const conflictingBooking = {
      id: 1, ref: "PIR_CONFLICT", facility: "box",
      slot: "08:00 AM", duration: 2, status: "confirmed", date: "2025-12-01",
    };
    mockDb.select.mockImplementationOnce(() => mockDb._chain([conflictingBooking]));

    const req = makeReq(
      "POST",
      {
        facility: "box", facilityName: "Batting Box",
        date: "2025-12-01", slot: "09:00 AM", duration: 1, // overlaps with 08:00–09:00 AM
        rate: 1500, total: 1500, name: "Amit", phone: "9876543211",
        paymentMethod: "cash",
      },
      { "x-forwarded-for": "5.5.5.5" },
    );
    const res = makeRes();
    await handleBookings(req, res, []);
    expect(res._status).toBe(409);
    expect((res._body as any).error).toMatch(/already booked/i);
  });

  it("rejects booking with missing required fields", async () => {
    const req = makeReq("POST", { name: "Rahul" }, { "x-forwarded-for": "5.5.5.5" });
    const res = makeRes();
    await expect(handleBookings(req, res, [])).rejects.toThrow(); // Zod throws
  });
});

// ── PATCH /bookings/:id/mark-paid ────────────────────────────────────────────
describe("PATCH /bookings/:id/mark-paid", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("PATCH", {});
    const res = makeRes();
    await handleBookings(req, res, ["5", "mark-paid"]);
    expect(res._status).toBe(401);
  });

  it("sets status to confirmed and stores the payment reference", async () => {
    let capturedSet: Record<string, unknown> = {};
    mockDb.update.mockImplementationOnce(() => ({
      set: vi.fn().mockImplementation((data: any) => {
        capturedSet = data;
        return {
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{ id: 5, status: "confirmed", razorpayPaymentId: "UPI-REF-789" }]),
        };
      }),
    }));

    const req = makeReq(
      "PATCH",
      { note: "UPI-REF-789" },
      { authorization: `Bearer ${adminToken()}` },
    );
    const res = makeRes();
    await handleBookings(req, res, ["5", "mark-paid"]);
    expect(res._status).toBe(200);
    expect(capturedSet.status).toBe("confirmed");
    expect(capturedSet.razorpayPaymentId).toBe("UPI-REF-789");
  });

  it("defaults razorpayPaymentId to 'CASH' when no note is provided", async () => {
    let capturedSet: Record<string, unknown> = {};
    mockDb.update.mockImplementationOnce(() => ({
      set: vi.fn().mockImplementation((data: any) => {
        capturedSet = data;
        return {
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([{ id: 5, status: "confirmed", razorpayPaymentId: "CASH" }]),
        };
      }),
    }));

    const req = makeReq("PATCH", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleBookings(req, res, ["5", "mark-paid"]);
    expect(capturedSet.razorpayPaymentId).toBe("CASH");
  });
});

// ── PATCH /bookings/:id/status ───────────────────────────────────────────────
describe("PATCH /bookings/:id/status", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("PATCH", { status: "cancelled" });
    const res = makeRes();
    await handleBookings(req, res, ["3", "status"]);
    expect(res._status).toBe(401);
  });

  it("accepts all valid status values", async () => {
    const validStatuses = ["pending_payment", "confirmed", "cancelled", "refunded"];
    for (const status of validStatuses) {
      mockDb.update.mockImplementationOnce(() => mockDb._chain([{ id: 3, status }]));
      const req = makeReq("PATCH", { status }, { authorization: `Bearer ${adminToken()}` });
      const res = makeRes();
      await handleBookings(req, res, ["3", "status"]);
      expect(res._status).toBe(200);
    }
  });

  it("rejects invalid status values", async () => {
    const req = makeReq("PATCH", { status: "BOGUS" }, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await expect(handleBookings(req, res, ["3", "status"])).rejects.toThrow();
  });
});

// ── DELETE /bookings/cleanup ─────────────────────────────────────────────────
describe("DELETE /bookings/cleanup", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("DELETE");
    const res = makeRes();
    await handleBookings(req, res, ["cleanup"]);
    expect(res._status).toBe(401);
  });

  it("deletes old bookings and reports count", async () => {
    const deletedRows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    mockDb.delete.mockImplementationOnce(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue(deletedRows),
    }));

    const req = makeReq("DELETE", {}, { authorization: `Bearer ${adminToken()}` }, { days: "30" });
    const res = makeRes();
    await handleBookings(req, res, ["cleanup"]);
    expect(res._status).toBe(200);
    expect((res._body as any).deleted).toBe(3);
  });

  it("defaults to 30 days when no days param is provided", async () => {
    mockDb.delete.mockImplementationOnce(() => ({
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([]),
    }));

    const req = makeReq("DELETE", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleBookings(req, res, ["cleanup"]);
    expect(res._status).toBe(200);
    // cutoff should be ~30 days ago
    const { cutoff } = res._body as any;
    const cutoffDate = new Date(cutoff);
    const daysAgo = (Date.now() - cutoffDate.getTime()) / (1000 * 60 * 60 * 24);
    expect(daysAgo).toBeCloseTo(30, 0);
  });
});
