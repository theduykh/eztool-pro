import { describe, it, expect } from "vitest";
import { calculateRuleOfThree } from "./rule-of-three";

describe("Rule of Three Logic", () => {
    it("should calculate direct proportion correctly", () => {
        // 2 -> 10, 4 -> ? => 20
        expect(calculateRuleOfThree(2, 10, 4, "direct")).toBe(20);
    });

    it("should calculate inverse proportion correctly", () => {
        // 2 workers -> 10 days, 4 workers -> ? => 5 days
        expect(calculateRuleOfThree(2, 10, 4, "inverse")).toBe(5);
    });

    it("should throw error for A = 0", () => {
        expect(() => calculateRuleOfThree(0, 10, 5, "direct")).toThrow();
    });
});
