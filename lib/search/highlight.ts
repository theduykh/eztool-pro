import { normalizeForSearch } from "./tool-search";

export interface HighlightSegment {
    text: string;
    match: boolean;
}

/**
 * Split `text` into segments marking which parts match the (accent-insensitive)
 * query tokens, so the UI can bold the matched ranges. Matching happens on a
 * normalized copy of the text while a code-point index map lets us map matches
 * back to the original (accented) characters — e.g. query "ma" highlights "mã"
 * in "Tạo mã QR".
 */
export function highlightSegments(
    text: string,
    query: string,
): HighlightSegment[] {
    const tokens = normalizeForSearch(query).split(" ").filter(Boolean);
    if (tokens.length === 0 || !text) return [{ text, match: false }];

    // Build a normalized string + a map from each normalized char to the
    // original code-point index. Normalizing per character keeps the mapping
    // exact even though diacritic stripping can change length.
    const chars = Array.from(text);
    let normalized = "";
    const map: number[] = [];
    chars.forEach((ch, i) => {
        const n = normalizeForSearch(ch);
        for (let k = 0; k < n.length; k++) map.push(i);
        normalized += n;
    });

    // Collect every token occurrence as a [startCp, endCp) range.
    const ranges: Array<[number, number]> = [];
    for (const token of tokens) {
        let from = 0;
        let idx = normalized.indexOf(token, from);
        while (idx !== -1) {
            const startCp = map[idx];
            const endCp = map[idx + token.length - 1] + 1;
            ranges.push([startCp, endCp]);
            from = idx + token.length;
            idx = normalized.indexOf(token, from);
        }
    }
    if (ranges.length === 0) return [{ text, match: false }];

    // Merge overlapping/adjacent ranges.
    ranges.sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [];
    for (const [s, e] of ranges) {
        const last = merged[merged.length - 1];
        if (last && s <= last[1]) last[1] = Math.max(last[1], e);
        else merged.push([s, e]);
    }

    // Emit segments from the original characters.
    const segments: HighlightSegment[] = [];
    let cursor = 0;
    for (const [s, e] of merged) {
        if (s > cursor) {
            segments.push({ text: chars.slice(cursor, s).join(""), match: false });
        }
        segments.push({ text: chars.slice(s, e).join(""), match: true });
        cursor = e;
    }
    if (cursor < chars.length) {
        segments.push({ text: chars.slice(cursor).join(""), match: false });
    }
    return segments;
}
