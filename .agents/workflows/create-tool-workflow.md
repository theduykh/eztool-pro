---
description: Guide for creating a new utility tool on the eztool.pro platform
---

# New Tool Creation Workflow (Micro-prompting)

Apply a QA Automation mindset to build tools by breaking the process into small steps. Follow the steps below in order — NEVER do them out of sequence:

## Step 0: Read the Standards
- Read `.agents/skills/eztool-coding-standard/SKILL.md` (structure & rules).
- Read `.agents/skills/eztool-i18n/SKILL.md` — **this is a multi-language app; no string may be hardcoded.**
- Check `config/tools.ts` to see whether the tool is already registered (id, path, category). The registry holds **structure only** — names/descriptions live in `messages/`.

## Step 1: Build the Core Logic (Pure Functions)
- Do not touch the UI. Build only the core logic.
- Create a `.ts` file in `lib/[domain]/` — e.g. `lib/formatters/json.ts`, `lib/math/percentage.ts`.
- Write pure functions.
- Apply strict TypeScript, define explicit `interface`/`type`. Do not use `any`.
- Functions must return a result or an error message — do NOT throw uncontrolled exceptions.

## Step 2: Write Unit Tests (QA Standard)
- Create a `.test.ts` file right next to the logic file you just created (e.g. `lib/formatters/json.test.ts`).
- Write tests with **Vitest**.
- Must cover:
  - ✅ Happy Path (valid input, correct result).
  - ✅ Edge Cases (empty, null, undefined, overly long, special characters).
  - ✅ Error Cases (malformed input, unparseable data).
// turbo
- Run tests: `npx vitest run lib/[domain]/[file].test.ts`

## Step 3: Translate (i18n) — BEFORE the UI
- Add `tools.<id>.name` and `tools.<id>.description` to **every** `messages/{locale}.json` (en, vi, zh, ko, ja).
- Add a `toolUI.<id>` block for the tool's own UI strings (labels, placeholders, sample content, tips, errors), in all 5 locales. Reuse `toolCommon` for shared strings (copy, paste, clear, encode…).
- Literal `{ }` in a string (JSON/HTML/code sample) → it will be read with `t.raw()`; for interpolation use ICU args like `{count}`.

## Step 4: Design the UI
- Create the route folder matching the path in `config/tools.ts`, **under `[locale]`**.
  - Example: `path: "/dev/json-formatter"` → `app/[locale]/(tools)/dev/json-formatter/page.tsx`
- The `page.tsx` file is an **async Server Component** following §4.2 of the coding-standard skill: `generateMetadata` (localized + `buildAlternates`) and `setRequestLocale(locale)`. Strings come from `getTranslations`, not from `config/tools.ts`.
- Create a separate Client Component in the same folder (e.g. `JsonFormatterClient.tsx`):
  - Put `"use client"` at the top.
  - Read text via `useTranslations("toolUI.<id>")` + `useTranslations("toolCommon")` — **no hardcoded strings**.
  - Use components from `components/ui/` and Shadcn CSS variables (do NOT hardcode colors).
  - Navigate (if needed) via `@/i18n/navigation`, never `next/*`.

## Step 5: Integration & Verification
- Import the logic functions from `lib/` into the Client Component.
- Handle all display states: Success, Loading, Error, and Empty state.
- Open the browser at `http://localhost:3000/{locale}/{category}/{tool-id}` to verify:
  - ✅ UI renders correctly in both Light & Dark mode.
  - ✅ The sidebar highlights the active tool; breadcrumb displays correctly.
  - ✅ Responsive (mobile view).
  - ✅ Logic works: enter input → get the correct output.
  - ✅ **i18n**: switch language in the header — every label/button/placeholder/sample translates, nothing stays hardcoded, and the console has **no** `MALFORMED_ARGUMENT` / missing-message errors.
- `npm run build` must export the new route for **all 5 locales** with no `IntlError`.

## Step 6: Register the Tool (if not already)
- If the tool does not yet exist in `config/tools.ts`, add a **structure-only** entry to `TOOLS_DIRECTORY`: `id`, `path`, `category`, optional `layout`/`isNew`/`isHot`. **No `name`/`description`** — those live in `messages/` (Step 3).
- Add an icon mapping in `config/tool-icons.ts` if you want a custom sidebar/card icon.
