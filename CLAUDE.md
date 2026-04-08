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
lib/                   # Pure functions only — no React
  formatters/          # json.ts + json.test.ts
  string/              # word-counter.ts + word-counter.test.ts
  utils.ts             # cn() helper
config/
  tools.ts             # TOOLS_DIRECTORY — all 20 planned tools
```

## Adding a New Tool (required order)

1. **Logic first** — create `lib/[domain]/[tool].ts` with pure functions, strict TypeScript, no `any`, return results/errors instead of throwing.
2. **Tests second** — create `lib/[domain]/[tool].test.ts` with Vitest covering happy path + edge cases + error cases. Run with `npx vitest run`.
3. **UI third** — create `app/(tools)/[category]/[tool-id]/page.tsx` (Server Component + metadata) and `[Tool]Client.tsx` (Client Component).
4. **Register** — add entry to `TOOLS_DIRECTORY` in `config/tools.ts` if not already present.

## Critical: Next.js 16 Breaking Changes

`params` in layouts and pages are now **Promises** — `await params` before accessing properties. Read `node_modules/next/dist/docs/` before using unfamiliar APIs.

## TypeScript

Strict mode is on. Never use `any`. Define explicit `interface`/`type` for all function inputs/outputs. Handle `undefined`, `null`, and parsing errors exhaustively.
