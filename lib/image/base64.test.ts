import { describe, it, expect } from "vitest";
import { toDataUri, fromDataUri, toCssDataUri, toHtmlTag } from "./base64";

describe("Image Base64 Logic", () => {
    const mockBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
    const mockDataUri = `data:image/png;base64,${mockBase64}`;

    it("should format to Data URI", () => {
        expect(toDataUri(mockBase64, "image/png")).toBe(mockDataUri);
    });

    it("should extract from Data URI", () => {
        const result = fromDataUri(mockDataUri);
        expect(result.mimeType).toBe("image/png");
        expect(result.base64).toBe(mockBase64);
    });

    it("should format for CSS", () => {
        expect(toCssDataUri(mockDataUri)).toBe(`url("${mockDataUri}")`);
    });

    it("should format for HTML", () => {
        expect(toHtmlTag(mockDataUri, "test")).toContain('<img src="data:image/png;base64,');
        expect(toHtmlTag(mockDataUri, "test")).toContain('alt="test"');
    });
});
