/**
 * Tool search logic (pure, locale-agnostic).
 *
 * The caller passes already-localized strings (name/description/category label
 * for the current locale), so searching is inherently "by current language".
 * Matching is accent-insensitive (important for Vietnamese) and token-based:
 * the query is split into whitespace tokens and every token must be found in
 * one of the fields.
 */

export interface SearchableTool {
    id: string;
    path: string;
    category: string;
    isHot?: boolean;
    isNew?: boolean;
    /** Localized display name. */
    name: string;
    /** Localized description. */
    description: string;
    /** Localized category label. */
    categoryLabel: string;
}

export interface SearchResult {
    tool: SearchableTool;
    score: number;
}

/**
 * Lowercase, strip diacritics (incl. Vietnamese `đ`), and collapse whitespace.
 * `normalizeForSearch("Tạo mã QR")` → `"tao ma qr"`.
 */
export function normalizeForSearch(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/đ/g, "d")
        .replace(/\s+/g, " ")
        .trim();
}

function isBoundary(haystack: string, idx: number): boolean {
    if (idx <= 0) return true;
    return /[\s/\-_(]/.test(haystack[idx - 1]);
}

/**
 * Score a single token against one normalized field. Returns `null` if the
 * token is absent. A prefix match scores highest, then a word-boundary match,
 * then a mid-word match.
 */
function fieldScore(
    haystack: string,
    token: string,
    weights: { prefix: number; boundary: number; mid: number },
): number | null {
    const idx = haystack.indexOf(token);
    if (idx === -1) return null;
    if (idx === 0) return weights.prefix;
    return isBoundary(haystack, idx) ? weights.boundary : weights.mid;
}

/**
 * Rank tools against a query. Returns matches (every token found in at least
 * one field) sorted by descending relevance. Name matches outweigh description
 * matches, which outweigh category matches. Ties preserve input order (stable
 * sort), so the natural directory order wins.
 */
export function searchTools(
    query: string,
    tools: SearchableTool[],
): SearchResult[] {
    const nq = normalizeForSearch(query);
    if (!nq) return [];
    const tokens = nq.split(" ").filter(Boolean);

    const results: SearchResult[] = [];
    for (const tool of tools) {
        const name = normalizeForSearch(tool.name);
        const desc = normalizeForSearch(tool.description);
        const cat = normalizeForSearch(tool.categoryLabel);

        let score = 0;
        let matchedAll = true;
        for (const token of tokens) {
            const best = Math.max(
                fieldScore(name, token, { prefix: 100, boundary: 60, mid: 40 }) ?? -1,
                fieldScore(desc, token, { prefix: 24, boundary: 18, mid: 12 }) ?? -1,
                fieldScore(cat, token, { prefix: 16, boundary: 12, mid: 8 }) ?? -1,
            );
            if (best < 0) {
                matchedAll = false;
                break;
            }
            score += best;
        }
        if (!matchedAll) continue;

        // Whole-query bonuses on the name.
        if (name === nq) score += 200;
        else if (name.startsWith(nq)) score += 80;
        if (tool.isHot) score += 3;

        results.push({ tool, score });
    }

    results.sort((a, b) => b.score - a.score);
    return results;
}
