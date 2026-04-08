/**
 * JSON Formatter & Validator — Pure logic functions.
 * Không phụ thuộc React hay browser API.
 */

export interface JsonResult {
    success: true;
    data: string;
}

export interface JsonError {
    success: false;
    error: string;
    /** Vị trí lỗi (nếu trích xuất được) */
    position?: number;
}

export type JsonFormatResult = JsonResult | JsonError;

/**
 * Số space indent mặc định khi format.
 */
const DEFAULT_INDENT = 4;

/**
 * Làm đẹp (format/prettify) chuỗi JSON.
 * @param raw   Chuỗi JSON gốc
 * @param indent Số space indent (mặc định 4)
 */
export function formatJson(raw: string, indent: number = DEFAULT_INDENT): JsonFormatResult {
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
        return { success: false, error: "Dữ liệu đầu vào trống." };
    }

    try {
        const parsed: unknown = JSON.parse(trimmed);
        const formatted = JSON.stringify(parsed, null, indent);
        return { success: true, data: formatted };
    } catch (err) {
        return {
            success: false,
            error: extractErrorMessage(err),
            position: extractErrorPosition(err),
        };
    }
}

/**
 * Nén (minify) chuỗi JSON — loại bỏ toàn bộ khoảng trắng thừa.
 * @param raw Chuỗi JSON gốc
 */
export function minifyJson(raw: string): JsonFormatResult {
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
        return { success: false, error: "Dữ liệu đầu vào trống." };
    }

    try {
        const parsed: unknown = JSON.parse(trimmed);
        const minified = JSON.stringify(parsed);
        return { success: true, data: minified };
    } catch (err) {
        return {
            success: false,
            error: extractErrorMessage(err),
            position: extractErrorPosition(err),
        };
    }
}

/**
 * Kiểm tra chuỗi có phải JSON hợp lệ hay không.
 * @param raw Chuỗi JSON cần kiểm tra
 */
export function validateJson(raw: string): { valid: boolean; error?: string; position?: number } {
    const trimmed = raw.trim();

    if (trimmed.length === 0) {
        return { valid: false, error: "Dữ liệu đầu vào trống." };
    }

    try {
        JSON.parse(trimmed);
        return { valid: true };
    } catch (err) {
        return {
            valid: false,
            error: extractErrorMessage(err),
            position: extractErrorPosition(err),
        };
    }
}

// ──────────────────────────────────────
// Internal helpers
// ──────────────────────────────────────

function extractErrorMessage(err: unknown): string {
    if (err instanceof SyntaxError) {
        return err.message;
    }
    return "Lỗi không xác định khi parse JSON.";
}

function extractErrorPosition(err: unknown): number | undefined {
    if (err instanceof SyntaxError) {
        // V8 engine: "... at position 42"
        const match = err.message.match(/position\s+(\d+)/i);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return undefined;
}
