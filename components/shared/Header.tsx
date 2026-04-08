"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, Search, ChevronRight } from "lucide-react";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { TOOLS_DIRECTORY, getCategories } from "@/config/tools";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();

    // Build breadcrumb from current path
    const breadcrumbs = buildBreadcrumbs(pathname);

    return (
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
            {/* Left: menu button + breadcrumb */}
            <div className="flex items-center">
                <Button
                    id="btn-menu"
                    variant="ghost"
                    size="icon"
                    className="mr-2 text-muted-foreground hover:text-foreground md:hidden"
                    onClick={onMenuClick}
                    aria-label="Mở menu"
                >
                    <Menu className="size-5" />
                </Button>

                {/* Breadcrumb (hidden on very small screens) */}
                <nav className="hidden sm:flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
                        {breadcrumbs.map((crumb, index) => (
                            <li key={crumb.label} className="flex items-center">
                                {index > 0 && (
                                    <ChevronRight className="mx-1 size-3.5" />
                                )}
                                {crumb.href ? (
                                    <Link
                                        href={crumb.href}
                                        className="transition-colors hover:text-foreground"
                                    >
                                        {crumb.label}
                                    </Link>
                                ) : (
                                    <span className="font-medium text-foreground">
                                        {crumb.label}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ol>
                </nav>
            </div>

            {/* Right: search + theme toggle */}
            <div className="flex items-center gap-2">
                {/* Search bar (mockup, can be wired to Shadcn Command later) */}
                <button
                    className="hidden items-center justify-between rounded-md border border-border bg-accent/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex sm:w-56 lg:w-64"
                    aria-label="Tìm kiếm công cụ"
                >
                    <span className="flex items-center">
                        <Search className="mr-2 size-4" />
                        Tìm kiếm công cụ...
                    </span>
                    <kbd className="ml-2 hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium lg:inline-flex">
                        Ctrl K
                    </kbd>
                </button>

                <ThemeToggle />
            </div>
        </header>
    );
}

// ──────────────────────────────────────
// Helpers
// ──────────────────────────────────────

interface BreadcrumbItem {
    label: string;
    href?: string;
}

function buildBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const crumbs: BreadcrumbItem[] = [{ label: "Trang chủ", href: "/" }];

    if (pathname === "/") return crumbs;

    // Try to match current tool
    const currentTool = TOOLS_DIRECTORY.find((t) => t.path === pathname);
    const categories = getCategories();

    if (currentTool) {
        const category = categories.find((c) => c.id === currentTool.category);
        if (category) {
            crumbs.push({ label: category.label });
        }
        crumbs.push({ label: currentTool.name });
    } else {
        // Generic fallback: split path segments
        const segments = pathname.split("/").filter(Boolean);
        segments.forEach((seg) => {
            crumbs.push({ label: decodeURIComponent(seg) });
        });
    }

    return crumbs;
}
