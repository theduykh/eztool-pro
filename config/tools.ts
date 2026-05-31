export type ToolCategory = "dev" | "image" | "text" | "math";

export interface ToolItem {
    id: string;
    path: string;
    category: ToolCategory;
    isNew?: boolean;
    isHot?: boolean;
    /**
     * Controls the max-width of the tool's content wrapper in AppShell.
     * - "full":    no max-width — use for split-pane editors, wheels, canvases, anything wide
     * - "fixed":   max-w-3xl centered — use for narrow calculators / single-field forms
     * - undefined: max-w-6xl centered (default) — use for the rest
     */
    layout?: "full" | "fixed";
}

/**
 * Structural source of truth for every tool. User-visible strings (name +
 * description) live in `messages/{locale}.json` under `tools.<id>` and are
 * resolved by `id` via next-intl. Category labels live under `categories.<id>`.
 */
export const TOOLS_DIRECTORY: ToolItem[] = [
    // ==========================================
    // 💻 DEV TOOLS
    // ==========================================
    {
        id: "json-formatter",
        path: "/dev/json-formatter",
        category: "dev",
        isHot: true,
        layout: "full",
    },
    {
        id: "markdown-viewer",
        path: "/dev/markdown-viewer",
        category: "dev",
        layout: "full",
        isNew: true,
    },
    {
        id: "html-viewer",
        path: "/dev/html-viewer",
        category: "dev",
        layout: "full",
        isNew: true,
    },
    {
        id: "base64-encode-decode",
        path: "/dev/base64-encode-decode",
        category: "dev",
        layout: "full",
    },
    {
        id: "url-encode-decode",
        path: "/dev/url-encode-decode",
        category: "dev",
        layout: "full",
    },
    {
        id: "jwt-decoder",
        path: "/dev/jwt-decoder",
        category: "dev",
        layout: "full",
    },
    {
        id: "hash-generator",
        path: "/dev/hash-generator",
        category: "dev",
        layout: "full",
    },

    // ==========================================
    // 🖼️ IMAGE TOOLS
    // ==========================================
    {
        id: "qr-generator",
        path: "/image/qr-generator",
        category: "image",
        isHot: true,
    },
    {
        id: "color-converter",
        path: "/image/color-converter",
        category: "image",
    },
    {
        id: "image-to-base64",
        path: "/image/image-to-base64",
        category: "image",
        layout: "full",
    },
    {
        id: "svg-placeholder",
        path: "/image/svg-placeholder",
        category: "image",
    },
    {
        id: "image-resizer",
        path: "/image/image-resizer",
        category: "image",
        layout: "full",
    },

    // ==========================================
    // 🔤 TEXT TOOLS
    // ==========================================
    {
        id: "word-counter",
        path: "/text/word-counter",
        category: "text",
        layout: "full",
    },
    {
        id: "case-converter",
        path: "/text/case-converter",
        category: "text",
    },
    {
        id: "text-to-slug",
        path: "/text/text-to-slug",
        category: "text",
        layout: "fixed",
    },
    {
        id: "lorem-ipsum",
        path: "/text/lorem-ipsum",
        category: "text",
    },
    {
        id: "remove-line-breaks",
        path: "/text/remove-line-breaks",
        category: "text",
        layout: "full",
    },

    // ==========================================
    // 🧮 MATH & CALC
    // ==========================================
    {
        id: "percentage-calculator",
        path: "/math/percentage-calculator",
        category: "math",
    },
    {
        id: "bmi-calculator",
        path: "/math/bmi-calculator",
        category: "math",
        layout: "fixed",
    },
    {
        id: "unit-converter",
        path: "/math/unit-converter",
        category: "math",
    },
    {
        id: "rule-of-three",
        path: "/math/rule-of-three",
        category: "math",
    },
    {
        id: "lucky-wheel",
        path: "/math/lucky-wheel",
        category: "math",
        isNew: true,
    },
];

export interface ToolCategoryItem {
    id: ToolCategory;
    icon: string;
}

/**
 * Categories for the Sidebar. Labels are resolved from the `categories`
 * namespace in the message catalogs, keyed by `id`.
 */
export const getCategories = (): ToolCategoryItem[] => {
    return [
        { id: "dev", icon: "terminal" },
        { id: "image", icon: "image" },
        { id: "text", icon: "type" },
        { id: "math", icon: "calculator" },
    ];
};
