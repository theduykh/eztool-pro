import { describe, it, expect } from "vitest";
import { formatJson, minifyJson, validateJson } from "./json";

// ============================================================
// formatJson
// ============================================================
describe("formatJson", () => {
    // ── Happy Path ──
    it("should format a simple object with default indent (4)", () => {
        const result = formatJson('{"name":"eztool","status":"active"}');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(
                '{\n    "name": "eztool",\n    "status": "active"\n}'
            );
        }
    });

    it("should format with custom indent (2)", () => {
        const result = formatJson('{"a":1}', 2);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe('{\n  "a": 1\n}');
        }
    });

    it("should format an array", () => {
        const result = formatJson("[1,2,3]");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toContain("[\n");
        }
    });

    it("should format nested objects", () => {
        const input = '{"a":{"b":{"c":1}}}';
        const result = formatJson(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toContain('"c": 1');
        }
    });

    it("should handle already-formatted JSON (idempotent)", () => {
        const pretty = '{\n    "x": 1\n}';
        const result = formatJson(pretty);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(pretty);
        }
    });

    it("should trim leading/trailing whitespace before parsing", () => {
        const result = formatJson('   {"a":1}   ');
        expect(result.success).toBe(true);
    });

    // ── Edge Cases ──
    it("should return error for empty string", () => {
        const result = formatJson("");
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBe("Dữ liệu đầu vào trống.");
        }
    });

    it("should return error for whitespace-only string", () => {
        const result = formatJson("   \n\t  ");
        expect(result.success).toBe(false);
    });

    it("should return error for invalid JSON", () => {
        const result = formatJson("{invalid}");
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeTruthy();
        }
    });

    it("should return error with position for malformed JSON", () => {
        const result = formatJson('{"a": }');
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeTruthy();
            // Position may or may not be extracted depending on engine
        }
    });

    it("should handle JSON primitive values (string)", () => {
        const result = formatJson('"hello"');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe('"hello"');
        }
    });

    it("should handle JSON primitive values (number)", () => {
        const result = formatJson("42");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe("42");
        }
    });

    it("should handle null", () => {
        const result = formatJson("null");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe("null");
        }
    });

    it("should handle boolean values", () => {
        expect(formatJson("true").success).toBe(true);
        expect(formatJson("false").success).toBe(true);
    });

    it("should handle unicode characters", () => {
        const result = formatJson('{"emoji":"🚀","vi":"Xin chào"}');
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toContain("🚀");
            expect(result.data).toContain("Xin chào");
        }
    });

    it("should handle large nested JSON", () => {
        const deep = '{"a":' + '{"b":'.repeat(50) + '1' + '}'.repeat(50) + '}';
        const result = formatJson(deep);
        expect(result.success).toBe(true);
    });
});

// ============================================================
// minifyJson
// ============================================================
describe("minifyJson", () => {
    it("should minify a formatted JSON object", () => {
        const input = '{\n    "name": "eztool",\n    "status": "active"\n}';
        const result = minifyJson(input);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe('{"name":"eztool","status":"active"}');
        }
    });

    it("should minify an array", () => {
        const result = minifyJson("[ 1, 2, 3 ]");
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe("[1,2,3]");
        }
    });

    it("should return error for empty string", () => {
        const result = minifyJson("");
        expect(result.success).toBe(false);
    });

    it("should return error for invalid JSON", () => {
        const result = minifyJson("{broken");
        expect(result.success).toBe(false);
    });

    it("should be idempotent on already-minified JSON", () => {
        const mini = '{"a":1,"b":2}';
        const result = minifyJson(mini);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toBe(mini);
        }
    });
});

// ============================================================
// validateJson
// ============================================================
describe("validateJson", () => {
    it("should return valid for correct JSON", () => {
        expect(validateJson('{"a":1}').valid).toBe(true);
    });

    it("should return valid for JSON array", () => {
        expect(validateJson("[1,2]").valid).toBe(true);
    });

    it("should return invalid for empty string", () => {
        const result = validateJson("");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Dữ liệu đầu vào trống.");
    });

    it("should return invalid for malformed JSON", () => {
        const result = validateJson("{not json}");
        expect(result.valid).toBe(false);
        expect(result.error).toBeTruthy();
    });

    it("should return invalid for trailing comma", () => {
        const result = validateJson('{"a":1,}');
        expect(result.valid).toBe(false);
    });

    it("should return invalid for single quotes", () => {
        const result = validateJson("{'a':1}");
        expect(result.valid).toBe(false);
    });
});
