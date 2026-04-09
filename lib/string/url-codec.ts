/**
 * URL Encoding and Decoding logic
 */

/**
 * Encodes a string to a URL-safe format.
 * Uses encodeURIComponent for maximum safety.
 */
export function encodeUrl(input: string): string {
    if (!input) return "";
    try {
        return encodeURIComponent(input);
    } catch (e) {
        throw new Error("Không thể mã hóa URL. Vui lòng kiểm tra lại dữ liệu đầu vào.");
    }
}

/**
 * Decodes a URL-encoded string.
 */
export function decodeUrl(input: string): string {
    if (!input) return "";
    try {
        return decodeURIComponent(input.replace(/\+/g, " "));
    } catch (e) {
        throw new Error("Không thể giải mã URL. Dữ liệu có thể bị sai định dạng.");
    }
}
