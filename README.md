This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser. The root `/`
redirects to your best-match locale (e.g. `/en`).

## Internationalization (multi-language)

The site ships in **5 locales** — English (`en`, default), Vietnamese (`vi`),
Chinese (`zh`), Korean (`ko`), Japanese (`ja`) — using **next-intl** on a Next.js
**static export**. Every route is locale-prefixed (`/{locale}/{category}/{tool}`)
and pre-rendered per language with its own `<html lang>`, localized `<title>`/`<meta>`,
and reciprocal `hreflang` tags for SEO. Users switch language from the header.

- Translation catalogs: `messages/{locale}.json`
- Routing/wiring: `i18n/routing.ts`, `i18n/navigation.ts`, `i18n/request.ts`
- **Full guide:** [`.agents/skills/eztool-i18n/SKILL.md`](.agents/skills/eztool-i18n/SKILL.md)

To add a locale: extend `locales`/`localeNames` in `i18n/routing.ts` and add a
`messages/<locale>.json`. To add/translate a tool, see the i18n skill above and
`.agents/workflows/create-tool-workflow.md`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Deploy on Cloudflare Pages

Since this project uses Next.js **static export**, it is perfectly suited for [Cloudflare Pages](https://pages.cloudflare.com/).

1. Push your code to your GitHub or GitLab repository.
2. Log in to the Cloudflare Dashboard and navigate to **Workers & Pages**.
3. Click **Create application** -> **Pages** -> **Connect to Git** and select your repository.
4. Configure the build settings:
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build` (or your package manager's equivalent)
   - **Build output directory**: `out`
5. Click **Save and Deploy**.
