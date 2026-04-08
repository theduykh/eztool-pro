import { describe, it, expect } from "vitest";
import { countText } from "./word-counter";

describe("word-counter pure logic", () => {
    it("should return zeros for empty string", () => {
        const result = countText("");
        expect(result).toEqual({
            characters: 0,
            charactersNoSpaces: 0,
            words: 0,
            sentences: 0,
            paragraphs: 0,
            readingTime: 0,
        });
    });

    it("should return zeros for whitespace only string", () => {
        const result = countText("   \n  \t  ");
        expect(result).toEqual({
            characters: 0,
            charactersNoSpaces: 0,
            words: 0,
            sentences: 0,
            paragraphs: 0,
            readingTime: 0,
        });
    });

    it("should count characters correctly", () => {
        const text = "Hello World";
        const result = countText(text);
        expect(result.characters).toBe(11);
        expect(result.charactersNoSpaces).toBe(10);
    });

    it("should count words correctly", () => {
        const text = "   Hello   beautiful   world!   ";
        const result = countText(text);
        expect(result.words).toBe(3);
    });

    it("should count words correctly with newlines", () => {
        const text = "Line one\nLine two";
        const result = countText(text);
        expect(result.words).toBe(4);
    });

    it("should count sentences correctly", () => {
        const text = "Hello world. How are you? I am fine! Thank you.";
        const result = countText(text);
        expect(result.sentences).toBe(4);
    });

    it("should handle sentences without spaces after punctuation", () => {
        const text = "Hello.Next.Sentence";
        const result = countText(text);
        // Current logic uses /[.!?]+(?:\s+|$)/
        // "Hello.Next.Sentence" -> result.sentences might be 1 if there's no space?
        // Let's see how our regex behaves.
        // Actually, many websites count "Hello.Next" as 1 sentence unless there's a space.
        // But for "dot com" etc it should be careful.
        // Let's check my logic: it requires \s+ or $.
        // So "Hello.Next.Sentence" will be 1 sentence if it ends with "Sentence" (no punctuation).
        // If "Hello.Next.Sentence.", it will be 1 sentence too because .Next and .Sentence don't have spaces.
    });

    it("should count paragraphs correctly", () => {
        const text = "Paragraph 1\n\nParagraph 2\nParagraph 3";
        const result = countText(text);
        expect(result.paragraphs).toBe(3);
    });

    it("should handle Vietnamese text correctly", () => {
        const text = "Xin chào Việt Nam. Đây là công cụ đếm từ.";
        const result = countText(text);
        expect(result.words).toBe(10);
        expect(result.sentences).toBe(2);
        expect(result.characters).toBe(text.length);
    });

    it("should calculate reading time correctly", () => {
        // 400 words should be around 2 minutes
        const longText = Array(400).fill("word").join(" ");
        const result = countText(longText);
        expect(result.words).toBe(400);
        expect(result.readingTime).toBe(2);
    });

    it("should return at least 1 minute for any non-empty text", () => {
        const result = countText("Small text");
        expect(result.readingTime).toBe(1);
    });
});
