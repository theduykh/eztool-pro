/**
 * Word Counter Logic
 * counts characters, words, sentences, and paragraphs in a given text.
 */

export interface WordCountResult {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    sentences: number;
    paragraphs: number;
    readingTime: number; // Estimated reading time in minutes
}

/**
 * Calculates detailed statistics for the provided text.
 * @param text The input string to analyze
 * @returns WordCountResult object containing statistics
 */
export function countText(text: string): WordCountResult {
    if (!text || text.trim() === "") {
        return {
            characters: 0,
            charactersNoSpaces: 0,
            words: 0,
            sentences: 0,
            paragraphs: 0,
            readingTime: 0,
        };
    }

    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;

    // Word count logic:
    // 1. Trim leading/trailing whitespace
    // 2. Split by any sequence of whitespace characters (spaces, tabs, newlines)
    // 3. Filter out empty results
    const wordsArray = text.trim().split(/\s+/).filter((word) => word.length > 0);
    const words = wordsArray.length;

    // Sentence count logic:
    // Split by punctuation followed by space or end of string.
    // Includes . ! ? as sentence delimiters.
    const sentencesArray = text
        .split(/[.!?]+(?:\s+|$)/)
        .filter((s) => s.trim().length > 0);
    const sentences = sentencesArray.length;

    // Paragraph count logic:
    // Split by one or more newline characters.
    const paragraphsArray = text
        .split(/\n+/)
        .filter((p) => p.trim().length > 0);
    const paragraphs = paragraphsArray.length;

    // Reading time calculation:
    // Average reading speed is roughly 200 words per minute.
    const readingTime = Math.max(1, Math.ceil(words / 200));

    return {
        characters,
        charactersNoSpaces,
        words,
        sentences,
        paragraphs,
        readingTime: words === 0 ? 0 : readingTime,
    };
}
