import { describe, it, expect } from "vitest";
import { calculateBMI } from "./bmi";

describe("BMI Calculation Logic", () => {
    it("should calculate correct BMI for normal person", () => {
        const result = calculateBMI(70, 175);
        expect(result.bmi).toBe(22.9);
        expect(result.category).toBe("Normal");
    });

    it("should classify underweight", () => {
        const result = calculateBMI(45, 160);
        expect(result.bmi).toBe(17.6);
        expect(result.category).toBe("Underweight");
    });

    it("should classify overweight for global standard", () => {
        const result = calculateBMI(85, 175, "global");
        expect(result.bmi).toBe(27.8);
        expect(result.category).toBe("Overweight");
    });

    it("should classify overweight for asian standard at lower threshold", () => {
        // 75kg / (1.75m)^2 = 24.5. 
        // In Global: Normal (< 25)
        // In Asian: Overweight (23.0 - 24.9)
        const resultGlobal = calculateBMI(75, 175, "global");
        const resultAsian = calculateBMI(75, 175, "asian");
        
        expect(resultGlobal.category).toBe("Normal");
        expect(resultAsian.category).toBe("Overweight");
        expect(resultAsian.label).toContain("Tiền béo phì");
    });

    it("should classify obesity for asian standard at 25+", () => {
        const result = calculateBMI(77, 175, "asian"); // 25.1
        expect(result.category).toBe("Obesity Class I");
    });

    it("should throw error for invalid inputs", () => {
        expect(() => calculateBMI(0, 170)).toThrow();
        expect(() => calculateBMI(70, -1)).toThrow();
    });
});
