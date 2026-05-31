import "./globals.css";
import type { ReactNode } from "react";

/**
 * Pass-through root layout. The real document (`<html lang>`, `<body>`,
 * fonts, providers, AppShell) lives in `app/[locale]/layout.tsx` so the
 * `lang` attribute and metadata can vary per locale in the static export.
 * The only other route under this layout is the `/` redirect page, which
 * renders its own minimal document.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
    return children;
}
