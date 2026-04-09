import CryptoJS from "crypto-js";

/**
 * Hash Generation logic using crypto-js
 */

export type HashAlgorithm = "md5" | "sha1" | "sha256" | "sha512";

/**
 * Generates a hash for the given input using the specified algorithm.
 */
export function generateHash(input: string, algorithm: HashAlgorithm): string {
    if (!input) return "";

    switch (algorithm) {
        case "md5":
            return CryptoJS.MD5(input).toString();
        case "sha1":
            return CryptoJS.SHA1(input).toString();
        case "sha256":
            return CryptoJS.SHA256(input).toString();
        case "sha512":
            return CryptoJS.SHA512(input).toString();
        default:
            throw new Error(`Thuật toán ${algorithm} không được hỗ trợ.`);
    }
}
