import { vi } from "vitest";

// Drizzle ORM chains return different shapes depending on the operation.
// This factory creates a configurable chainable mock.
export function makeChain(resolvedData: unknown[] = []) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue(resolvedData),
    values: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue(resolvedData),
  };
}

// A top-level mock db whose methods can be re-configured per test
// via mockReturnValueOnce / mockReturnValue on each .select / .insert / etc.
export function makeMockDb() {
  return {
    select: vi.fn().mockReturnValue(makeChain()),
    insert: vi.fn().mockReturnValue(makeChain()),
    update: vi.fn().mockReturnValue(makeChain()),
    delete: vi.fn().mockReturnValue(makeChain()),
  };
}

export type MockDb = ReturnType<typeof makeMockDb>;
