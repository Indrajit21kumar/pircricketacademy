/**
 * Unit tests for the Users handler — GET, POST, DELETE, PATCH reset-password.
 * Covers: admin-only auth guard, receptionist one-per-system limit,
 * username uniqueness, and role enum validation.
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

import { handleUsers } from "../_handlers.js";

const SECRET = process.env.JWT_SECRET!;
const adminToken    = () => jwt.sign({ id: 1, username: "admin", role: "admin" }, SECRET, { expiresIn: "1h" });
const coachToken    = () => jwt.sign({ id: 2, username: "coach1", role: "coach" }, SECRET, { expiresIn: "1h" });
const receptionToken= () => jwt.sign({ id: 3, username: "rec1", role: "receptionist" }, SECRET, { expiresIn: "1h" });

function makeReq(
  method: string,
  body: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  return { method, body, headers, query: {} } as any;
}

function makeRes() {
  return {
    _status: 200,
    _body: null as unknown,
    status(code: number) { this._status = code; return this; },
    json(body: unknown) { this._body = body; return this; },
  };
}

beforeEach(() => vi.clearAllMocks());

// ── Auth guard — admin only ───────────────────────────────────────────────────
describe("Users handler — admin-only guard", () => {
  it("returns 401 with no token", async () => {
    const res = makeRes();
    await handleUsers(makeReq("GET"), res, []);
    expect(res._status).toBe(401);
  });

  it("returns 403 for coach role", async () => {
    const res = makeRes();
    await handleUsers(makeReq("GET", {}, { authorization: `Bearer ${coachToken()}` }), res, []);
    expect(res._status).toBe(403);
  });

  it("returns 403 for receptionist role", async () => {
    const res = makeRes();
    await handleUsers(makeReq("GET", {}, { authorization: `Bearer ${receptionToken()}` }), res, []);
    expect(res._status).toBe(403);
  });
});

// ── GET /users ────────────────────────────────────────────────────────────────
describe("GET /users", () => {
  it("returns array of users for admin", async () => {
    const rows = [
      { id: 1, username: "admin", role: "admin", name: "Indrajit", plainPassword: null, createdAt: new Date() },
      { id: 2, username: "coach.ravi", role: "coach", name: "Ravi", plainPassword: "abc123", createdAt: new Date() },
    ];
    mockDb.select.mockImplementationOnce(() => mockDb._chain(rows));

    const res = makeRes();
    await handleUsers(makeReq("GET", {}, { authorization: `Bearer ${adminToken()}` }), res, []);
    expect(res._status).toBe(200);
    expect(Array.isArray(res._body)).toBe(true);
  });
});

// ── POST /users — create account ──────────────────────────────────────────────
describe("POST /users", () => {
  it("creates a coach account", async () => {
    // username uniqueness check → empty (no conflict)
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));
    const newUser = { id: 5, username: "coach.ravi", role: "coach", name: "Ravi", plainPassword: "pass123", createdAt: new Date() };
    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newUser]) }),
    }));

    const res = makeRes();
    await handleUsers(
      makeReq("POST", { username: "coach.ravi", password: "pass123", name: "Ravi", role: "coach" }, { authorization: `Bearer ${adminToken()}` }),
      res,
      [],
    );
    expect(res._status).toBe(201);
    expect((res._body as any).role).toBe("coach");
  });

  it("returns 409 when username is already taken", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([{ id: 2, username: "coach.ravi" }]));

    const res = makeRes();
    await handleUsers(
      makeReq("POST", { username: "coach.ravi", password: "pass123", name: "Ravi", role: "coach" }, { authorization: `Bearer ${adminToken()}` }),
      res,
      [],
    );
    expect(res._status).toBe(409);
    expect((res._body as any).error).toMatch(/already exists/i);
  });

  it("creates a receptionist account when none exists", async () => {
    // username uniqueness check → empty
    mockDb.select
      .mockImplementationOnce(() => mockDb._chain([]))   // username check
      .mockImplementationOnce(() => mockDb._chain([]));  // receptionist role check
    const newUser = { id: 6, username: "front.desk", role: "receptionist", name: "Seema", plainPassword: "rec123", createdAt: new Date() };
    mockDb.insert.mockImplementationOnce(() => ({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newUser]) }),
    }));

    const res = makeRes();
    await handleUsers(
      makeReq("POST", { username: "front.desk", password: "rec123", name: "Seema", role: "receptionist" }, { authorization: `Bearer ${adminToken()}` }),
      res,
      [],
    );
    expect(res._status).toBe(201);
    expect((res._body as any).role).toBe("receptionist");
  });

  it("returns 409 when a receptionist account already exists", async () => {
    mockDb.select
      .mockImplementationOnce(() => mockDb._chain([]))   // username check — no conflict
      .mockImplementationOnce(() => mockDb._chain([{ id: 3, username: "front.desk", role: "receptionist" }])); // existing receptionist

    const res = makeRes();
    await handleUsers(
      makeReq("POST", { username: "new.rec", password: "pass456", name: "Geeta", role: "receptionist" }, { authorization: `Bearer ${adminToken()}` }),
      res,
      [],
    );
    expect(res._status).toBe(409);
    expect((res._body as any).error).toMatch(/receptionist account already exists/i);
  });

  it("rejects an invalid role", async () => {
    const res = makeRes();
    await expect(
      handleUsers(
        makeReq("POST", { username: "x", password: "pass123", name: "X", role: "superuser" }, { authorization: `Bearer ${adminToken()}` }),
        res,
        [],
      ),
    ).rejects.toThrow(); // Zod validation error
  });

  it("rejects a password shorter than 6 characters", async () => {
    const res = makeRes();
    await expect(
      handleUsers(
        makeReq("POST", { username: "user1", password: "pw", name: "User", role: "coach" }, { authorization: `Bearer ${adminToken()}` }),
        res,
        [],
      ),
    ).rejects.toThrow();
  });
});

// ── DELETE /users/:id ─────────────────────────────────────────────────────────
describe("DELETE /users/:id", () => {
  it("deletes the account and returns ok", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([{ id: 5, username: "coach.ravi" }]));
    mockDb.delete.mockImplementationOnce(() => ({ where: vi.fn().mockResolvedValue([]) }));

    const res = makeRes();
    await handleUsers(makeReq("DELETE", {}, { authorization: `Bearer ${adminToken()}` }), res, ["5"]);
    expect(res._status).toBe(200);
    expect((res._body as any).ok).toBe(true);
  });

  it("refuses to delete the super-admin account", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([{ id: 1, username: "admin" }]));

    const res = makeRes();
    await handleUsers(makeReq("DELETE", {}, { authorization: `Bearer ${adminToken()}` }), res, ["1"]);
    expect(res._status).toBe(403);
    expect((res._body as any).error).toMatch(/Cannot delete super admin/i);
  });
});

// ── PATCH /users/:id/reset-password ──────────────────────────────────────────
describe("PATCH /users/:id/reset-password", () => {
  it("resets password and returns updated user (without hash)", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([{ id: 5, username: "coach.ravi", role: "coach" }]));
    const updated = { id: 5, username: "coach.ravi", role: "coach", name: "Ravi", plainPassword: "newpass", createdAt: new Date() };
    mockDb.update.mockImplementationOnce(() => ({
      set: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([updated]),
    }));

    const res = makeRes();
    await handleUsers(
      makeReq("PATCH", { password: "newpass" }, { authorization: `Bearer ${adminToken()}` }),
      res,
      ["5", "reset-password"],
    );
    expect(res._status).toBe(200);
    expect((res._body as any).username).toBe("coach.ravi");
    expect((res._body as any).passwordHash).toBeUndefined();
  });

  it("blocks resetting the super-admin password via this endpoint", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([{ id: 1, username: "admin", role: "admin" }]));

    const res = makeRes();
    await handleUsers(
      makeReq("PATCH", { password: "newpass123" }, { authorization: `Bearer ${adminToken()}` }),
      res,
      ["1", "reset-password"],
    );
    expect(res._status).toBe(403);
  });

  it("returns 404 when user id does not exist", async () => {
    mockDb.select.mockImplementationOnce(() => mockDb._chain([]));

    const res = makeRes();
    await handleUsers(
      makeReq("PATCH", { password: "newpass123" }, { authorization: `Bearer ${adminToken()}` }),
      res,
      ["999", "reset-password"],
    );
    expect(res._status).toBe(404);
  });
});
