import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border bg-card/30 px-4 py-6 md:px-8 mt-auto">
            <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">eztool.pro</span>
                    <span className="hidden md:inline text-border">|</span>
                    <p>Bộ công cụ tiện ích miễn phí, nhanh chóng và chính xác.</p>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 hover:text-foreground transition-colors transition-opacity hover:opacity-80"
                    >
                        <Home className="size-4" />
                        Trang chủ
                    </Link>
                    <span className="text-xs">© {currentYear}</span>
                </div>
            </div>
        </footer>
    );
}
