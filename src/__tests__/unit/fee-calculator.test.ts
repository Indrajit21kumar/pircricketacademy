/**
 * Unit tests for admission fee calculation logic.
 * The formula lives in api/_handlers.ts (POST /admissions).
 * These tests verify the business rules in isolation.
 */
import { describe, it, expect } from "vitest";

// --- Replicated business logic (mirrors api/_handlers.ts) ---
const MONTHLY_FEE = 3500;
const KIT_FEE = 2000;
const REG_FEE = 5000;

const PKG_DISCOUNTS: Record<number, number> = { 3: 10, 6: 15, 12: 20 };

function calcFees(packageMonths: number | null, eligibilityDiscountPct = 0) {
  const pkgDiscount = packageMonths ? (PKG_DISCOUNTS[packageMonths] ?? 0) : 0;
  const combinedPct = Math.min(pkgDiscount + eligibilityDiscountPct, 90);
  const monthlyTotal = packageMonths
    ? Math.round(packageMonths * MONTHLY_FEE * (1 - combinedPct / 100))
    : 0;
  const kitFee = packageMonths ? KIT_FEE : 0;
  const totalPaid = REG_FEE + kitFee + monthlyTotal;
  return { pkgDiscount, combinedPct, monthlyTotal, kitFee, totalPaid };
}
// ---------------------------------------------------------------

describe("Admission Fee Calculator", () => {
  describe("Registration-only (no package)", () => {
    it("charges only the registration fee when no package is selected", () => {
      const { totalPaid, monthlyTotal, kitFee } = calcFees(null);
      expect(totalPaid).toBe(5000);
      expect(monthlyTotal).toBe(0);
      expect(kitFee).toBe(0);
    });

    it("eligibility discount has no effect without a package", () => {
      const { totalPaid } = calcFees(null, 50);
      expect(totalPaid).toBe(5000);
    });
  });

  describe("3-month package", () => {
    it("applies 10 % package discount", () => {
      const { pkgDiscount, combinedPct } = calcFees(3);
      expect(pkgDiscount).toBe(10);
      expect(combinedPct).toBe(10);
    });

    it("calculates correct monthly total", () => {
      // 3 × ₹3500 × 0.90 = ₹9450
      expect(calcFees(3).monthlyTotal).toBe(9450);
    });

    it("adds kit fee", () => {
      expect(calcFees(3).kitFee).toBe(2000);
    });

    it("returns correct grand total: ₹5000 + ₹2000 + ₹9450 = ₹16450", () => {
      expect(calcFees(3).totalPaid).toBe(16450);
    });
  });

  describe("6-month package", () => {
    it("applies 15 % package discount", () => {
      expect(calcFees(6).pkgDiscount).toBe(15);
    });

    it("calculates correct monthly total", () => {
      // 6 × ₹3500 × 0.85 = ₹17850
      expect(calcFees(6).monthlyTotal).toBe(17850);
    });

    it("returns correct grand total: ₹5000 + ₹2000 + ₹17850 = ₹24850", () => {
      expect(calcFees(6).totalPaid).toBe(24850);
    });
  });

  describe("12-month package", () => {
    it("applies 20 % package discount", () => {
      expect(calcFees(12).pkgDiscount).toBe(20);
    });

    it("calculates correct monthly total", () => {
      // 12 × ₹3500 × 0.80 = ₹33600
      expect(calcFees(12).monthlyTotal).toBe(33600);
    });

    it("returns correct grand total: ₹5000 + ₹2000 + ₹33600 = ₹40600", () => {
      expect(calcFees(12).totalPaid).toBe(40600);
    });
  });

  describe("Combined discounts (package + eligibility)", () => {
    it("adds package and eligibility discounts together", () => {
      // 6-month (15%) + 25% eligibility = 40% combined
      const { combinedPct } = calcFees(6, 25);
      expect(combinedPct).toBe(40);
    });

    it("caps combined discount at 90 %", () => {
      // 12-month (20%) + 100% eligibility would be 120% → capped at 90%
      const { combinedPct } = calcFees(12, 100);
      expect(combinedPct).toBe(90);
    });

    it("calculates correct total when capped at 90 %", () => {
      // 12-month at 90% discount: 12 × 3500 × 0.10 = 4200
      const { monthlyTotal, totalPaid } = calcFees(12, 100);
      expect(monthlyTotal).toBe(4200);
      expect(totalPaid).toBe(5000 + 2000 + 4200); // 11200
    });

    it("100 % eligibility discount on 3-month: combined = 90% (10+100 capped)", () => {
      const { combinedPct, totalPaid } = calcFees(3, 100);
      expect(combinedPct).toBe(90);
      // 3 × 3500 × 0.10 = 1050
      expect(totalPaid).toBe(5000 + 2000 + 1050); // 8050
    });

    it("15 % eligibility on 6-month: combinedPct = 30%", () => {
      const { combinedPct, totalPaid } = calcFees(6, 15);
      expect(combinedPct).toBe(30);
      // 6 × 3500 × 0.70 = 14700
      expect(totalPaid).toBe(5000 + 2000 + 14700); // 21700
    });
  });

  describe("Edge cases", () => {
    it("0 % eligibility discount does not change the total", () => {
      expect(calcFees(3, 0).totalPaid).toBe(calcFees(3).totalPaid);
    });

    it("rounds monthlyTotal to nearest integer", () => {
      // Any result should be a whole number (no decimals)
      const { monthlyTotal } = calcFees(3, 7);
      expect(Number.isInteger(monthlyTotal)).toBe(true);
    });

    it("totalPaid is always a positive integer", () => {
      for (const pkg of [null, 3, 6, 12] as const) {
        const { totalPaid } = calcFees(pkg);
        expect(totalPaid).toBeGreaterThan(0);
        expect(Number.isInteger(totalPaid)).toBe(true);
      }
    });
  });
});
