import { describe, it, expect } from "vitest";
import { generateLorem, generateLoremByChars } from "./lorem";

describe("Lorem Ipsum Logic", () => {
    it("should generate specified number of words", () => {
        const text = generateLorem({ type: "words", count: 10, startWithLorem: false });
        expect(text.split(" ").length).toBe(10);
    });

    it("should generate specified number of words even when startWithLorem is true", () => {
        const count = 10;
        const text = generateLorem({ type: "words", count, startWithLorem: true });
        expect(text.split(" ").length).toBe(count);
        expect(text.startsWith("Lorem ipsum dolor sit amet")).toBe(true);
    });

    it("should generate by character count", () => {
        const count = 50;
        const text = generateLoremByChars(count);
        expect(text.length).toBeLessThanOrEqual(count);
    });

    it("should handle empty count", () => {
        expect(generateLorem({ type: "words", count: 0 })).toBe("");
    });
});
