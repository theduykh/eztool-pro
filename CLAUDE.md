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

**Logic/UI Separation** — All computation lives in `lib/` as pure TypeScript functions with no React or browser API dependencies. Client Components in `app/(tools)/` import these functions. Every `lib/` file must have a sibling `.test.ts` file using Vitest.

**Tool Registry** — `config/tools.ts` is the single source of truth for all tools (id, name, description, path, category, isNew). The Sidebar reads this to build navigation. Register a tool here before creating its route.

**Routing Convention** — URL pattern is `/{category}/{tool-id}`. Folder: `app/(tools)/[category]/[tool-id]/`. Each tool has:
- `page.tsx` — Server Component, exports `metadata` for SEO
- `[ToolName]Client.tsx` — Client Component with `"use client"`, handles interactivity

**Rendering Strategy** — Pages default to Server Components. Only the smallest interactive unit should be a Client Component. Never put `"use client"` on a root page.

**Theming** — Dark/Light mode via `next-themes`. Always use Shadcn CSS variables (`bg-background`, `text-foreground`, `bg-card`, `border-border`, etc.) — never hardcode colors.

**Shared UI Primitives** — All tools reuse the same 5 primitives in `components/shared/`. Always compose these before reaching for raw `<div>` + Tailwind. Inconsistent one-offs are a bug.

- **`PageHeader`** — Standard page title + description strip rendered at the top of every `page.tsx`. Never duplicate title markup.
- **`ToolPanel`** — Card / section wrapper. Props: `tone` (`default`/`subtle`/`dashed`/`accent`), `padding` (`none`/`sm`/`md`/`lg`), `radius` (`md`/`lg`), optional `header` slot. Use instead of hand-rolled `rounded-*xl border border-border bg-card p-* shadow-*`.
- **`ToolLabel`** — Tiny uppercase section label. Props: `tone` (`default`/`muted`/`accent`/`danger`/`success`), optional `icon`, `htmlFor`. Use for every form label and panel heading (replaces `text-xs font-bold uppercase tracking-widest text-muted-foreground`).
- **`ToolInfoBox`** — Inline info/tip box with icon + optional title. Props: `tone` (`neutral`/`accent`/`warning`).
- **`ToolToggle`** — Standard blue-on switch for boolean options (uses `role="switch"`, `aria-checked`). Use instead of custom checkbox/toggle styling.

**Page Pattern (unified)** — Every `page.tsx` follows this shape:
```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { ToolClient } from "./ToolClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "tool-id")!;
export const metadata: Metadata = { title: `${tool.name} - eztool.pro`, description: tool.description };

export default function ToolPage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
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
  layout.tsx           # Root layout — fonts (Inter + Fira Code), ThemeProvider, AppShell
  page.tsx             # Homepage
  (tools)/[cat]/[tool]/
    page.tsx           # Server Component — exports metadata, renders Client Component
    *Client.tsx        # Client Component — interactive UI using lib/ functions
components/
  ui/                  # Shadcn UI components
  shared/              # AppShell, Sidebar, Header, ThemeProvider, ThemeToggle
                       # PageHeader, ToolPanel, ToolLabel, ToolInfoBox, ToolToggle (tool primitives)
lib/                   # Pure functions only — no React
  formatters/          # json.ts + json.test.ts
  string/              # word-counter.ts + word-counter.test.ts
  utils.ts             # cn() helper
config/
  tools.ts             # TOOLS_DIRECTORY — all 20 planned tools
```

## Adding a New Tool (required order)

1. **Register** — add entry to `TOOLS_DIRECTORY` in `config/tools.ts` with `id`, `name`, `description`, `path`, `category`, optional `layout` and `isNew`. The registry drives metadata, the sidebar, and the page header — so keep copy final.
2. **Logic** — create `lib/[domain]/[tool].ts` with pure functions, strict TypeScript, no `any`, return results/errors instead of throwing.
3. **Tests** — create `lib/[domain]/[tool].test.ts` with Vitest covering happy path + edge cases + error cases. Run with `npx vitest run`.
4. **UI** — create `app/(tools)/[category]/[tool-id]/page.tsx` (Server Component using the unified `PageHeader` pattern) and `[Tool]Client.tsx` (Client Component). Compose the 5 shared primitives — do not invent new card/label styling. Add `id` to every interactive element.

## Critical: Next.js 16 Breaking Changes

`params` in layouts and pages are now **Promises** — `await params` before accessing properties. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.

## TypeScript

Strict mode is on. Never use `any`. Define explicit `interface`/`type` for all function inputs/outputs. Handle `undefined`, `null`, and parsing errors exhaustively.
