import { describe, it, expect } from "vitest";
import { hexToRgb, rgbToHex, rgbToHsl } from "../image/color";

describe("Color Converter Logic", () => {
    it("should convert HEX to RGB", () => {
        expect(hexToRgb("#ffffff")).toEqual({ r: 255, g: 255, b: 255 });
        expect(hexToRgb("000000")).toEqual({ r: 0, g: 0, b: 0 });
        expect(hexToRgb("#f00")).toEqual({ r: 255, g: 0, b: 0 });
    });

    it("should convert RGB to HEX", () => {
        expect(rgbToHex(255, 255, 255)).toBe("#ffffff");
        expect(rgbToHex(0, 0, 0)).toBe("#000000");
        expect(rgbToHex(255, 0, 0)).toBe("#ff0000");
    });

    it("should convert RGB to HSL", () => {
        const white = rgbToHsl(255, 255, 255);
        expect(white.l).toBe(100);

        const red = rgbToHsl(255, 0, 0);
        expect(red.h).toBe(0);
        expect(red.l).toBe(50);
        expect(red.s).toBe(100);
    });
});
