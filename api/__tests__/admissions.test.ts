/**
 * Tests for the Admissions handler — GET, PATCH status, PATCH mark-paid, DELETE.
 * POST (which creates a Razorpay order) requires an external API call and is
 * covered separately in the integration tests.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";

// ── env + db mock (must be before handler import) ───────────────────────────
const { mockDb } = vi.hoisted(() => {
  process.env.JWT_SECRET = "test-super-secret-key-at-least-32-chars";
  process.env.DATABASE_URL = "postgresql://mock";

  // Thenable chain: every method returns `this`, which resolves to `data` on await
  function chain(data: unknown[] = []) {
    const obj: Record<string, unknown> & { then: Function } = {
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

import { handleAdmissions } from "../_handlers.js";

// ── helpers ──────────────────────────────────────────────────────────────────
const SECRET = process.env.JWT_SECRET!;

function adminToken() {
  return jwt.sign({ id: 1, username: "admin", role: "admin" }, SECRET, { expiresIn: "1h" });
}

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

// ── GET /admissions ───────────────────────────────────────────────────────────
describe("GET /admissions", () => {
  it("returns 401 without an Authorization header", async () => {
    const req = makeReq("GET");
    const res = makeRes();
    await handleAdmissions(req, res, []);
    expect(res._status).toBe(401);
  });

  it("returns 401 with a malformed token", async () => {
    const req = makeReq("GET", {}, { authorization: "Bearer not-a-real-token" });
    const res = makeRes();
    await handleAdmissions(req, res, []);
    expect(res._status).toBe(401);
  });

  it("returns 403 when a coach token is used (coaches cannot view admissions)", async () => {
    const coachToken = jwt.sign({ id: 2, username: "coach1", role: "coach" }, SECRET, { expiresIn: "1h" });
    const req = makeReq("GET", {}, { authorization: `Bearer ${coachToken}` });
    const res = makeRes();
    await handleAdmissions(req, res, []);
    expect(res._status).toBe(403);
  });

  it("returns 200 for receptionist role (front desk can view admissions)", async () => {
    const rows = [{ id: 1, studentName: "Rahul", status: "new" }];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));
    const recToken = jwt.sign({ id: 3, username: "front.desk", role: "receptionist" }, SECRET, { expiresIn: "1h" });
    const req = makeReq("GET", {}, { authorization: `Bearer ${recToken}` });
    const res = makeRes();
    await handleAdmissions(req, res, []);
    expect(res._status).toBe(200);
    expect(Array.isArray(res._body)).toBe(true);
  });

  it("returns 200 and an array with a valid admin token", async () => {
    const rows = [{ id: 1, studentName: "Rahul", status: "new" }];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const req = makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleAdmissions(req, res, []);
    expect(res._status).toBe(200);
    expect(Array.isArray(res._body)).toBe(true);
  });

  it("returns list in reverse-creation order (newest first)", async () => {
    const rows = [
      { id: 1, studentName: "First",  createdAt: new Date("2024-01-01") },
      { id: 2, studentName: "Second", createdAt: new Date("2024-02-01") },
    ];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const req = makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleAdmissions(req, res, []);
    const body = res._body as any[];
    // Handler does .reverse() — last element should be first
    expect(body[0].studentName).toBe("Second");
  });
});

// ── PATCH /admissions/:id/status ─────────────────────────────────────────────
describe("PATCH /admissions/:id/status", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("PATCH", { status: "joined" });
    const res = makeRes();
    await handleAdmissions(req, res, ["1", "status"]);
    expect(res._status).toBe(401);
  });

  it("rejects invalid status values", async () => {
    const req = makeReq("PATCH", { status: "INVALID_STATUS" }, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await expect(handleAdmissions(req, res, ["1", "status"])).rejects.toThrow(); // Zod throws
  });

  it("accepts all valid status transitions", async () => {
    const validStatuses = ["new", "trial_scheduled", "joined", "rejected", "withdrawn"];
    for (const status of validStatuses) {
      const updatedRow = { id: 1, status };
      mockDb.update.mockImplementationOnce(() => mockDb._chain([updatedRow]));

      const req = makeReq("PATCH", { status }, { authorization: `Bearer ${adminToken()}` });
      const res = makeRes();
      await handleAdmissions(req, res, ["1", "status"]);
      expect(res._status).toBe(200);
    }
  });
});

// ── PATCH /admissions/:id/mark-paid ─────────────────────────────────────────
describe("PATCH /admissions/:id/mark-paid", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("PATCH", { amount: 5000 });
    const res = makeRes();
    await handleAdmissions(req, res, ["1", "mark-paid"]);
    expect(res._status).toBe(401);
  });

  it("marks admission as paid with amount and note", async () => {
    const updatedRow = { id: 1, paymentStatus: "paid", totalPaid: 5000, razorpayPaymentId: "CASH/REF-123" };
    mockDb.update.mockImplementationOnce(() => mockDb._chain([updatedRow]));

    const req = makeReq(
      "PATCH",
      { amount: 5000, note: "CASH/REF-123" },
      { authorization: `Bearer ${adminToken()}` },
    );
    const res = makeRes();
    await handleAdmissions(req, res, ["1", "mark-paid"]);
    expect(res._status).toBe(200);
    expect((res._body as any).paymentStatus).toBe("paid");
  });

  it("stores 'CASH' as razorpayPaymentId when no note is provided", async () => {
    let capturedSet: Record<string, unknown> = {};
    mockDb.update.mockImplementationOnce(() => ({
      set: vi.fn().mockImplementation((data: any) => {
        capturedSet = data;
        return { where: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([{ id: 1, ...data }]) };
      }),
    }));

    const req = makeReq("PATCH", { amount: 5000 }, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleAdmissions(req, res, ["1", "mark-paid"]);
    expect(capturedSet.razorpayPaymentId).toBe("CASH");
  });

  it("requires a positive amount", async () => {
    const req = makeReq("PATCH", { amount: -100 }, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await expect(handleAdmissions(req, res, ["1", "mark-paid"])).rejects.toThrow();
  });
});

// ── DELETE /admissions/:id ───────────────────────────────────────────────────
describe("DELETE /admissions/:id", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("DELETE");
    const res = makeRes();
    await handleAdmissions(req, res, ["5"]);
    expect(res._status).toBe(401);
  });

  it("deletes the record and returns ok with admin auth", async () => {
    mockDb.delete.mockImplementationOnce(() => ({
      where: vi.fn().mockResolvedValue([]),
    }));
    const req = makeReq("DELETE", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleAdmissions(req, res, ["5"]);
    expect(res._status).toBe(200);
    expect((res._body as any).ok).toBe(true);
    expect(mockDb.delete).toHaveBeenCalledOnce();
  });
});

// ── Unmatched method ─────────────────────────────────────────────────────────
describe("unmatched method", () => {
  it("returns 405 for unsupported HTTP methods", async () => {
    const req = makeReq("PUT");
    const res = makeRes();
    await handleAdmissions(req, res, []);
    expect(res._status).toBe(405);
  });
});
