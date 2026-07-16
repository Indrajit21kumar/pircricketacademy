/**
 * Unit tests for the brute-force login-protection logic.
 * Mirrors checkBruteForce / recordFailedLogin / clearLoginAttempts in api/_handlers.ts.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";

// --- Replicated logic (mirrors api/_handlers.ts) ---
type Entry = { count: number; lockedUntil: number };
let loginAttempts: Record<string, Entry>;

function checkBruteForce(ip: string): void {
  const now = Date.now();
  const entry = loginAttempts[ip] || { count: 0, lockedUntil: 0 };
  if (entry.lockedUntil > now)
    throw Object.assign(new Error("Too many failed attempts. Try again in 15 minutes."), { status: 429 });
  loginAttempts[ip] = entry;
}

function recordFailedLogin(ip: string): void {
  const entry = loginAttempts[ip] || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= 5) entry.lockedUntil = Date.now() + 15 * 60 * 1000;
  loginAttempts[ip] = entry;
}

function clearLoginAttempts(ip: string): void {
  delete loginAttempts[ip];
}
// ---------------------------------------------------

beforeEach(() => {
  loginAttempts = {};
  vi.useRealTimers();
});

describe("checkBruteForce", () => {
  it("allows the first attempt with no prior history", () => {
    expect(() => checkBruteForce("1.2.3.4")).not.toThrow();
  });

  it("allows up to 4 failed attempts", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 4; i++) recordFailedLogin(ip);
    expect(() => checkBruteForce(ip)).not.toThrow();
  });

  it("locks the IP after exactly 5 failed attempts", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) recordFailedLogin(ip);
    expect(() => checkBruteForce(ip)).toThrow("Too many failed attempts");
  });

  it("throws a 429 error when locked", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) recordFailedLogin(ip);
    try {
      checkBruteForce(ip);
    } catch (e: any) {
      expect(e.status).toBe(429);
    }
  });

  it("treats different IPs independently", () => {
    const ipA = "1.1.1.1";
    const ipB = "2.2.2.2";
    for (let i = 0; i < 5; i++) recordFailedLogin(ipA);
    // ipA is locked, ipB should still be allowed
    expect(() => checkBruteForce(ipA)).toThrow();
    expect(() => checkBruteForce(ipB)).not.toThrow();
  });
});

describe("recordFailedLogin", () => {
  it("increments the attempt count", () => {
    const ip = "1.2.3.4";
    recordFailedLogin(ip);
    expect(loginAttempts[ip].count).toBe(1);
    recordFailedLogin(ip);
    expect(loginAttempts[ip].count).toBe(2);
  });

  it("sets lockedUntil only on the 5th failure", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 4; i++) {
      recordFailedLogin(ip);
      expect(loginAttempts[ip].lockedUntil).toBe(0);
    }
    recordFailedLogin(ip);
    expect(loginAttempts[ip].lockedUntil).toBeGreaterThan(Date.now());
  });

  it("sets lockedUntil approximately 15 minutes in the future", () => {
    const ip = "1.2.3.4";
    const before = Date.now();
    for (let i = 0; i < 5; i++) recordFailedLogin(ip);
    const diff = loginAttempts[ip].lockedUntil - before;
    expect(diff).toBeGreaterThanOrEqual(14 * 60 * 1000);
    expect(diff).toBeLessThanOrEqual(16 * 60 * 1000);
  });

  it("continues to increment count beyond 5 (does not reset)", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 7; i++) recordFailedLogin(ip);
    expect(loginAttempts[ip].count).toBe(7);
  });
});

describe("clearLoginAttempts", () => {
  it("removes the entry for the given IP", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) recordFailedLogin(ip);
    clearLoginAttempts(ip);
    expect(loginAttempts[ip]).toBeUndefined();
  });

  it("after clearing, checkBruteForce passes again", () => {
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) recordFailedLogin(ip);
    expect(() => checkBruteForce(ip)).toThrow();
    clearLoginAttempts(ip);
    expect(() => checkBruteForce(ip)).not.toThrow();
  });

  it("is a no-op for an IP with no record", () => {
    expect(() => clearLoginAttempts("9.9.9.9")).not.toThrow();
  });
});

describe("Lockout expiry", () => {
  it("allows login after the lockout window expires", () => {
    vi.useFakeTimers();
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) recordFailedLogin(ip);

    // Still locked
    expect(() => checkBruteForce(ip)).toThrow();

    // Advance time by 16 minutes
    vi.advanceTimersByTime(16 * 60 * 1000);
    expect(() => checkBruteForce(ip)).not.toThrow();
    vi.useRealTimers();
  });

  it("remains locked at 14 minutes (within the window)", () => {
    vi.useFakeTimers();
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) recordFailedLogin(ip);

    vi.advanceTimersByTime(14 * 60 * 1000);
    expect(() => checkBruteForce(ip)).toThrow();
    vi.useRealTimers();
  });
});
