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
- Always generate dynamic `<title>` and `<meta>` tags for each tool page by exporting `metadata` from `page.tsx`.
- **IMPORTANT:** This is Next.js 16 — `params` in layouts/pages are Promises. Read the docs at `node_modules/next/dist/docs/` before using new APIs.

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

Every `page.tsx` follows the same structure — fetch the tool from the registry, export `metadata`, render `PageHeader` + the Client Component:

```tsx
import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { ToolClient } from "./ToolClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "tool-id")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function ToolPage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
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
│   ├── layout.tsx              # Root layout (Server Component) — Inter + Fira Code font, ThemeProvider, AppShell
│   ├── globals.css             # Tailwind v4 + Shadcn CSS vars (dark/light)
│   ├── page.tsx                # Homepage
│   └── (tools)/                # Route group for all tools
│       └── [category]/[tool]/  # Routing by category/tool-name
│           └── page.tsx        # Server Component, exports metadata
├── components/
│   ├── ui/                     # Shadcn UI components (button, input, textarea...)
│   └── shared/                 # Shared components
│       ├── AppShell.tsx        # Client — layout shell (sidebar + header + content)
│       ├── Sidebar.tsx         # Client — sidebar navigation, tool grouping
│       ├── Header.tsx          # Client — breadcrumb, search, theme toggle
│       ├── ThemeProvider.tsx   # Client — next-themes wrapper
│       └── ThemeToggle.tsx     # Client — sun/moon toggle button
├── lib/                        # Pure logic functions (NO React)
│   ├── utils.ts                # cn() helper
│   ├── formatters/             # Formatting logic (json, xml...)
│   ├── math/                   # Computation functions
│   └── string/                 # String processing
├── config/
│   └── tools.ts                # Registry of all tools + categories
└── __tests__/                  # Or place .test.ts right next to the logic file in lib/
```

## 7. Routing Convention
- URL pattern: `/{category}/{tool-id}` — e.g. `/dev/json-formatter`, `/text/word-counter`
- Folder structure: `app/(tools)/[matching the path in config/tools.ts]/page.tsx`
- Each page exports a `metadata` object for SEO.
- The client-interactive component lives in a separate file, with `"use client"` only on that component.
