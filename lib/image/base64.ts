/**
 * Image to Base64 utility functions
 */

/**
 * Wraps base64 string with appropriate Data URI prefix if not already present
 */
export function toDataUri(base64: string, mimeType: string): string {
    if (base64.startsWith("data:")) return base64;
    return `data:${mimeType};base64,${base64}`;
}

/**
 * Extracts raw base64 string from a Data URI
 */
export function fromDataUri(dataUri: string): { mimeType: string; base64: string } {
    const matches = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
        return {
            mimeType: matches[1],
            base64: matches[2]
        };
    }
    return { mimeType: "image/png", base64: dataUri };
}

/**
 * Formats data URI for CSS use
 */
export function toCssDataUri(dataUri: string): string {
    return `url("${dataUri}")`;
}

/**
 * Formats data URI for HTML img use
 */
export function toHtmlTag(dataUri: string, alt: string = "image"): string {
    return `<img src="${dataUri}" alt="${alt}" />`;
}
