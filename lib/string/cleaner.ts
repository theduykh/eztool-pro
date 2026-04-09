/**
 * Text cleaning and formatting logic
 */

export interface CleaningOptions {
    removeEmptyLines: boolean;
    collapseSpaces: boolean;
    trimLines: boolean;
    removeAllLineBreaks: boolean;
}

/**
 * Cleans the input text based on the provided options.
 */
export function cleanText(text: string, options: CleaningOptions): string {
    if (!text) return "";

    let result = text;

    // 1. Trim individual lines
    if (options.trimLines) {
        result = result
            .split("\n")
            .map((line) => line.trim())
            .join("\n");
    }

    // 2. Remove empty lines
    if (options.removeEmptyLines) {
        result = result
            .split("\n")
            .filter((line) => line.trim() !== "")
            .join("\n");
    }

    // 3. Collapse multiple spaces into one
    if (options.collapseSpaces) {
        // We handle this line by line if we want to preserve line breaks
        result = result
            .split("\n")
            .map((line) => line.replace(/[ \t]+/g, " "))
            .join("\n");
    }

    // 4. Remove all line breaks (convert to a single line)
    if (options.removeAllLineBreaks) {
        result = result.replace(/\r?\n|\r/g, " ");
        // If we also collapsed spaces, we might need to do it once more after joining
        if (options.collapseSpaces) {
            result = result.replace(/[ \t\n\r]+/g, " ");
        }
    }

    return result.trim();
}
