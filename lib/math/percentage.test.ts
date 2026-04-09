import { describe, it, expect } from "vitest";
import {
    calculateValueFromPercent,
    calculatePercentOf,
    calculatePercentChange,
    addPercent,
    subtractPercent
} from "./percentage";

describe("Percentage Logic", () => {
    it("should calculate value from percent (20% of 100)", () => {
        expect(calculateValueFromPercent(20, 100)).toBe(20);
    });

    it("should calculate percent of total (20 is what % of 100)", () => {
        expect(calculatePercentOf(20, 100)).toBe(20);
    });

    it("should calculate percent change (from 100 to 120)", () => {
        expect(calculatePercentChange(100, 120)).toBe(20);
    });

    it("should calculate adding percent (100 + 10%)", () => {
        expect(addPercent(100, 10)).toBeCloseTo(110);
    });

    it("should calculate subtracting percent (100 - 10%)", () => {
        expect(subtractPercent(100, 10)).toBeCloseTo(90);
    });
});
