import { describe, it, expect } from "vitest";
import { generateHash } from "./hash";

describe("Hash Generation Logic", () => {
    const input = "hello world";

    it("should generate correct MD5", () => {
        // md5(hello world) = 5eb63bbbe01eeed093cb22bb8f5acdc3
        expect(generateHash(input, "md5")).toBe("5eb63bbbe01eeed093cb22bb8f5acdc3");
    });

    it("should generate correct SHA-1", () => {
        // sha1(hello world) = 2aae6c35c94fcfb415dbe95f408b9ce91ee846ed
        expect(generateHash(input, "sha1")).toBe("2aae6c35c94fcfb415dbe95f408b9ce91ee846ed");
    });

    it("should generate correct SHA-256", () => {
        // sha256(hello world) = b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
        expect(generateHash(input, "sha256")).toBe("b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9");
    });

    it("should return empty string for empty input", () => {
        expect(generateHash("", "sha256")).toBe("");
    });
});
