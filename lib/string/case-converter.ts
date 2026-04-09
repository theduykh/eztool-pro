/**
 * Case conversion logic for text tools
 */

export type CaseType =
    | "uppercase"
    | "lowercase"
    | "sentence"
    | "title"
    | "camel"
    | "pascal"
    | "snake"
    | "kebab";

/**
 * Converts text to the specified case type.
 */
export function convertCase(text: string, type: CaseType): string {
    if (!text) return "";

    switch (type) {
        case "uppercase":
            return text.toUpperCase();
        case "lowercase":
            return text.toLowerCase();
        case "sentence":
            return toSentenceCase(text);
        case "title":
            return toTitleCase(text);
        case "camel":
            return toCamelCase(text);
        case "pascal":
            return toPascalCase(text);
        case "snake":
            return toSnakeCase(text);
        case "kebab":
            return toKebabCase(text);
        default:
            return text;
    }
}

function toSentenceCase(text: string): string {
    // lowercase everything then capitalize first letter of each sentence
    return text.toLowerCase().replace(/(^\s*|\.\s+)([a-zà-ỹ])/g, (match) => match.toUpperCase());
}

function toTitleCase(text: string): string {
    return text.toLowerCase().split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}

function toCamelCase(text: string): string {
    return text
        .toLowerCase()
        .replace(/[^a-zA-Z0-9à-ỹ]+(.)/g, (m, chr) => chr.toUpperCase())
        .replace(/^[A-ZÀ-Ỹ]/, c => c.toLowerCase());
}

function toPascalCase(text: string): string {
    const camel = toCamelCase(text);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(text: string): string {
    return text
        .match(/[A-ZÀ-Ỹ]{2,}(?=[A-ZÀ-Ỹ][a-zà-ỹ]+[0-9]*|\b)|[A-ZÀ-Ỹ]?[a-zà-ỹ]+[0-9]*|[A-ZÀ-Ỹ]|[0-9]+/g)
        ?.map(x => x.toLowerCase())
        .join('_') || text.toLowerCase();
}

function toKebabCase(text: string): string {
    return toSnakeCase(text).replace(/_/g, '-');
}
