import { describe, it, expect } from "vitest";
import { convertUnit } from "./converter";

describe("Unit Converter Logic", () => {
    it("should convert length correctly (m to km)", () => {
        expect(convertUnit(1000, "m", "km", "length")).toBe(1);
    });

    it("should convert weight correctly (kg to g)", () => {
        expect(convertUnit(1.5, "kg", "g", "weight")).toBe(1500);
    });

    it("should convert temperature (C to F)", () => {
        expect(convertUnit(0, "c", "f", "temperature")).toBe(32);
        expect(convertUnit(100, "c", "f", "temperature")).toBe(212);
    });

    it("should convert temperature (F to C)", () => {
        expect(convertUnit(32, "f", "c", "temperature")).toBe(0);
    });

    it("should handle same units", () => {
        expect(convertUnit(100, "m", "m", "length")).toBe(100);
    });
});
