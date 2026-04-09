import { describe, it, expect } from "vitest";
import {
    generateWheelSlices,
    shuffleItems,
    calculateSpinAngle,
    getWinnerIndex,
} from "./wheel";

// ─── generateWheelSlices ───────────────────────────────────────────────────────

describe("generateWheelSlices", () => {
    it("returns empty array for empty input", () => {
        expect(generateWheelSlices([])).toEqual([]);
    });

    it("generates correct number of slices", () => {
        const slices = generateWheelSlices(["A", "B", "C"]);
        expect(slices).toHaveLength(3);
    });

    it("assigns correct text to each slice", () => {
        const slices = generateWheelSlices(["Phở", "Cơm", "Bún"]);
        expect(slices[0].text).toBe("Phở");
        expect(slices[1].text).toBe("Cơm");
        expect(slices[2].text).toBe("Bún");
    });

    it("assigns valid HEX color to each slice", () => {
        const slices = generateWheelSlices(["A", "B", "C", "D", "E"]);
        slices.forEach((slice) => {
            expect(slice.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
    });

    it("calculates correct rotation for equal slices", () => {
        const slices = generateWheelSlices(["A", "B", "C", "D"]);
        expect(slices[0].rotation).toBe(0);
        expect(slices[1].rotation).toBe(90);
        expect(slices[2].rotation).toBe(180);
        expect(slices[3].rotation).toBe(270);
    });

    it("handles single item", () => {
        const slices = generateWheelSlices(["Only"]);
        expect(slices).toHaveLength(1);
        expect(slices[0].rotation).toBe(0);
    });

    it("cycles colors when items exceed color palette size", () => {
        const items = Array.from({ length: 20 }, (_, i) => `Item ${i}`);
        const slices = generateWheelSlices(items);
        // Color at index 0 should repeat at index 14 (palette size)
        expect(slices[0].color).toBe(slices[14].color);
    });
});

// ─── shuffleItems ──────────────────────────────────────────────────────────────

describe("shuffleItems", () => {
    it("returns array of same length", () => {
        const items = ["A", "B", "C", "D"];
        const shuffled = shuffleItems(items);
        expect(shuffled).toHaveLength(items.length);
    });

    it("contains all original items", () => {
        const items = ["A", "B", "C", "D"];
        const shuffled = shuffleItems(items);
        expect(shuffled.sort()).toEqual([...items].sort());
    });

    it("does not mutate the original array", () => {
        const items = ["A", "B", "C"];
        const copy = [...items];
        shuffleItems(items);
        expect(items).toEqual(copy);
    });

    it("handles empty array", () => {
        expect(shuffleItems([])).toEqual([]);
    });

    it("handles single item", () => {
        expect(shuffleItems(["A"])).toEqual(["A"]);
    });
});

// ─── calculateSpinAngle ────────────────────────────────────────────────────────

describe("calculateSpinAngle", () => {
    it("returns angle greater than current rotation", () => {
        const result = calculateSpinAngle(0);
        expect(result).toBeGreaterThan(0);
    });

    it("adds at least 5 full rotations (1800°)", () => {
        const result = calculateSpinAngle(0);
        expect(result).toBeGreaterThanOrEqual(1800);
    });

    it("adds at most 10 full rotations + 360° offset (3960°)", () => {
        const result = calculateSpinAngle(0);
        expect(result).toBeLessThanOrEqual(3960);
    });

    it("accumulates on top of current rotation", () => {
        const current = 5000;
        const result = calculateSpinAngle(current);
        expect(result).toBeGreaterThan(current + 1800);
    });
});

// ─── getWinnerIndex ────────────────────────────────────────────────────────────

describe("getWinnerIndex", () => {
    it("returns -1 for zero items", () => {
        expect(getWinnerIndex(0, 0)).toBe(-1);
    });

    it("returns -1 for negative item count", () => {
        expect(getWinnerIndex(100, -5)).toBe(-1);
    });

    it("returns valid index within range", () => {
        for (let i = 0; i < 100; i++) {
            const angle = Math.random() * 10000;
            const idx = getWinnerIndex(angle, 6);
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThan(6);
        }
    });

    it("returns 0 when angle is 0", () => {
        // At 0° rotation, the first slice (starting at 0°) is under the pointer
        expect(getWinnerIndex(0, 4)).toBe(0);
    });

    it("handles large angles (many full rotations)", () => {
        const idx = getWinnerIndex(36000, 5); // exactly 100 full rotations
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(5);
    });

    it("handles negative angles", () => {
        const idx = getWinnerIndex(-90, 4);
        expect(idx).toBeGreaterThanOrEqual(0);
        expect(idx).toBeLessThan(4);
    });

    it("always returns index 0 for single item", () => {
        expect(getWinnerIndex(0, 1)).toBe(0);
        expect(getWinnerIndex(123, 1)).toBe(0);
        expect(getWinnerIndex(999, 1)).toBe(0);
    });
});
