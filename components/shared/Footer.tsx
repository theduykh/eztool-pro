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

                <div className="flex items-center gap-4 md:gap-6">
                    <Link
                        id="btn-home"
                        href="/"
                        className="flex items-center gap-1.5 transition-opacity hover:text-foreground hover:opacity-80"
                    >
                        <Home className="size-4" />
                        Trang chủ
                    </Link>
                    <span className="text-border">|</span>
                    <a
                        id="btn-github"
                        href="https://github.com/theduykh/eztool-pro"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 transition-opacity hover:text-foreground hover:opacity-80"
                        title="GitHub Repository"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-4"
                        >
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                        </svg>
                        GitHub
                    </a>
                    <span className="hidden sm:inline text-border">|</span>
                    <span className="hidden sm:inline text-xs italic opacity-70">Developed by theduykh</span>
                    <span className="text-xs">© {currentYear}</span>
                </div>
            </div>
        </footer>
    );
}


