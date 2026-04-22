import Link from "next/link";
import { Home } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative z-10 mt-auto h-10 w-full shrink-0 border-t border-border bg-card px-4 md:px-8">
            <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-foreground">eztool.pro</span>
                    <span className="hidden md:inline text-border">|</span>
                    <p className="hidden md:inline truncate">Bộ công cụ tiện ích miễn phí, nhanh chóng và chính xác.</p>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 transition-opacity hover:text-foreground hover:opacity-80"
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
