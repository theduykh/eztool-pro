import { describe, it, expect } from "vitest";
import { decodeJWT } from "./jwt";

describe("JWT Decoding Logic", () => {
    // Standard test JWT (header: {alg: HS256, typ: JWT}, payload: {sub: 1234567890, name: John Doe, iat: 1516239022})
    const validToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    it("should decode a valid JWT correctly", () => {
        const decoded = decodeJWT(validToken);
        expect(decoded.header.alg).toBe("HS256");
        expect(decoded.payload.name).toBe("John Doe");
        expect(decoded.signature).toBe("SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c");
    });

    it("should handle Unicode in payload", () => {
        // payload: {"name": "Nguyễn Văn A"}
        const tokenWithUnicode = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjogIk5ndXnhu4VuIFbEg24gQSJ9.signature";
        const decoded = decodeJWT(tokenWithUnicode);
        expect(decoded.payload.name).toBe("Nguyễn Văn A");
    });

    it("should throw error for invalid token format", () => {
        expect(() => decodeJWT("invalid-token")).toThrow("Token JWT không hợp lệ");
        expect(() => decodeJWT("part1.part2")).toThrow("Token JWT không hợp lệ");
    });

    it("should throw error for invalid base64 content", () => {
        expect(() => decodeJWT("!!!.!!!.!!!")).toThrow();
    });
});
