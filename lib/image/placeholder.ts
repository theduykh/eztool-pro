/**
 * SVG Placeholder generation logic
 */

export interface PlaceholderOptions {
    width: number;
    height: number;
    text?: string;
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
}

/**
 * Generates a raw SVG string for a placeholder image
 */
export function generateSVGPlaceholder(options: PlaceholderOptions): string {
    const {
        width,
        height,
        text = `${width}x${height}`,
        bgColor = "#cccccc",
        textColor = "#969696",
        fontSize = Math.floor(Math.min(width, height) * 0.2)
    } = options;

    return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="${bgColor}" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="${fontSize}" fill="${textColor}">
        ${text}
    </text>
</svg>`;
}

/**
 * Converts SVG string to Data URI
 */
export function svgToDataUri(svg: string): string {
    const encoded = encodeURIComponent(svg)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
    return `data:image/svg+xml;charset=UTF-8,${encoded}`;
}
