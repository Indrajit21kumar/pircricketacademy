/**
 * Tests for Inquiries handler (GET, POST, PATCH /status) and Follow-ups handler.
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

import { handleInquiries, handleFollowUps } from "../_handlers.js";

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

// ── GET /inquiries ────────────────────────────────────────────────────────────
describe("GET /inquiries", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("GET");
    const res = makeRes();
    await handleInquiries(req, res, []);
    expect(res._status).toBe(401);
  });

  it("returns 403 for a coach token", async () => {
    const coachToken = jwt.sign({ id: 2, role: "coach" }, SECRET, { expiresIn: "1h" });
    const req = makeReq("GET", {}, { authorization: `Bearer ${coachToken}` });
    const res = makeRes();
    await handleInquiries(req, res, []);
    expect(res._status).toBe(403);
  });

  it("returns inquiries list (reversed) for admin", async () => {
    const rows = [
      { id: 1, name: "Parent A", createdAt: new Date("2024-01-01") },
      { id: 2, name: "Parent B", createdAt: new Date("2024-02-01") },
    ];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const req = makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleInquiries(req, res, []);
    expect(res._status).toBe(200);
    const body = res._body as any[];
    // Handler reverses the array — newest (id:2) comes first
    expect(body[0].id).toBe(2);
  });
});

// ── POST /inquiries (public endpoint) ────────────────────────────────────────
describe("POST /inquiries", () => {
  const validBody = {
    name: "Rakesh Singh",
    phone: "9876543210",
    childName: "Arjun Singh",
    ageGroup: "U12 (Under 12)",
    email: "rakesh@example.com",
    source: "Google",
    message: "Interested in trial session",
  };

  it("creates an inquiry and returns 201", async () => {
    const inserted = { id: 1, ...validBody, status: "new", createdAt: new Date() };
    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([inserted]) }),
    }));

    const req = makeReq("POST", validBody, { "x-forwarded-for": "1.2.3.4" });
    const res = makeRes();
    await handleInquiries(req, res, []);
    expect(res._status).toBe(201);
    expect((res._body as any).id).toBe(1);
  });

  it("rejects inquiry missing required 'name' field", async () => {
    const { name: _name, ...bodyWithoutName } = validBody;
    const req = makeReq("POST", bodyWithoutName);
    const res = makeRes();
    await expect(handleInquiries(req, res, [])).rejects.toThrow(); // Zod validation
  });

  it("rejects inquiry missing required 'phone' field", async () => {
    const { phone: _phone, ...bodyWithoutPhone } = validBody;
    const req = makeReq("POST", bodyWithoutPhone);
    const res = makeRes();
    await expect(handleInquiries(req, res, [])).rejects.toThrow();
  });

  it("rejects inquiry missing required 'childName' field", async () => {
    const { childName: _cn, ...bodyWithoutChild } = validBody;
    const req = makeReq("POST", bodyWithoutChild);
    const res = makeRes();
    await expect(handleInquiries(req, res, [])).rejects.toThrow();
  });

  it("rejects inquiry missing required 'ageGroup' field", async () => {
    const { ageGroup: _ag, ...bodyWithoutAge } = validBody;
    const req = makeReq("POST", bodyWithoutAge);
    const res = makeRes();
    await expect(handleInquiries(req, res, [])).rejects.toThrow();
  });

  it("accepts inquiry without optional fields (email, source, message)", async () => {
    const minimalBody = { name: "Ravi", phone: "9000000000", childName: "Karan", ageGroup: "U8 (Under 8)" };
    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 2, ...minimalBody }]) }),
    }));
    const req = makeReq("POST", minimalBody);
    const res = makeRes();
    await handleInquiries(req, res, []);
    expect(res._status).toBe(201);
  });
});

// ── PATCH /inquiries/:id/status ───────────────────────────────────────────────
describe("PATCH /inquiries/:id/status", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("PATCH", { status: "contacted" });
    const res = makeRes();
    await handleInquiries(req, res, ["1", "status"]);
    expect(res._status).toBe(401);
  });

  it("accepts all valid status values", async () => {
    const validStatuses = ["new", "contacted", "converted", "not_interested"];
    for (const status of validStatuses) {
      mockDb.update.mockImplementationOnce(() => mockDb._chain([{ id: 1, status }]));
      const req = makeReq("PATCH", { status }, { authorization: `Bearer ${adminToken()}` });
      const res = makeRes();
      await handleInquiries(req, res, ["1", "status"]);
      expect(res._status).toBe(200);
    }
  });

  it("rejects invalid status value", async () => {
    const req = makeReq("PATCH", { status: "DELETED" }, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await expect(handleInquiries(req, res, ["1", "status"])).rejects.toThrow();
  });
});

// ── unmatched method ──────────────────────────────────────────────────────────
describe("Inquiries unmatched method", () => {
  it("returns 405 for unsupported HTTP methods", async () => {
    const req = makeReq("DELETE");
    const res = makeRes();
    await handleInquiries(req, res, []);
    expect(res._status).toBe(405);
  });
});

// ── GET /follow-ups ───────────────────────────────────────────────────────────
describe("GET /follow-ups", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("GET");
    const res = makeRes();
    await handleFollowUps(req, res);
    expect(res._status).toBe(401);
  });

  it("returns all follow-ups for admin", async () => {
    const rows = [{ id: 1, inquiryId: 10, notes: "Called — interested", createdBy: "admin" }];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const req = makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleFollowUps(req, res);
    expect(res._status).toBe(200);
    expect(Array.isArray(res._body)).toBe(true);
  });

  it("filters by inquiryId when provided in query", async () => {
    const rows = [{ id: 1, inquiryId: 5, notes: "Sent details" }];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const req = makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` }, { inquiryId: "5" });
    const res = makeRes();
    await handleFollowUps(req, res);
    expect(res._status).toBe(200);
  });
});

// ── POST /follow-ups ──────────────────────────────────────────────────────────
describe("POST /follow-ups", () => {
  it("returns 401 without auth", async () => {
    const req = makeReq("POST", { inquiryId: 1, notes: "Test", createdBy: "admin" });
    const res = makeRes();
    await handleFollowUps(req, res);
    expect(res._status).toBe(401);
  });

  it("creates a follow-up note and returns 201", async () => {
    const inserted = { id: 1, inquiryId: 10, notes: "Called parent", createdBy: "admin" };
    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([inserted]) }),
    }));

    const req = makeReq(
      "POST",
      { inquiryId: 10, notes: "Called parent", createdBy: "admin" },
      { authorization: `Bearer ${adminToken()}` },
    );
    const res = makeRes();
    await handleFollowUps(req, res);
    expect(res._status).toBe(201);
    expect((res._body as any).notes).toBe("Called parent");
  });

  it("rejects follow-up with missing inquiryId", async () => {
    const req = makeReq(
      "POST",
      { notes: "No ID here", createdBy: "admin" },
      { authorization: `Bearer ${adminToken()}` },
    );
    const res = makeRes();
    await expect(handleFollowUps(req, res)).rejects.toThrow();
  });

  it("rejects follow-up with empty notes", async () => {
    const req = makeReq(
      "POST",
      { inquiryId: 1, notes: "", createdBy: "admin" },
      { authorization: `Bearer ${adminToken()}` },
    );
    const res = makeRes();
    await expect(handleFollowUps(req, res)).rejects.toThrow();
  });

  it("rejects follow-up with missing createdBy", async () => {
    const req = makeReq(
      "POST",
      { inquiryId: 1, notes: "Some notes" },
      { authorization: `Bearer ${adminToken()}` },
    );
    const res = makeRes();
    await expect(handleFollowUps(req, res)).rejects.toThrow();
  });
});

// ── unmatched method ──────────────────────────────────────────────────────────
describe("Follow-ups unmatched method", () => {
  it("returns 405 for unsupported HTTP methods", async () => {
    const req = makeReq("DELETE", {}, { authorization: `Bearer ${adminToken()}` });
    const res = makeRes();
    await handleFollowUps(req, res);
    expect(res._status).toBe(405);
  });
});
