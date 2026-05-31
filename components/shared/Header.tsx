"use client";

import { useTranslations } from "next-intl";
import { Menu, Search, ChevronRight, PanelLeft } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { LanguageSwitcher } from "@/components/shared/LanguageSwitcher";
import { TOOLS_DIRECTORY, getCategories } from "@/config/tools";
import { Button } from "@/components/ui/button";

interface HeaderProps {
    onMobileMenuClick: () => void;
    onDesktopSidebarToggle: () => void;
    desktopSidebarCollapsed: boolean;
}

export function Header({
    onMobileMenuClick,
    onDesktopSidebarToggle,
    desktopSidebarCollapsed,
}: HeaderProps) {
    const t = useTranslations();
    const pathname = usePathname();
    const breadcrumbs = buildBreadcrumbs(pathname);

    return (
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card px-3 lg:px-5">
            {/* Left: menu buttons + breadcrumb */}
            <div className="flex items-center gap-1">
                {/* Mobile: open drawer */}
                <Button
                    id="btn-menu-mobile"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground md:hidden"
                    onClick={onMobileMenuClick}
                    aria-label={t("common.openMenu")}
                >
                    <Menu className="size-5" />
                </Button>

                {/* Desktop: fold / unfold sidebar */}
                <Button
                    id="btn-sidebar-toggle"
                    variant="ghost"
                    size="icon"
                    className="hidden text-muted-foreground hover:text-foreground md:flex"
                    onClick={onDesktopSidebarToggle}
                    aria-label={
                        desktopSidebarCollapsed
                            ? t("common.expandSidebar")
                            : t("common.collapseSidebar")
                    }
                    title={
                        desktopSidebarCollapsed
                            ? t("common.expandSidebar")
                            : t("common.collapseSidebar")
                    }
                >
                    <PanelLeft className="size-5" />
                </Button>

                {/* Breadcrumb */}
                <nav className="hidden sm:flex" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
                        {breadcrumbs.map((crumb, index) => {
                            const label = resolveCrumbLabel(crumb, t);
                            return (
                                <li key={`${crumb.kind}-${index}`} className="flex items-center">
                                    {index > 0 && <ChevronRight className="mx-1 size-3.5" />}
                                    {crumb.kind === "home" ? (
                                        <Link
                                            href="/"
                                            className="transition-colors hover:text-foreground"
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <span className="font-medium text-foreground">
                                            {label}
                                        </span>
                                    )}
                                </li>
                            );
                        })}
                    </ol>
                </nav>
            </div>

            {/* Right: search + language + theme */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-foreground sm:hidden"
                    aria-label={t("common.searchTools")}
                >
                    <Search className="size-5" />
                </Button>

                <button
                    className="hidden items-center justify-between rounded-md border border-border bg-accent/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex sm:w-52 lg:w-64"
                    aria-label={t("common.searchTools")}
                >
                    <span className="flex items-center">
                        <Search className="mr-2 size-4" />
                        {t("common.searchTools")}
                    </span>
                    <kbd className="ml-2 hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium lg:inline-flex">
                        Ctrl K
                    </kbd>
                </button>

                <LanguageSwitcher />
                <ThemeToggle />
            </div>
        </header>
    );
}

type Crumb =
    | { kind: "home" }
    | { kind: "category"; id: string }
    | { kind: "tool"; id: string }
    | { kind: "raw"; label: string };

type Translator = ReturnType<typeof useTranslations>;

function resolveCrumbLabel(crumb: Crumb, t: Translator): string {
    switch (crumb.kind) {
        case "home":
            return t("common.home");
        case "category":
            return t(`categories.${crumb.id}`);
        case "tool":
            return t(`tools.${crumb.id}.name`);
        case "raw":
            return crumb.label;
    }
}

function buildBreadcrumbs(pathname: string): Crumb[] {
    const crumbs: Crumb[] = [{ kind: "home" }];
    if (pathname === "/") return crumbs;

    const currentTool = TOOLS_DIRECTORY.find((tool) => tool.path === pathname);

    if (currentTool) {
        const category = getCategories().find((c) => c.id === currentTool.category);
        if (category) crumbs.push({ kind: "category", id: category.id });
        crumbs.push({ kind: "tool", id: currentTool.id });
    } else {
        pathname
            .split("/")
            .filter(Boolean)
            .forEach((seg) => crumbs.push({ kind: "raw", label: decodeURIComponent(seg) }));
    }

    return crumbs;
}
