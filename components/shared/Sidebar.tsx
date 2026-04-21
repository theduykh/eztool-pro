"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
    X,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/** Category icon mapping */
const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
    terminal: Terminal,
    type: Type,
    calculator: Calculator,
    image: ImageIcon,
};

/** Per-tool icon mapping by tool id */
const TOOL_ICON_MAP: Record<string, LucideIcon> = {
    // Dev
    "json-formatter": Code,
    "base64-encode-decode": ArrowLeftRight,
    "url-encode-decode": Link2,
    "jwt-decoder": KeyRound,
    "hash-generator": Hash,
    // Text
    "word-counter": FileText,
    "case-converter": CaseSensitive,
    "text-to-slug": TextCursorInput,
    "lorem-ipsum": Pilcrow,
    "remove-line-breaks": RemoveFormatting,
    // Math
    "percentage-calculator": Percent,
    "bmi-calculator": Activity,
    "random-number": Dices,
    "unit-converter": Ruler,
    "rule-of-three": Scale,
    // Image
    "qr-generator": QrCode,
    "color-converter": Palette,
    "image-to-base64": FileImage,
    "svg-placeholder": RectangleHorizontal,
    "image-resizer": Maximize2,
};

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const categories = getCategories();

    // Group tools by category
    const groupedTools: Record<string, ToolItem[]> = {};
    for (const tool of TOOLS_DIRECTORY) {
        if (!groupedTools[tool.category]) {
            groupedTools[tool.category] = [];
        }
        groupedTools[tool.category].push(tool);
    }

    return (
        <>
            {/* Overlay for mobile */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
                    isOpen ? "opacity-100" : "pointer-events-none opacity-0"
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                id="sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out",
                    "md:relative md:translate-x-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
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

                    {/* Close button (mobile only) */}
                    <button
                        className="rounded-md p-2.5 text-muted-foreground hover:text-foreground active:bg-accent md:hidden"
                        onClick={onClose}
                        aria-label="Đóng menu"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
                    {categories.map((category) => {
                        const CategoryIcon = CATEGORY_ICON_MAP[category.icon] || Terminal;
                        const tools = groupedTools[category.id] || [];

                        if (tools.length === 0) return null;

                        return (
                            <div key={category.id}>
                                <h3 className="mb-2 flex items-center gap-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    <CategoryIcon className="size-3.5" />
                                    {category.label}
                                </h3>

                                <ul className="space-y-0.5">
                                    {tools.map((tool) => {
                                        const isActive = pathname === tool.path;
                                        const ToolIcon = TOOL_ICON_MAP[tool.id] || Code;

                                        return (
                                            <li key={tool.id}>
                                                <Link
                                                    href={tool.path}
                                                    onClick={onClose}
                                                    className={cn(
                                                        "flex items-center rounded-md px-3 py-3 text-sm font-medium transition-colors active:bg-accent/70",
                                                        isActive
                                                            ? "bg-accent text-blue-600 dark:text-blue-400"
                                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                                    )}
                                                >
                                                    <ToolIcon className="mr-3 size-4 flex-shrink-0" />
                                                    <span className="truncate">{tool.name}</span>
                                                    {tool.isNew && (
                                                        <span className="ml-auto rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                                            New
                                                        </span>
                                                    )}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
