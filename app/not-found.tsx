import { defaultLocale } from "@/i18n/routing";

/**
 * Global 404 (`out/404.html`) for paths that don't match any locale segment.
 * Renders a full document because the root layout is a pass-through. Localized
 * in-app 404s are handled by `app/[locale]/not-found.tsx`.
 */
export default function GlobalNotFound() {
    return (
        <html lang={defaultLocale}>
            <head>
                <title>404 – eztool.pro</title>
                <meta name="robots" content="noindex" />
            </head>
            <body
                style={{
                    margin: 0,
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    fontFamily: "system-ui, sans-serif",
                    background: "#0a0a0a",
                    color: "#fafafa",
                }}
            >
                <p style={{ fontSize: "4rem", fontWeight: 700, opacity: 0.3, margin: 0 }}>
                    404
                </p>
                <a
                    href={`/${defaultLocale}`}
                    style={{ color: "#3b82f6", textDecoration: "none", fontWeight: 500 }}
                >
                    eztool.pro →
                </a>
            </body>
        </html>
    );
}
