/**
 * URL Slug generation logic
 * Special handling for Vietnamese characters
 */

/**
 * Converts a string to a URL-friendly slug.
 * Removes Vietnamese diacritics, special characters and replaces spaces with hyphens.
 */
export function toSlug(text: string): string {
    if (!text) return "";

    let slug = text.trim();

    // 1. Convert to lowercase
    slug = slug.toLowerCase();

    // 2. Remove Vietnamese diacritics
    slug = slug.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // 3. Specifically handle 'đ' (which is not handled by NFD normalization for some reason sometimes)
    slug = slug.replace(/[đ]/g, "d");

    // 4. Remove special characters and replace spaces with hyphens
    // Keep only letters, numbers, and hyphens/underscores
    slug = slug.replace(/[^a-z0-9\s-]/g, "")
               .replace(/\s+/g, "-")
               .replace(/-+/g, "-");

    // 5. Trim leading and trailing hyphens
    slug = slug.replace(/^-+|-+$/g, "");

    return slug;
}
