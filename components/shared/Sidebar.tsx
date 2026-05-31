"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { TOOLS_DIRECTORY, getCategories, type ToolItem } from "@/config/tools";
import {
    Terminal,
    Type,
    Calculator,
    ImageIcon,
    Code,
    ArrowLeftRight,
    Link2,
    KeyRound,
    Hash,
    FileText,
    CaseSensitive,
    TextCursorInput,
    Pilcrow,
    RemoveFormatting,
    Percent,
    Activity,
    Dices,
    Ruler,
    Scale,
    QrCode,
    Palette,
    FileImage,
    RectangleHorizontal,
    Maximize2,
    ChevronDown,
    X,
    LoaderPinwheel,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    terminal: Terminal,
    type: Type,
    calculator: Calculator,
    image: ImageIcon,
};

const TOOL_ICON_MAP: Record<string, LucideIcon> = {
    "json-formatter": Code,
    "base64-encode-decode": ArrowLeftRight,
    "url-encode-decode": Link2,
    "jwt-decoder": KeyRound,
    "hash-generator": Hash,
    "word-counter": FileText,
    "case-converter": CaseSensitive,
    "text-to-slug": TextCursorInput,
    "lorem-ipsum": Pilcrow,
    "remove-line-breaks": RemoveFormatting,
    "percentage-calculator": Percent,
    "bmi-calculator": Activity,
    "random-number": Dices,
    "unit-converter": Ruler,
    "rule-of-three": Scale,
    "lucky-wheel": LoaderPinwheel,
    "qr-generator": QrCode,
    "color-converter": Palette,
    "image-to-base64": FileImage,
    "svg-placeholder": RectangleHorizontal,
    "image-resizer": Maximize2,
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isDesktopCollapsed?: boolean;
}

export function Sidebar({ isOpen, onClose, isDesktopCollapsed = false }: SidebarProps) {
    const t = useTranslations();
    const pathname = usePathname();
    const categories = getCategories();

    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    const toggleCategory = (id: string) => {
        setCollapsed((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const groupedTools: Record<string, ToolItem[]> = {};
    for (const tool of TOOLS_DIRECTORY) {
        if (!groupedTools[tool.category]) groupedTools[tool.category] = [];
        groupedTools[tool.category].push(tool);
    }

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0",
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                id="sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card",
                    "transition-[width,transform] duration-300 ease-in-out",
                    "md:relative md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full",
                    isDesktopCollapsed && "md:w-0 md:overflow-hidden md:border-r-0",
                )}
            >
                {/* Logo */}
                <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border px-6">
                    <Link
                        href="/"
                        className="text-xl font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
                    >
                        eztool<span className="text-blue-600 dark:text-blue-400">.pro</span>
                    </Link>
                    <button
                        className="rounded-md p-2.5 text-muted-foreground hover:text-foreground active:bg-accent md:hidden"
                        onClick={onClose}
                        aria-label={t("common.closeMenu")}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
                    {categories.map((category) => {
                        const CategoryIcon = CATEGORY_ICON_MAP[category.icon] ?? Terminal;
                        const tools = groupedTools[category.id] ?? [];
                        if (tools.length === 0) return null;

                        const isCollapsed = collapsed.has(category.id);
                        const hasActiveChild = tools.some((t) => pathname === t.path);

                        return (
                            <div key={category.id}>
                                {/* ── Category header (parent) ── */}
                                <button
                                    onClick={() => toggleCategory(category.id)}
                                    className={cn(
                                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                                        hasActiveChild
                                            ? "bg-accent/60 text-foreground"
                                            : "text-foreground/80 hover:bg-accent hover:text-foreground",
                                    )}
                                >
                                    <CategoryIcon className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                    <span className="flex-1 text-left tracking-wide uppercase text-xs">
                                        {t(`categories.${category.id}`)}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                                            isCollapsed && "-rotate-90",
                                        )}
                                    />
                                </button>

                                {/* ── Child items ── */}
                                {!isCollapsed && (
                                    <ul className="mt-0.5 space-y-0.5 pl-3">
                                        {tools.map((tool) => {
                                            const isActive = pathname === tool.path;
                                            const ToolIcon = TOOL_ICON_MAP[tool.id] ?? Code;

                                            return (
                                                <li key={tool.id}>
                                                    <Link
                                                        href={tool.path}
                                                        onClick={onClose}
                                                        className={cn(
                                                            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors active:bg-accent/70",
                                                            isActive
                                                                ? "bg-accent font-medium text-blue-600 dark:text-blue-400"
                                                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                                                        )}
                                                    >
                                                        <ToolIcon className="size-3.5 shrink-0" />
                                                        <span className="flex-1 truncate">
                                                            {t(`tools.${tool.id}.name`)}
                                                        </span>

                                                        {tool.isHot && !tool.isNew && (
                                                            <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                                                                {t("common.hot")}
                                                            </span>
                                                        )}
                                                        {tool.isNew && (
                                                            <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                                                {t("common.new")}
                                                            </span>
                                                        )}
                                                    </Link>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
