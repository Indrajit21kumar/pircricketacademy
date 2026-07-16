/**
 * Unit tests for booking slot-occupancy logic.
 * Mirrors getOccupiedSlots() in api/_handlers.ts and the conflict-detection logic.
 */
import { describe, it, expect } from "vitest";

// --- Replicated logic (mirrors api/_handlers.ts) ---
const ALL_SLOTS = [
  "06:00 AM","07:00 AM","08:00 AM","09:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM",
  "06:00 PM","07:00 PM","08:00 PM","09:00 PM",
];

function getOccupiedSlots(startSlot: string, duration: number): string[] {
  const idx = ALL_SLOTS.indexOf(startSlot);
  if (idx === -1) return [startSlot];
  return ALL_SLOTS.slice(idx, idx + duration);
}

function hasConflict(
  requestSlot: string, requestDuration: number,
  bookedSlot: string, bookedDuration: number,
): boolean {
  const requested = new Set(getOccupiedSlots(requestSlot, requestDuration));
  return getOccupiedSlots(bookedSlot, bookedDuration).some(s => requested.has(s));
}
// ---------------------------------------------------

describe("getOccupiedSlots", () => {
  describe("single-hour bookings", () => {
    it("returns the start slot itself for duration 1", () => {
      expect(getOccupiedSlots("06:00 AM", 1)).toEqual(["06:00 AM"]);
    });

    it("returns last slot for duration 1", () => {
      expect(getOccupiedSlots("09:00 PM", 1)).toEqual(["09:00 PM"]);
    });

    it("returns mid-day slot for duration 1", () => {
      expect(getOccupiedSlots("12:00 PM", 1)).toEqual(["12:00 PM"]);
    });
  });

  describe("multi-hour bookings", () => {
    it("returns 2 consecutive slots for duration 2", () => {
      expect(getOccupiedSlots("06:00 AM", 2)).toEqual(["06:00 AM", "07:00 AM"]);
    });

    it("returns 3 consecutive slots for duration 3", () => {
      expect(getOccupiedSlots("09:00 AM", 3)).toEqual(["09:00 AM", "10:00 AM", "11:00 AM"]);
    });

    it("spans AM/PM boundary correctly", () => {
      expect(getOccupiedSlots("11:00 AM", 2)).toEqual(["11:00 AM", "12:00 PM"]);
    });

    it("handles PM slots correctly", () => {
      expect(getOccupiedSlots("07:00 PM", 2)).toEqual(["07:00 PM", "08:00 PM"]);
    });
  });

  describe("boundary conditions", () => {
    it("does not exceed the last slot when duration overruns", () => {
      // 08:00 PM + duration 3 → only 08:00 PM, 09:00 PM remain
      const result = getOccupiedSlots("08:00 PM", 3);
      expect(result).toEqual(["08:00 PM", "09:00 PM"]);
      expect(result).toHaveLength(2);
    });

    it("returns only the fallback for an invalid slot string", () => {
      expect(getOccupiedSlots("invalid", 2)).toEqual(["invalid"]);
    });

    it("returns only the start slot for an empty slot string", () => {
      expect(getOccupiedSlots("", 2)).toEqual([""]);
    });
  });

  describe("ALL_SLOTS coverage", () => {
    it("contains exactly 16 time slots", () => {
      expect(ALL_SLOTS).toHaveLength(16);
    });

    it("starts at 06:00 AM and ends at 09:00 PM", () => {
      expect(ALL_SLOTS[0]).toBe("06:00 AM");
      expect(ALL_SLOTS[ALL_SLOTS.length - 1]).toBe("09:00 PM");
    });
  });
});

describe("Slot conflict detection", () => {
  it("detects a direct same-slot conflict", () => {
    expect(hasConflict("09:00 AM", 1, "09:00 AM", 1)).toBe(true);
  });

  it("detects overlap when new booking starts inside existing booking", () => {
    // Existing: 09:00–11:00 AM (2h). New: 10:00 AM, 1h → conflict
    expect(hasConflict("10:00 AM", 1, "09:00 AM", 2)).toBe(true);
  });

  it("detects overlap when existing booking starts inside new booking", () => {
    // Existing: 10:00 AM, 1h. New: 09:00–11:00 AM (2h) → conflict
    expect(hasConflict("09:00 AM", 2, "10:00 AM", 1)).toBe(true);
  });

  it("detects partial overlap between two multi-hour bookings", () => {
    // Existing: 08:00–10:00 AM (2h). New: 09:00–11:00 AM (2h) → overlap at 09:00 AM
    expect(hasConflict("09:00 AM", 2, "08:00 AM", 2)).toBe(true);
  });

  it("does NOT conflict when bookings are back-to-back", () => {
    // Existing: 08:00–09:00 AM. New: 09:00–10:00 AM → no conflict
    expect(hasConflict("09:00 AM", 1, "08:00 AM", 1)).toBe(false);
  });

  it("does NOT conflict when bookings are completely separate", () => {
    // Existing: 06:00–07:00 AM. New: 09:00–10:00 AM → no conflict
    expect(hasConflict("09:00 AM", 1, "06:00 AM", 1)).toBe(false);
  });

  it("does NOT conflict between morning and evening bookings", () => {
    expect(hasConflict("06:00 PM", 2, "06:00 AM", 3)).toBe(false);
  });

  it("detects conflict between two 3-hour blocks sharing one slot", () => {
    // 06–09 AM and 08–11 AM share 08:00 AM
    expect(hasConflict("08:00 AM", 3, "06:00 AM", 3)).toBe(true);
  });
});
