---
name: eztool-coding-standard
description: Coding standards and code conventions for eztool.pro. Read this skill before writing any code for the project.
---

# eztool.pro Coding Standard

"eztool.pro" is an SEO-friendly utility-tool platform built with Next.js 16 (App Router) and TypeScript. When working in this codebase, you must strictly follow the rules below:

## 1. Logic / UI Separation (Pure Functions)
- No computation or data-transformation logic may live inside React Components.
- Extract it into pure functions placed in the `lib/` directory.
- Logic must not depend on React or the Window object (except when truly necessary) so it remains 100% testable.

## 2. TypeScript Strict Mode
- Never use `any`. Define explicit `interface` or `type` for every input/output.
- You must exhaustively handle `undefined`, `null`, and parsing errors.

## 3. Next.js App Router & Rendering
- Pages (`page.tsx`) must default to **Server Components** for SEO friendliness.
- Minimize `"use client"`. Only place this directive on the smallest component that contains user interaction (buttons, form inputs). NEVER put `"use client"` on a root page.
- Generate dynamic, **localized** `<title>`/`<meta>` per tool via an async `generateMetadata` (not a static `metadata` export) — see §4.2. Include hreflang `alternates`.
- **IMPORTANT:** This is Next.js 16 — `params` in layouts/pages are Promises. Read the docs at `node_modules/next/dist/docs/` before using new APIs.

## 3.1 Internationalization (READ THE i18n SKILL)
- The app is **multi-language (5 locales) on a static export** via next-intl. Every route lives under `app/[locale]/`. **No user-visible string may be hardcoded.**
- Before adding/translating any text, routing, metadata, or SEO, read `.agents/skills/eztool-i18n/SKILL.md`.
- Quick rules:
  - Tool **name/description** → `messages/{locale}.json` under `tools.<id>`.
  - In-tool UI strings → `toolUI.<id>` (tool-specific) or `toolCommon` (shared: copy, paste, clear…).
  - Client components read with `useTranslations("toolUI.<id>")` + `useTranslations("toolCommon")`.
  - Strings with literal `{ }` (JSON/HTML/code samples) → use `t.raw()`, not `t()` (ICU parses braces).
  - Import `Link`/`usePathname`/`useRouter` from `@/i18n/navigation`, never from `next/*`.

## 4. UI / UX
- Use **Tailwind CSS** together with **Shadcn UI** (located in `components/ui/`).
- Preferred design style: "Clean, Minimal, Professional". Responsiveness is mandatory.
- Always handle every experience state: Loading, Error, and Empty state.
- Support **Dark/Light mode** — use Shadcn CSS variables (bg-background, text-foreground, bg-card, border-border...). NEVER hardcode colors.

### 4.1 Shared Primitives (MANDATORY — do NOT re-implement)

Every tool must compose the 5 primitives in `components/shared/`. Never hand-roll `<div className="rounded-... border ... bg-card ...">`.

| Primitive | Purpose | Key props |
|---|---|---|
| `PageHeader` | Standard header of each `page.tsx` (title + description) | `title`, `description` |
| `ToolPanel` | Card / section wrapper | `tone` (`default`/`subtle`/`dashed`/`accent`), `padding` (`none`/`sm`/`md`/`lg`), `radius` (`md`/`lg`), optional `header`, `bodyClassName` |
| `ToolLabel` | Small uppercase label for inputs and panels | `tone` (`default`/`muted`/`accent`/`danger`/`success`), `icon`, `htmlFor` |
| `ToolInfoBox` | Inline tip / info box | `tone` (`neutral`/`accent`/`warning`), `icon`, `title` |
| `ToolToggle` | Standard boolean switch | `id`, `checked`, `onChange`, `label` |

Standard example:
```tsx
<ToolPanel radius="lg" padding="lg">
    <ToolLabel icon={<Ruler className="size-4" />}>Dimensions</ToolLabel>
    <input id="input-width" ... />
</ToolPanel>

<ToolInfoBox tone="accent" icon={<Info className="size-5" />} title="Tip">
    <p>Short tip content...</p>
</ToolInfoBox>
```

### 4.2 Unified Page Pattern

Every tool `page.tsx` is an **async Server Component**: it awaits `params` for the
locale, localizes metadata + hreflang alternates, and calls `setRequestLocale` for
static rendering. Display strings come from `messages/`, not from `config/tools.ts`.

```tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { buildAlternates } from "@/lib/seo/alternates";
import { ToolClient } from "./ToolClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "tool-id")!;
type LocaleParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "tools" });
    return {
        title: t(`${tool.id}.name`),               // "%s | eztool.pro" template added by layout
        description: t(`${tool.id}.description`),
        alternates: buildAlternates(locale, tool.path),
    };
}

export default async function ToolPage({ params }: LocaleParams) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("tools");
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={t(`${tool.id}.name`)} description={t(`${tool.id}.description`)} />
            <ToolClient />
        </div>
    );
}
```

Each tool in `config/tools.ts` declares a `layout`: `"full"` for tools that fill the full viewport height (JSON formatter, lucky wheel...), `"fixed"` for centered fixed-width content. Omit for the default scroll layout.

## 5. QA Automation Mindset (Testing)
- Whenever you create a new logic file in `lib/`, you MUST create a sibling `.test.ts` file next to it.
- Write Unit Tests with **Vitest**. Test cases must cover two main areas:
  - Happy Path (ideal path, valid input).
  - Edge Cases (unusual, error, and boundary conditions).
- Every important UI element (input, button, tab, control, form) MUST have a clear, meaningful `id` attribute. This supports QA automation and writing e2e test scripts (e.g. Playwright, Selenium, Cypress).
- **`id` convention:** `btn-*` for buttons, `input-*` for input/textarea, `output-*` for result regions, `select-*` for selects, `toggle-*` for ToolToggle, `opt-*` for tabs/options. Examples: `btn-copy`, `input-text`, `output-result`, `select-from-unit`, `toggle-upper`, `opt-double-spaces`.

## 6. Current Project Structure

```
eztool-pro/
├── app/
│   ├── layout.tsx              # PASS-THROUGH root (returns children) — globals.css only
│   ├── globals.css             # Tailwind v4 + Shadcn CSS vars (dark/light)
│   ├── page.tsx                # "/" → client redirect to best-match locale
│   ├── not-found.tsx           # global 404 (out/404.html)
│   ├── sitemap.ts robots.ts    # per-(path × locale) SEO
│   └── [locale]/               # ALL routes are locale-prefixed
│       ├── layout.tsx          # real <html lang>, fonts, providers, AppShell, generateStaticParams
│       ├── page.tsx            # Homepage (localized)
│       └── (tools)/[category]/[tool]/page.tsx   # async Server Component (generateMetadata + setRequestLocale)
├── i18n/                       # next-intl wiring: routing.ts, navigation.ts, request.ts
├── messages/                   # en/vi/zh/ko/ja.json translation catalogs
├── components/
│   ├── ui/                     # Shadcn UI components (button, input, textarea, select, dialog...)
│   └── shared/                 # AppShell, Sidebar, Header, Footer, ThemeProvider, ThemeToggle,
│                               #   LanguageSwitcher, SearchCommand, PageHeader + ToolPanel/Label/InfoBox/Toggle
├── lib/                        # Pure logic functions (NO React) — sibling .test.ts each
│   ├── utils.ts  formatters/  math/  string/
│   ├── search/                 # tool-search.ts, highlight.ts (command palette)
│   └── seo/                    # alternates.ts (buildAlternates / localizedHref)
└── config/
    ├── tools.ts                # Registry: structure only (id, path, category, flags, layout) — NO strings
    ├── tool-icons.ts           # icon map per tool/category
    └── site.ts                 # SITE_URL canonical origin
```

## 7. Routing Convention
- URL pattern: `/{locale}/{category}/{tool-id}` — e.g. `/en/dev/json-formatter`, `/vi/text/word-counter`
- Folder structure: `app/[locale]/(tools)/[matching the path in config/tools.ts]/page.tsx`
- `config/tools.ts` `path` stays **unprefixed** (`/dev/json-formatter`); the locale wrappers add the prefix.
- Each page exports an async `generateMetadata` (localized title/description + hreflang alternates) and calls `setRequestLocale(locale)`.
- The client-interactive component lives in a separate file, with `"use client"` only on that component.
