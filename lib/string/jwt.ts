/**
 * JWT Decoding logic
 */

export interface JWTDecoded {
    header: any;
    payload: any;
    signature: string;
}

/**
 * Decodes a Base64Url string to UTF-8 text.
 */
function base64UrlDecode(str: string): string {
    // Convert Base64Url to Base64
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    
    // Add padding if necessary
    while (base64.length % 4) {
        base64 += "=";
    }

    // Decode using the robust method that handles Unicode
    const binString = atob(base64);
    const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

/**
 * Decodes a JWT token without verification.
 */
export function decodeJWT(token: string): JWTDecoded {
    if (!token) throw new Error("Vui lòng nhập token.");

    const parts = token.split(".");
    if (parts.length !== 3) {
        throw new Error("Token JWT không hợp lệ. Token phải có 3 phần cách nhau bởi dấu chấm.");
    }

    try {
        const header = JSON.parse(base64UrlDecode(parts[0]));
        const payload = JSON.parse(base64UrlDecode(parts[1]));
        const signature = parts[2];

        return { header, payload, signature };
    } catch (e) {
        throw new Error("Không thể giải mã Token. Dữ liệu có thể bị sai định dạng JSON hoặc Base64Url.");
    }
}
