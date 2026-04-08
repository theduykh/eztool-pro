import { describe, it, expect } from "vitest";
import { parseItems, pickWinner, getWinnerIndexFromAngle } from "./random-wheel";

describe("parseItems", () => {
    it("parses newline-separated items", () => {
        const result = parseItems("Apple\nBanana\nCherry");
        expect(result).toHaveLength(3);
        expect(result[0].label).toBe("Apple");
        expect(result[1].label).toBe("Banana");
        expect(result[2].label).toBe("Cherry");
    });

    it("trims whitespace from each line", () => {
        const result = parseItems("  Apple  \n  Banana  ");
        expect(result[0].label).toBe("Apple");
        expect(result[1].label).toBe("Banana");
    });

    it("filters out blank lines", () => {
        const result = parseItems("Apple\n\nBanana\n\nCherry");
        expect(result).toHaveLength(3);
    });

    it("returns empty array for empty input", () => {
        expect(parseItems("")).toHaveLength(0);
        expect(parseItems("\n\n\n")).toHaveLength(0);
    });

    it("assigns sequential string ids", () => {
        const result = parseItems("A\nB\nC");
        expect(result[0].id).toBe("0");
        expect(result[1].id).toBe("1");
        expect(result[2].id).toBe("2");
    });
});

describe("pickWinner", () => {
    it("throws when list is empty", () => {
        expect(() => pickWinner([])).toThrow();
    });

    it("returns a valid winner from the list", () => {
        const items = parseItems("A\nB\nC\nD\nE");
        const { winner, winnerIndex } = pickWinner(items);
        expect(items).toContain(winner);
        expect(winnerIndex).toBeGreaterThanOrEqual(0);
        expect(winnerIndex).toBeLessThan(items.length);
        expect(items[winnerIndex]).toBe(winner);
    });

    it("always picks the only item in a single-item list", () => {
        const items = parseItems("Only");
        const { winner, winnerIndex } = pickWinner(items);
        expect(winner.label).toBe("Only");
        expect(winnerIndex).toBe(0);
    });
});

describe("getWinnerIndexFromAngle", () => {
    it("returns 0 for zero item count", () => {
        expect(getWinnerIndexFromAngle(0, 0)).toBe(0);
    });

    it("returns index in valid range for 4 items at angle 0", () => {
        const idx = getWinnerIndexFromAngle(0, 4);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(4);
    });

    it("returns consistent results for same angle", () => {
        expect(getWinnerIndexFromAngle(1.5, 6)).toBe(getWinnerIndexFromAngle(1.5, 6));
    });

    it("handles large positive angles (multiple full rotations)", () => {
        const idx = getWinnerIndexFromAngle(100, 5);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(5);
    });

    it("handles negative angles", () => {
        const idx = getWinnerIndexFromAngle(-Math.PI, 4);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(4);
    });
});
