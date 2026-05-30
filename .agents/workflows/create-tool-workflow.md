---
description: Guide for creating a new utility tool on the eztool.pro platform
---

# New Tool Creation Workflow (Micro-prompting)

Apply a QA Automation mindset to build tools by breaking the process into small steps. Follow the steps below in order — NEVER do them out of sequence:

## Step 0: Read the Coding Standard
- Read `.agents/skills/eztool-coding-standard/SKILL.md` to understand the project structure and rules.
- Check `config/tools.ts` to see whether the tool is already registered (id, path, category).

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

## Step 3: Design the UI
- Create the route folder matching the path in `config/tools.ts`.
  - Example: a tool with `path: "/dev/json-formatter"` → create `app/(tools)/dev/json-formatter/page.tsx`
- The `page.tsx` file is a **Server Component**:
  - Export a `metadata` object (title, description taken from `config/tools.ts`).
  - Render the tool title + description.
  - Import and render the Client Component that holds the interactive logic.
- Create a separate Client Component in the same folder (e.g. `JsonFormatterClient.tsx`):
  - Put `"use client"` at the top of the file.
  - Use components from `components/ui/` (Button, Textarea...).
  - Use Shadcn CSS variables for colors (do NOT hardcode) to support dark mode.
  - Match the existing layout (content sits within the AppShell workspace area).

## Step 4: Integration & Verification
- Import the logic functions from `lib/` into the Client Component.
- Handle all display states: Success, Loading, Error, and Empty state.
- Open the browser at `http://localhost:3000/{category}/{tool-id}` to verify:
  - ✅ UI renders correctly in both Light & Dark mode.
  - ✅ The sidebar highlights the active tool.
  - ✅ The breadcrumb displays correctly.
  - ✅ Responsive (mobile view).
  - ✅ Logic works: enter input → get the correct output.

## Step 5: Register the Tool (if not already)
- If the tool does not yet exist in `config/tools.ts`, add a new entry to `TOOLS_DIRECTORY`.
- Ensure the fields: `id`, `name`, `description`, `path`, `category`, and `isNew` (if it is a new tool).
