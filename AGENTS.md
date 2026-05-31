<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# i18n + static export

This is a **static export** (`output: "export"`) site with **next-intl** locale-prefixed routing. All routes live under `app/[locale]/`; the root `app/layout.tsx` is a pass-through and the real `<html lang>` is in `app/[locale]/layout.tsx`. There is **no middleware** — locale routing relies on `generateStaticParams` + `setRequestLocale`. Import navigation (`Link`, `usePathname`, `useRouter`) from `@/i18n/navigation`, never from `next/*`. See `CLAUDE.md` → "Internationalization (i18n)" for the full pattern.
