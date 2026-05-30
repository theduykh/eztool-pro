import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { AppShell } from "@/components/shared/AppShell";

const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin", "latin-ext", "vietnamese"],
});

const jetbrainsMono = JetBrains_Mono({
    variable: "--font-mono",
    subsets: ["latin", "latin-ext", "vietnamese"],
});

export const metadata: Metadata = {
    title: {
        default: "eztool.pro – Công cụ tiện ích siêu tốc",
        template: "%s | eztool.pro",
    },
    description:
        "Bộ công cụ tiện ích hàng ngày và dành cho lập trình viên. Nhanh chóng, chính xác, không quảng cáo.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="vi"
            className={`${inter.variable} ${jetbrainsMono.variable}`}
            suppressHydrationWarning
        >
            <body>
                <ThemeProvider>
                    <AppShell>{children}</AppShell>
                </ThemeProvider>
            </body>
        </html>
    );
}
