---
name: eztool-i18n
description: How multi-language (i18n) works on eztool.pro with next-intl + static export. Read this before adding/translating any user-visible text, adding a locale, or touching routing/SEO/metadata.
---

# eztool.pro Internationalization (i18n)

eztool.pro ships in **5 locales** and every user-visible string must be translated.
The stack is **next-intl** on a **static export** (`output: "export"`) Next.js 16 app.

| | |
|---|---|
| **Library** | `next-intl` v4 |
| **Locales** | `en` (default), `vi`, `zh`, `ko`, `ja` |
| **URLs** | Locale-prefixed, always: `/{locale}/{category}/{tool-id}` |
| **Middleware** | **None** — static export. Routing = `[locale]` segment + `generateStaticParams` |
| **Default locale** | `en` (single source of truth: `i18n/routing.ts`) |

## 1. Why this shape

Static export has no server at request time, so locale can't be negotiated by
middleware. The SEO-correct answer is **one pre-rendered HTML per (route × locale)**,
each with its own `<html lang>`, localized `<title>`/`<meta>`, and reciprocal
`hreflang` links. That's why every route lives under `app/[locale]/`.

## 2. File map

```
i18n/
  routing.ts      # locales, defaultLocale, localeNames, defineRouting({ localePrefix: "always" })
  navigation.ts   # createNavigation(routing) → locale-aware Link / usePathname / useRouter
  request.ts      # getRequestConfig → loads messages/{locale}.json
messages/
  en.json vi.json zh.json ko.json ja.json    # one catalog per locale
app/
  layout.tsx              # PASS-THROUGH root (returns children) — globals.css only
  page.tsx                # "/" → client redirect to best-match locale
  not-found.tsx           # global 404 (out/404.html), renders its own <html>
  sitemap.ts robots.ts    # per-(path × locale) sitemap + robots
  [locale]/
    layout.tsx            # REAL document: <html lang={locale}>, fonts, providers, AppShell
                          # generateStaticParams() + setRequestLocale() + generateMetadata()
    page.tsx              # homepage
    not-found.tsx         # localized in-app 404
    (tools)/[cat]/[tool]/page.tsx   # async Server Component (generateMetadata + setRequestLocale)
config/site.ts            # SITE_URL — canonical origin (metadataBase / sitemap / robots)
lib/seo/alternates.ts     # buildAlternates(locale, path) + localizedHref(locale, path) (+ tests)
next.config.ts            # wrapped with createNextIntlPlugin("./i18n/request.ts")
```

## 3. Message namespaces

All catalogs share the same shape. Keys are resolved by `id`, never by display string.

| Namespace | Holds | Resolved with |
|---|---|---|
| `metadata` | site title default/template, description | layout `generateMetadata` |
| `common` | app-shell chrome: home, searchTools, hot, new, toggleTheme, menu/sidebar labels, selectLanguage | `useTranslations("common")` |
| `home` | hero tagline, trending, latest | homepage |
| `categories.<id>` | dev / image / text / math labels | Sidebar, breadcrumb |
| `notFound` | title, body, backHome | 404 pages |
| `search` | command-palette: hint, noResults, navigate, open, close | `SearchCommand` |
| `tools.<id>.{name,description}` | each tool's **name + description** (sidebar, homepage, breadcrumb, page metadata) | `tools` namespace |
| **`toolCommon`** | strings reused **across many tools**: copy, copied, paste, clear, encode, decode, auto, enableAuto, disableAuto, swap, resultPlaceholder, errorGeneric, errorLabel, close, charCount | `useTranslations("toolCommon")` |
| **`toolUI.<id>`** | strings **specific to one tool's UI**: panel labels, placeholders, sample/default content, tooltips, error messages, tips | `useTranslations("toolUI.<id>")` |

**Rule of thumb:** if a string (Copy, Paste, Clear, Encode…) shows up in 2+ tools,
put it in `toolCommon`. Otherwise it belongs in `toolUI.<id>`.

`config/tools.ts` is **structure only** (`id`, `path`, `category`, `isNew`, `isHot`,
`layout`). It contains **no display strings**.

## 4. Reading translations

- **Async Server Component** (tool `page.tsx`, homepage): `getTranslations` from `next-intl/server`.
  Must `await params` for the locale and call `setRequestLocale(locale)` for static rendering.
- **Sync Server Component** (Footer): `useTranslations` works here too.
- **Client Component** (every `*Client.tsx`, Header, Sidebar): `useTranslations` from `next-intl`.

```tsx
// Inside a tool Client component
const t  = useTranslations("toolUI.hash-generator");
const tc = useTranslations("toolCommon");
...
<ToolLabel>{t("inputLabel")}</ToolLabel>
<Button>{tc("clear")}</Button>
```

## 5. ⚠️ ICU gotcha — literal `{ }` braces

next-intl parses messages as **ICU MessageFormat**, so `{` and `}` are treated as
argument placeholders. A message that contains *literal* braces (a JSON/HTML/code
sample) throws `INVALID_MESSAGE: MALFORMED_ARGUMENT`.

- **Interpolation** (the message HAS a variable) → keep `t()` and pass the arg:
  - `"charCount": "{count} characters"` → `tc("charCount", { count: input.length })`
  - `"emptyHash": "No {alg} data yet..."` → `t("emptyHash", { alg: alg.label })`
- **Literal braces, no variable** (placeholders, code/sample content) → use **`t.raw()`**,
  which returns the message untouched (no ICU parsing):
  - `placeholder={t.raw("inputPlaceholder") as string}`  // `Example: {"name": ...}`
  - `useState(t.raw("sample") as string)`                // markdown with `function x() {`

> The build does **not** fail on this — next-intl logs the error and renders a
> fallback, so it only shows at runtime. Grep catalogs for stray braces:
> `grep -nE '\{[^}]*\}' messages/en.json | grep -vE '\{count\}|\{alg\}|\{query\}'`

## 6. Navigation (locale-aware, required)

Never import `Link` / `usePathname` / `useRouter` from `next/link` or `next/navigation`
in app/shell code. Import them from **`@/i18n/navigation`**:

- `Link` prepends the active locale to `href` automatically.
- `usePathname()` returns the path **without** the locale prefix, so existing
  `pathname === tool.path` comparisons keep working.
- Tool-internal Client components that don't navigate are exempt.

## 7. The language switcher uses a FULL navigation (on purpose)

`components/shared/LanguageSwitcher.tsx` changes locale via
`window.location.assign(localizedHref(next, pathname) + search + hash)` — a hard
navigation, **not** next-intl's soft router.

Reason: `<html lang>` and the next-themes anti-flash `<script>` live in the
`[locale]` layout. A soft client transition re-renders that layout (and its
`<script>`) on the client, triggering React 19's *"script tag while rendering"*
warning. A full navigation re-renders on the server instead — and a reload on
language change is expected UX. Within-locale links stay fast SPA transitions.

## 8. SEO

- `<html lang={locale}>` is set per locale in `app/[locale]/layout.tsx`.
- `buildAlternates(locale, path)` (`lib/seo/alternates.ts`) returns `{ canonical, languages }`
  with one `hreflang` per locale **plus `x-default`** → spread into a page's
  `metadata.alternates`. URLs are root-relative; `metadataBase` (from `config/site.ts`)
  makes them absolute.
- `app/sitemap.ts` emits every `(path × locale)` with reciprocal `languages`.
- `app/robots.ts` allows all + points to the sitemap.
- `/` is a static redirect page (meta-refresh + JS) to the best-match `navigator.language`.

## 9. Adding a NEW locale

1. Add the code to `locales` and a native name to `localeNames` in `i18n/routing.ts`.
2. Add `messages/<locale>.json` (copy `en.json`, translate every namespace).
3. Add the font subset/CJK coverage if needed in `app/[locale]/layout.tsx`.
   Everything else (routes, sitemap, hreflang, switcher) updates automatically.

## 10. Verifying i18n

```bash
npx vitest run lib/seo lib/search        # alternates + search unit tests
npm run build                            # must export 126+ static pages, no IntlError
# inspect generated HTML:
grep -o '<html lang="[a-z]*"' out/vi/dev/json-formatter.html
grep -c 'hreflang' out/en/dev/json-formatter.html        # expect 6 (5 locales + x-default)
grep -rl 'MALFORMED_ARGUMENT' out/ || echo "no ICU errors"
# runtime: npm run dev → switch language in header, check console has no warnings
```

See also: `eztool-coding-standard` skill and `.agents/workflows/create-tool-workflow.md`.
