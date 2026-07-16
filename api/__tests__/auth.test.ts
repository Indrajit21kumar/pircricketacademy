/**
 * Unit / integration tests for the Auth handler (POST /auth/login, POST /auth/setup).
 * The DB and JWT_SECRET are mocked so no real credentials or DB are needed.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ── hoist: set env vars & build mock db BEFORE the handler module is imported ──
const { mockDb } = vi.hoisted(() => {
  process.env.JWT_SECRET = "test-super-secret-key-at-least-32-chars";
  process.env.DATABASE_URL = "postgresql://mock";

  const chain = (data: unknown[] = []) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue(data),
    orderBy: vi.fn().mockResolvedValue(data),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(data),
  });

  const mockDb = {
    select: vi.fn().mockReturnValue(chain()),
    insert: vi.fn().mockReturnValue(chain()),
    update: vi.fn().mockReturnValue(chain()),
    delete: vi.fn().mockReturnValue(chain()),
  };
  return { mockDb };
});

vi.mock("../_db.js", () => ({ db: mockDb }));

import { handleAuth } from "../_handlers.js";

// ── Helpers ─────────────────────────────────────────────────────────────────
function makeReq(
  method: string,
  body: Record<string, unknown> = {},
  headers: Record<string, string> = {},
) {
  return {
    method,
    body,
    headers: { "x-forwarded-for": "1.2.3.4", ...headers },
    query: {},
  } as any;
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

async function hashPw(pw: string) {
  return bcrypt.hash(pw, 1); // cost 1 for test speed
}

beforeEach(() => {
  vi.clearAllMocks();

  // Reset brute-force state between tests by calling successful auth
  // (the module-level map persists, but we control IPs per test)
});

// ── POST /auth/setup ──────────────────────────────────────────────────────────
describe("POST /auth/setup", () => {
  it("returns 400 when password is shorter than 8 characters", async () => {
    const req = makeReq("POST", { password: "short" });
    const res = makeRes();
    await handleAuth(req, res, ["setup"]);
    expect(res._status).toBe(400);
    expect((res._body as any).error).toMatch(/8 characters/);
  });

  it("returns 409 when admin already exists", async () => {
    // Mock: user found
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{ id: 1, username: "admin" }]),
    });
    const req = makeReq("POST", { password: "longpassword123" });
    const res = makeRes();
    await handleAuth(req, res, ["setup"]);
    expect(res._status).toBe(409);
    expect((res._body as any).error).toMatch(/already exists/);
  });

  it("creates admin and returns 201 when no admin exists", async () => {
    // First select returns empty (no existing admin)
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    });
    // Insert succeeds
    mockDb.insert.mockReturnValueOnce({
      values: vi.fn().mockResolvedValue([]),
    });

    const req = makeReq("POST", { password: "validpassword123" });
    const res = makeRes();
    await handleAuth(req, res, ["setup"]);
    expect(res._status).toBe(201);
    expect((res._body as any).ok).toBe(true);
  });
});

// ── POST /auth/login ──────────────────────────────────────────────────────────
describe("POST /auth/login", () => {
  const TEST_IP = "10.0.0.1"; // unique IP per describe block to avoid cross-test brute-force state

  it("returns 401 when username does not exist", async () => {
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([]),
    });
    const req = makeReq("POST", { username: "ghost", password: "any" }, { "x-forwarded-for": TEST_IP });
    const res = makeRes();
    await handleAuth(req, res, ["login"]);
    expect(res._status).toBe(401);
    expect((res._body as any).error).toMatch(/Invalid credentials/);
  });

  it("returns 401 when password is wrong", async () => {
    const ip = "10.0.0.2";
    const hash = await hashPw("correct-password");
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{
        id: 1, username: "admin", passwordHash: hash, role: "admin", name: "Test",
      }]),
    });
    const req = makeReq("POST", { username: "admin", password: "wrong-password" }, { "x-forwarded-for": ip });
    const res = makeRes();
    await handleAuth(req, res, ["login"]);
    expect(res._status).toBe(401);
  });

  it("returns 200 with token and user info on valid credentials", async () => {
    const ip = "10.0.0.3";
    const hash = await hashPw("correct-password");
    const mockUser = { id: 1, username: "admin", passwordHash: hash, role: "admin", name: "Indrajit Kumar" };
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([mockUser]),
    });
    const req = makeReq("POST", { username: "admin", password: "correct-password" }, { "x-forwarded-for": ip });
    const res = makeRes();
    await handleAuth(req, res, ["login"]);
    expect(res._status).toBe(200);
    const body = res._body as any;
    expect(body.token).toBeTruthy();
    expect(body.user.username).toBe("admin");
    expect(body.user.role).toBe("admin");
    expect(body.user.passwordHash).toBeUndefined(); // password hash must NOT be returned
  });

  it("JWT token contains correct claims", async () => {
    const ip = "10.0.0.4";
    const hash = await hashPw("testpass123");
    mockDb.select.mockReturnValueOnce({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockResolvedValue([{
        id: 42, username: "admin", passwordHash: hash, role: "admin", name: "Coach",
      }]),
    });
    const req = makeReq("POST", { username: "admin", password: "testpass123" }, { "x-forwarded-for": ip });
    const res = makeRes();
    await handleAuth(req, res, ["login"]);
    const token = (res._body as any).token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    expect(decoded.id).toBe(42);
    expect(decoded.username).toBe("admin");
    expect(decoded.role).toBe("admin");
  });

  it("returns 429 after 5 consecutive failed attempts from same IP", async () => {
    const ip = "10.0.0.99";
    // 5 failed attempts with wrong password
    for (let i = 0; i < 5; i++) {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      });
      const req = makeReq("POST", { username: "nobody", password: "wrong" }, { "x-forwarded-for": ip });
      const res = makeRes();
      await handleAuth(req, res, ["login"]);
    }
    // 6th attempt — now locked
    const req = makeReq("POST", { username: "admin", password: "any" }, { "x-forwarded-for": ip });
    const res = makeRes();
    await handleAuth(req, res, ["login"]);
    expect(res._status).toBe(429);
    expect((res._body as any).error).toMatch(/Too many failed attempts/);
  });

  it("returns 404 for unknown sub-route", async () => {
    const req = makeReq("POST", {});
    const res = makeRes();
    await handleAuth(req, res, ["unknown-route"]);
    expect(res._status).toBe(404);
  });
});
