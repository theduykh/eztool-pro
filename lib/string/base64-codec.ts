/**
 * Base64 Encoding and Decoding logic
 * Supports Unicode (UTF-8) characters
 */

/**
 * Encodes a string to Base64 format.
 * Supports UTF-8 characters properly.
 */
export function encodeBase64(input: string): string {
    if (!input) return "";
    try {
        // Handle Unicode by converting to UTF-8 bytes first
        const bytes = new TextEncoder().encode(input);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        return btoa(binString);
    } catch (e) {
        throw new Error("Không thể mã hóa Base64. Dữ liệu đầu vào không hợp lệ.");
    }
}

/**
 * Decodes a Base64-encoded string.
 * Supports UTF-8 characters properly.
 */
export function decodeBase64(input: string): string {
    if (!input) return "";
    try {
        const binString = atob(input.trim());
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    } catch (e) {
        throw new Error("Dữ liệu Base64 không hợp lệ hoặc bị lỗi định dạng.");
    }
}
