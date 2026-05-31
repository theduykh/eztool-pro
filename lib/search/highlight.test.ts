import { describe, it, expect } from "vitest";
import { highlightSegments } from "./highlight";

const matched = (text: string, query: string) =>
    highlightSegments(text, query)
        .filter((s) => s.match)
        .map((s) => s.text);

const rebuilt = (text: string, query: string) =>
    highlightSegments(text, query)
        .map((s) => s.text)
        .join("");

describe("highlightSegments", () => {
    it("returns a single non-matching segment for an empty query", () => {
        expect(highlightSegments("JSON Formatter", "")).toEqual([
            { text: "JSON Formatter", match: false },
        ]);
    });

    it("highlights a simple ASCII match", () => {
        expect(matched("JSON Formatter", "json")).toEqual(["JSON"]);
    });

    it("highlights the accented original when the query has no diacritics", () => {
        // "ma" should highlight "mã" in "Tạo mã QR"
        expect(matched("Tạo mã QR", "ma")).toEqual(["mã"]);
    });

    it("highlights multiple tokens", () => {
        expect(matched("Chuyển đổi HEX / RGB", "chuyen rgb")).toEqual([
            "Chuyển",
            "RGB",
        ]);
    });

    it("always reconstructs the original text exactly", () => {
        expect(rebuilt("Tạo mã QR Code", "ma qr")).toBe("Tạo mã QR Code");
        expect(rebuilt("Đổi Đơn Vị", "doi")).toBe("Đổi Đơn Vị");
    });

    it("returns the whole string unmatched when nothing matches", () => {
        expect(highlightSegments("JSON Formatter", "xyz")).toEqual([
            { text: "JSON Formatter", match: false },
        ]);
    });
});
