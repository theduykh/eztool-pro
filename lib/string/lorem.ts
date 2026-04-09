/**
 * Lorem Ipsum Generation logic
 */

const LOREM_WORDS = [
    "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
    "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
    "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
    "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea",
    "commodo", "consequat", "duis", "aute", "irure", "dolor", "in", "reprehenderit",
    "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla",
    "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident",
    "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum"
];

export type LoremType = "words" | "sentences" | "paragraphs";

interface LoremOptions {
    type: LoremType;
    count: number;
    startWithLorem?: boolean;
}

/**
 * Generates Lorem Ipsum text based on options.
 */
export function generateLorem({ type, count, startWithLorem = true }: LoremOptions): string {
    if (count <= 0) return "";

    let result = "";

    switch (type) {
        case "words":
            result = generateWords(count);
            break;
        case "sentences":
            result = Array.from({ length: count }, () => generateSentence()).join(" ");
            break;
        case "paragraphs":
            result = Array.from({ length: count }, () => generateWords(Math.floor(Math.random() * 50) + 50, true)).join("\n\n");
            break;
    }

    if (startWithLorem) {
        const prefix = ["Lorem", "ipsum", "dolor", "sit", "amet"];
        
        if (type === "words") {
            const words = result.split(" ");
            // Replace the start of the array with prefix words, up to the prefix length or total count
            for (let i = 0; i < Math.min(prefix.length, count); i++) {
                words[i] = prefix[i];
            }
            result = words.join(" ");
        } else if (type === "sentences" || type === "paragraphs") {
            // For sentences/paragraphs, just prepend if it doesn't already start with Lorem
            if (!result.toLowerCase().startsWith("lorem ipsum")) {
                result = prefix.join(" ") + " " + result.charAt(0).toLowerCase() + result.slice(1);
            }
        }
    }

    return result;
}

function generateWords(num: number, capitalizeFirst = false): string {
    const words = [];
    for (let i = 0; i < num; i++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }
    let str = words.join(" ");
    if (capitalizeFirst) {
        str = str.charAt(0).toUpperCase() + str.slice(1);
    }
    return str;
}

function generateSentence(): string {
    const length = Math.floor(Math.random() * 10) + 5;
    let sentence = generateWords(length, true);
    return sentence + ".";
}

/**
 * Truncates or generates text to match a specific character count.
 */
export function generateLoremByChars(chars: number): string {
    if (chars <= 0) return "";
    let text = generateLorem({ type: "paragraphs", count: Math.ceil(chars / 50) });
    if (text.length > chars) {
        return text.substring(0, chars).trim();
    }
    return text;
}
