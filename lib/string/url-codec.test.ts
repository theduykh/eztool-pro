import { describe, it, expect } from "vitest";
import { encodeUrl, decodeUrl } from "./url-codec";

describe("URL Codec Logic", () => {
    describe("encodeUrl", () => {
        it("should encode special characters correctly", () => {
            expect(encodeUrl("hello world")).toBe("hello%20world");
            expect(encodeUrl("a=b&c=d")).toBe("a%3Db%26c%3Dd");
            expect(encodeUrl("tiếng việt")).toBe("ti%E1%BA%BFng%20vi%E1%BB%87t");
        });

        it("should return empty string for empty input", () => {
            expect(encodeUrl("")).toBe("");
        });
    });

    describe("decodeUrl", () => {
        it("should decode encoded strings correctly", () => {
            expect(decodeUrl("hello%20world")).toBe("hello world");
            expect(decodeUrl("a%3Db%26c%3Dd")).toBe("a=b&c=d");
            expect(decodeUrl("ti%E1%BA%BFng%20vi%E1%BB%87t")).toBe("tiếng việt");
        });

        it("should handle '+' as space", () => {
            expect(decodeUrl("hello+world")).toBe("hello world");
        });

        it("should return empty string for empty input", () => {
            expect(decodeUrl("")).toBe("");
        });

        it("should throw error for invalid encoded strings", () => {
            // Malformed URI sequence
            expect(() => decodeUrl("%E0%A4%A")).toThrow();
        });
    });
});
