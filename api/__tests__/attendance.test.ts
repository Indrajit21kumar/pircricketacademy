/**
 * Unit tests for the Attendance handler — GET and POST.
 * Covers: auth guards (admin / coach / receptionist allowed, others blocked),
 * duplicate detection, and successful marking.
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
      leftJoin: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockResolvedValue(data),
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

import { handleAttendance } from "../_handlers.js";

const SECRET = process.env.JWT_SECRET!;

const adminToken     = () => jwt.sign({ id: 1, username: "admin",      role: "admin"        }, SECRET, { expiresIn: "1h" });
const coachToken     = () => jwt.sign({ id: 2, username: "coach1",     role: "coach"        }, SECRET, { expiresIn: "1h" });
const receptionToken = () => jwt.sign({ id: 3, username: "front.desk", role: "receptionist" }, SECRET, { expiresIn: "1h" });
const studentToken   = () => jwt.sign({ id: 4, username: "student1",   role: "student"      }, SECRET, { expiresIn: "1h" });

function makeReq(
  method: string,
  body: Record<string, unknown> = {},
  headers: Record<string, string> = {},
  query: Record<string, string> = {},
) {
  return { method, body, headers, query } as any;
}

function makeRes() {
  return {
    _status: 200,
    _body: null as unknown,
    status(code: number) { this._status = code; return this; },
    json(body: unknown) { this._body = body; return this; },
  };
}

// Reset mock implementations (not just calls) before each test
beforeEach(() => {
  vi.clearAllMocks();
  // Restore default chain so uncovered calls don't return undefined
  mockDb.select.mockImplementation(mockDb._chain);
  mockDb.insert.mockImplementation(mockDb._chain);
  mockDb.update.mockImplementation(mockDb._chain);
  mockDb.delete.mockImplementation(mockDb._chain);
});

// ── GET /attendance — auth guard ──────────────────────────────────────────────
describe("GET /attendance — auth", () => {
  it("returns 401 with no token", async () => {
    const res = makeRes();
    await handleAttendance(makeReq("GET"), res);
    expect(res._status).toBe(401);
  });

  it("returns 403 for student role", async () => {
    const res = makeRes();
    await handleAttendance(makeReq("GET", {}, { authorization: `Bearer ${studentToken()}` }), res);
    expect(res._status).toBe(403);
  });

  it("allows admin to GET attendance", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));
    const res = makeRes();
    await handleAttendance(makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` }), res);
    expect(res._status).toBe(200);
    expect(Array.isArray(res._body)).toBe(true);
  });

  it("allows coach to GET attendance", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));
    const res = makeRes();
    await handleAttendance(makeReq("GET", {}, { authorization: `Bearer ${coachToken()}` }), res);
    expect(res._status).toBe(200);
  });

  it("allows receptionist to GET attendance", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));
    const res = makeRes();
    await handleAttendance(makeReq("GET", {}, { authorization: `Bearer ${receptionToken()}` }), res);
    expect(res._status).toBe(200);
  });

  it("filters by date when date query param is provided", async () => {
    const rows = [
      { record: { studentId: 1, sessionDate: "2025-01-01" }, student: null, batch: null },
      { record: { studentId: 2, sessionDate: "2025-01-02" }, student: null, batch: null },
    ];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const res = makeRes();
    await handleAttendance(
      makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` }, { date: "2025-01-01" }),
      res,
    );
    expect(res._status).toBe(200);
    const body = res._body as any[];
    expect(body.every(r => r.record.sessionDate === "2025-01-01")).toBe(true);
    expect(body).toHaveLength(1);
  });
});

// ── POST /attendance — auth guard ─────────────────────────────────────────────
describe("POST /attendance — auth", () => {
  const validBody = { qrToken: "abc", sessionDate: "2025-01-01", status: "present", markedBy: "Coach Ravi" };

  it("returns 401 with no token", async () => {
    const res = makeRes();
    await handleAttendance(makeReq("POST", validBody), res);
    expect(res._status).toBe(401);
  });

  it("returns 403 for student role", async () => {
    const res = makeRes();
    await handleAttendance(
      makeReq("POST", validBody, { authorization: `Bearer ${studentToken()}` }),
      res,
    );
    expect(res._status).toBe(403);
  });
});

// ── POST /attendance — business logic ─────────────────────────────────────────
describe("POST /attendance — business logic", () => {
  it("returns 404 when QR token does not match any student", async () => {
    // Student lookup returns empty
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));

    const res = makeRes();
    await handleAttendance(
      makeReq(
        "POST",
        { qrToken: "unknown-token", sessionDate: "2025-01-01", status: "present", markedBy: "Coach Ravi" },
        { authorization: `Bearer ${coachToken()}` },
      ),
      res,
    );
    expect(res._status).toBe(404);
    expect((res._body as any).error).toMatch(/not found/i);
  });

  it("returns 409 when attendance already marked for the same student and date", async () => {
    const student = { id: 10, name: "Rahul Kumar", qrToken: "valid-token" };
    const existingRecord = { studentId: 10, sessionDate: "2025-01-01", status: "present" };

    mockDb.select
      .mockImplementationOnce(() => mockDb._chain([student]))        // find by qrToken
      .mockImplementationOnce(() => mockDb._chain([existingRecord])) // duplicate check
      .mockImplementationOnce(() => mockDb._chain([student]));       // student name for 409 body

    const res = makeRes();
    await handleAttendance(
      makeReq(
        "POST",
        { qrToken: "valid-token", sessionDate: "2025-01-01", status: "present", markedBy: "Coach Ravi" },
        { authorization: `Bearer ${coachToken()}` },
      ),
      res,
    );
    expect(res._status).toBe(409);
    expect((res._body as any).error).toMatch(/already marked/i);
    expect((res._body as any).student?.name).toBe("Rahul Kumar");
  });

  it("marks attendance and returns 201 with student name on success", async () => {
    const student = { id: 10, name: "Arjun Singh", qrToken: "fresh-token" };
    const newRecord = { id: 1, studentId: 10, sessionDate: "2025-01-15", status: "present" };

    mockDb.select
      .mockImplementationOnce(() => mockDb._chain([student]))  // find by qrToken
      .mockImplementationOnce(() => mockDb._chain([]))         // no duplicate
      .mockImplementationOnce(() => mockDb._chain([student])); // student for response

    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newRecord]) }),
    }));

    const res = makeRes();
    await handleAttendance(
      makeReq(
        "POST",
        { qrToken: "fresh-token", sessionDate: "2025-01-15", status: "present", markedBy: "Coach Ravi" },
        { authorization: `Bearer ${coachToken()}` },
      ),
      res,
    );
    expect(res._status).toBe(201);
    expect((res._body as any).student?.name).toBe("Arjun Singh");
  });

  it("allows receptionist to mark attendance", async () => {
    const student = { id: 20, name: "Priya Sharma", qrToken: "rec-token" };
    const newRecord = { id: 5, studentId: 20, sessionDate: "2025-02-01", status: "present" };

    mockDb.select
      .mockImplementationOnce(() => mockDb._chain([student]))
      .mockImplementationOnce(() => mockDb._chain([]))
      .mockImplementationOnce(() => mockDb._chain([student]));

    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newRecord]) }),
    }));

    const res = makeRes();
    await handleAttendance(
      makeReq(
        "POST",
        { qrToken: "rec-token", sessionDate: "2025-02-01", status: "present", markedBy: "Reception" },
        { authorization: `Bearer ${receptionToken()}` },
      ),
      res,
    );
    expect(res._status).toBe(201);
    expect((res._body as any).student?.name).toBe("Priya Sharma");
  });

  it("accepts studentId directly without a QR token", async () => {
    const student = { id: 30, name: "Vikram Roy" };
    const newRecord = { id: 9, studentId: 30, sessionDate: "2025-03-01", status: "present" };

    mockDb.select
      .mockImplementationOnce(() => mockDb._chain([]))          // no duplicate
      .mockImplementationOnce(() => mockDb._chain([student]));  // student for response

    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newRecord]) }),
    }));

    const res = makeRes();
    await handleAttendance(
      makeReq(
        "POST",
        { studentId: 30, sessionDate: "2025-03-01", status: "present", markedBy: "Coach Ravi" },
        { authorization: `Bearer ${adminToken()}` },
      ),
      res,
    );
    expect(res._status).toBe(201);
  });

  it("returns 400 when neither qrToken nor studentId is provided", async () => {
    const res = makeRes();
    await handleAttendance(
      makeReq(
        "POST",
        { sessionDate: "2025-01-01", status: "present", markedBy: "Coach" },
        { authorization: `Bearer ${coachToken()}` },
      ),
      res,
    );
    expect(res._status).toBe(400);
  });

  it("rejects body missing required markedBy field", async () => {
    const res = makeRes();
    // Zod will throw synchronously for missing required field
    await expect(
      handleAttendance(
        makeReq("POST", { qrToken: "tok", sessionDate: "2025-01-01" }, { authorization: `Bearer ${coachToken()}` }),
        res,
      ),
    ).rejects.toThrow();
  });
});
