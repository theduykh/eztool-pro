import { describe, it, expect } from "vitest";
import { encodeBase64, decodeBase64 } from "./base64-codec";

describe("Base64 Codec Logic", () => {
    describe("encodeBase64", () => {
        it("should encode plain text correctly", () => {
            expect(encodeBase64("hello")).toBe("aGVsbG8=");
            expect(encodeBase64("eztool.pro")).toBe("ZXp0b29sLnBybw==");
        });

        it("should encode Unicode (Vietnamese) correctly", () => {
            // "tiếng việt"
            expect(encodeBase64("tiếng việt")).toBe("dGnhur9uZyB2aeG7h3Q=");
        });

        it("should return empty string for empty input", () => {
            expect(encodeBase64("")).toBe("");
        });
    });

    describe("decodeBase64", () => {
        it("should decode valid base64 correctly", () => {
            expect(decodeBase64("aGVsbG8=")).toBe("hello");
            expect(decodeBase64("ZXp0b29sLnBybw==")).toBe("eztool.pro");
        });

        it("should decode Unicode (Vietnamese) correctly", () => {
            expect(decodeBase64("dGnhur9uZyB2aeG7h3Q=")).toBe("tiếng việt");
        });

        it("should return empty string for empty input", () => {
            expect(decodeBase64("")).toBe("");
        });

        it("should throw error for invalid base64", () => {
            expect(() => decodeBase64("!!! invalid !!!")).toThrow();
        });
    });
});
