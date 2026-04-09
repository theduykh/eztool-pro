import { describe, it, expect } from "vitest";
import { cleanText } from "./cleaner";

describe("Text Cleaner Logic", () => {
    const input = "  line 1  \n\n  line   2  \n  \nline 3   ";

    it("should trim lines", () => {
        const result = cleanText(input, {
            trimLines: true,
            removeEmptyLines: false,
            collapseSpaces: false,
            removeAllLineBreaks: false,
        });
        expect(result).toContain("line 1\n\nline   2\n\nline 3");
    });

    it("should remove empty lines", () => {
        const result = cleanText(input, {
            trimLines: true,
            removeEmptyLines: true,
            collapseSpaces: false,
            removeAllLineBreaks: false,
        });
        const lines = result.split("\n");
        expect(lines.length).toBe(3);
    });

    it("should collapse spaces", () => {
        const result = cleanText("word1   word2", {
            trimLines: false,
            removeEmptyLines: false,
            collapseSpaces: true,
            removeAllLineBreaks: false,
        });
        expect(result).toBe("word1 word2");
    });

    it("should remove all line breaks", () => {
        const result = cleanText("line1\nline2", {
            trimLines: false,
            removeEmptyLines: false,
            collapseSpaces: false,
            removeAllLineBreaks: true,
        });
        expect(result).toBe("line1 line2");
    });

    it("should handle empty input", () => {
        expect(cleanText("", {
            trimLines: true,
            removeEmptyLines: true,
            collapseSpaces: true,
            removeAllLineBreaks: true,
        })).toBe("");
    });
});
