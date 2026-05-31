# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Build for production (static export)
npm run lint       # Run ESLint

# Run a single test file
npx vitest run lib/[domain]/[file].test.ts

# Run all tests
npx vitest run
```

## Architecture

**eztool.pro** is a static-export Next.js 16 (App Router) multi-tool utility platform.

### Key Architectural Decisions

**Logic/UI Separation** — All computation lives in `lib/` as pure TypeScript functions with no React or browser API dependencies. Client Components in `app/[locale]/(tools)/` import these functions. Every `lib/` file must have a sibling `.test.ts` file using Vitest.

**Tool Registry** — `config/tools.ts` is the single source of truth for tool *structure* (id, path, category, isNew, isHot, layout). User-visible strings (`name`, `description`) do **not** live here — they live in `messages/{locale}.json` under `tools.<id>` and are resolved by `id` via next-intl. Register a tool's structure here before creating its route, and add its translations to every locale file.

**Internationalization (i18n)** — Multi-language via **next-intl** with locale-prefixed routes (`/en`, `/vi`, `/zh`, `/ko`, `/ja`). See the dedicated section below. Static export means **no middleware** — locale routing is done purely with the `[locale]` segment + `generateStaticParams`.

**Routing Convention** — URL pattern is `/{locale}/{category}/{tool-id}`. Folder: `app/[locale]/(tools)/[category]/[tool-id]/`. Each tool has:
- `page.tsx` — async Server Component, exports `generateMetadata` (localized title/description + hreflang `alternates`) for SEO
- `[ToolName]Client.tsx` — Client Component with `"use client"`, handles interactivity

**Rendering Strategy** — Pages default to Server Components. Only the smallest interactive unit should be a Client Component. Never put `"use client"` on a root page.

**Theming** — Dark/Light mode via `next-themes`. Always use Shadcn CSS variables (`bg-background`, `text-foreground`, `bg-card`, `border-border`, etc.) — never hardcode colors.

**Navigation (locale-aware, required)** — Never import `Link`/`usePathname`/`useRouter` from `next/link` or `next/navigation` in app/shell code. Import them from `@/i18n/navigation` instead — these wrappers add the active locale prefix automatically, and `usePathname()` returns the path **without** the locale (so `pathname === tool.path` still works). Tool-internal Client components that don't navigate are exempt.

**Shared UI Primitives** — All tools reuse the same 5 primitives in `components/shared/`. Always compose these before reaching for raw `<div>` + Tailwind. Inconsistent one-offs are a bug.

- **`PageHeader`** — Standard page title + description strip rendered at the top of every `page.tsx`. Never duplicate title markup.
- **`ToolPanel`** — Card / section wrapper. Props: `tone` (`default`/`subtle`/`dashed`/`accent`), `padding` (`none`/`sm`/`md`/`lg`), `radius` (`md`/`lg`), optional `header` slot. Use instead of hand-rolled `rounded-*xl border border-border bg-card p-* shadow-*`.
- **`ToolLabel`** — Tiny uppercase section label. Props: `tone` (`default`/`muted`/`accent`/`danger`/`success`), optional `icon`, `htmlFor`. Use for every form label and panel heading (replaces `text-xs font-bold uppercase tracking-widest text-muted-foreground`).
- **`ToolInfoBox`** — Inline info/tip box with icon + optional title. Props: `tone` (`neutral`/`accent`/`warning`).
- **`ToolToggle`** — Standard blue-on switch for boolean options (uses `role="switch"`, `aria-checked`). Use instead of custom checkbox/toggle styling.

**Page Pattern (unified)** — Every tool `page.tsx` is an async Server Component that awaits `params` for the locale, localizes metadata, and calls `setRequestLocale` for static rendering:
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
        title: t(`${tool.id}.name`),               // "%s | eztool.pro" template is applied by the layout
        description: t(`${tool.id}.description`),
        alternates: buildAlternates(locale, tool.path),   // canonical + hreflang for all locales + x-default
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

**Layout Hint** — Each tool declares a `layout` in `config/tools.ts` (`"full"` for tools filling viewport height, `"fixed"` for centered fixed-width content). Omit for default scroll layout.

**QA IDs (required)** — Every interactive element (button, input, select, toggle, output region) must have a stable, semantic `id`. Convention: `btn-*`, `input-*`, `output-*`, `select-*`, `toggle-*`, `opt-*`. This is load-bearing for e2e / Playwright automation.

### Directory Map

```
app/
  layout.tsx           # Pass-through ROOT layout (returns children) — imports globals.css only
  page.tsx             # Root "/" redirect → best-match locale (renders its own minimal <html>)
  not-found.tsx        # Global 404 (out/404.html) for unmatched top-level paths
  sitemap.ts           # Per-(path × locale) sitemap.xml with hreflang alternates
  robots.ts            # robots.txt → sitemap
  [locale]/
    layout.tsx         # Real document: <html lang={locale}>, fonts, ThemeProvider, AppShell,
                       # NextIntlClientProvider; generateStaticParams() + setRequestLocale()
    page.tsx           # Homepage (localized)
    not-found.tsx      # Localized in-app 404
    (tools)/[cat]/[tool]/
      page.tsx         # async Server Component — generateMetadata + setRequestLocale
      *Client.tsx      # Client Component — interactive UI using lib/ functions
i18n/                  # next-intl wiring
  routing.ts           # locales, defaultLocale, localeNames, defineRouting (localePrefix: "always")
  navigation.ts        # locale-aware Link / usePathname / useRouter (use these, not next/*)
  request.ts           # getRequestConfig — loads messages/{locale}.json
messages/              # Translation catalogs: en, vi, zh, ko, ja. Namespaces: common, home,
                       # categories, notFound, search, metadata, tools.<id>.{name,description},
                       # toolCommon (strings shared across tools), toolUI.<id> (per-tool UI strings)
components/
  ui/                  # Shadcn UI components
  shared/              # AppShell, Sidebar, Header, ThemeProvider, ThemeToggle, LanguageSwitcher
                       # PageHeader, ToolPanel, ToolLabel, ToolInfoBox, ToolToggle (tool primitives)
lib/                   # Pure functions only — no React
  formatters/          # json.ts + json.test.ts
  string/              # word-counter.ts + word-counter.test.ts
  seo/                 # alternates.ts (buildAlternates / localizedHref) + alternates.test.ts
  utils.ts             # cn() helper
config/
  tools.ts             # TOOLS_DIRECTORY — tool structure (no display strings)
  site.ts              # SITE_URL — canonical origin for metadata/sitemap/robots
```

## Adding a New Tool (required order)

1. **Register** — add a structural entry to `TOOLS_DIRECTORY` in `config/tools.ts` with `id`, `path`, `category`, optional `layout`/`isNew`/`isHot`. No `name`/`description` here.
2. **Translate** — in **every** `messages/{locale}.json` (en, vi, zh, ko, ja): add `tools.<id>.name`/`.description`, plus a `toolUI.<id>` block for the tool's own UI strings (reuse `toolCommon` for shared ones like copy/paste/clear). The id must match the registry entry. Strings with literal `{ }` (code/JSON samples) are read with `t.raw()`.
3. **Logic** — create `lib/[domain]/[tool].ts` with pure functions, strict TypeScript, no `any`, return results/errors instead of throwing.
4. **Tests** — create `lib/[domain]/[tool].test.ts` with Vitest covering happy path + edge cases + error cases. Run with `npx vitest run`.
5. **UI** — create `app/[locale]/(tools)/[category]/[tool-id]/page.tsx` (async Server Component using the unified Page Pattern above) and `[Tool]Client.tsx` (Client Component reading text via `useTranslations("toolUI.<id>")` + `useTranslations("toolCommon")` — no hardcoded strings). Compose the 5 shared primitives. Add `id` to every interactive element.

The tool is automatically picked up by the sidebar, homepage, breadcrumbs, sitemap, and hreflang alternates — no other wiring needed.

> Full reference: **`.agents/skills/eztool-i18n/SKILL.md`**. Summary below.

- **Library**: next-intl. Locales (`en`, `vi`, `zh`, `ko`, `ja`) and `defaultLocale` are defined once in `i18n/routing.ts`. To add a locale: extend `locales`/`localeNames` there and add a `messages/<locale>.json`.
- **URLs**: every locale is prefixed (`/en/...`). Root `/` is a static redirect page that picks the best match from `navigator.language`. There is **no middleware** (static export) — routing is the `[locale]` segment + `generateStaticParams`.
- **Reading strings**: server components use `getTranslations` (async) from `next-intl/server`; client components use `useTranslations` from `next-intl`. `useTranslations` also works in *sync* server components.
- **String namespaces**: tool *name/description* → `tools.<id>`; in-tool UI strings → `toolUI.<id>` (per tool) or `toolCommon` (shared across tools). `config/tools.ts` holds no strings.
- **ICU braces**: next-intl parses `{ }` as ICU args. A string with *literal* braces (JSON/HTML/code sample) must be read with **`t.raw(key)`**, not `t(key)`, or it throws `MALFORMED_ARGUMENT`. Use `t(key, { count })` only for real interpolation (`{count}`, `{alg}`, `{query}`).
- **Navigation**: import `Link`/`usePathname`/`useRouter` from `@/i18n/navigation`, never `next/*`.
- **Language switcher**: `LanguageSwitcher` does a **full** `window.location.assign(...)` (not a soft router push) so the `[locale]` layout — which renders the next-themes anti-flash `<script>` — re-renders on the server, avoiding React's "script tag while rendering" warning.
- **Static rendering**: every page/layout that renders translated content must call `setRequestLocale(locale)` (already done in the locale layout, homepage, and tool pages).
- **SEO**: `<html lang>` is per-locale (locale layout); `buildAlternates(locale, path)` in `lib/seo/alternates.ts` produces the canonical + reciprocal hreflang block (incl. `x-default`); `metadataBase` (from `config/site.ts`) makes alternate URLs absolute; `app/sitemap.ts` emits all locale variants.

## Critical: Next.js 16 Breaking Changes

`params` in layouts and pages are now **Promises** — `await params` before accessing properties. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.

## TypeScript

Strict mode is on. Never use `any`. Define explicit `interface`/`type` for all function inputs/outputs. Handle `undefined`, `null`, and parsing errors exhaustively.
