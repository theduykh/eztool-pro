"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Search, CornerDownLeft, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { TOOLS_DIRECTORY, getCategories } from "@/config/tools";
import { TOOL_ICON_MAP, DefaultToolIcon } from "@/config/tool-icons";
import {
    searchTools,
    type SearchableTool,
} from "@/lib/search/tool-search";
import { highlightSegments } from "@/lib/search/highlight";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SearchCommandProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

/** Renders text with the query matches bolded/highlighted. */
function Highlighted({ text, query }: { text: string; query: string }) {
    const segments = highlightSegments(text, query);
    return (
        <>
            {segments.map((seg, i) =>
                seg.match ? (
                    <mark
                        key={i}
                        className="bg-transparent font-semibold text-blue-600 dark:text-blue-400"
                    >
                        {seg.text}
                    </mark>
                ) : (
                    <span key={i}>{seg.text}</span>
                ),
            )}
        </>
    );
}

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
    const t = useTranslations();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [activeIndex, setActiveIndex] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);

    // Build the searchable set from the current locale's translations, so
    // search is always "by current language".
    const items = useMemo<SearchableTool[]>(() => {
        const categoryById = new Map(getCategories().map((c) => [c.id, c]));
        return TOOLS_DIRECTORY.map((tool) => ({
            id: tool.id,
            path: tool.path,
            category: tool.category,
            isHot: tool.isHot,
            isNew: tool.isNew,
            name: t(`tools.${tool.id}.name`),
            description: t(`tools.${tool.id}.description`),
            categoryLabel: categoryById.has(tool.category)
                ? t(`categories.${tool.category}`)
                : tool.category,
        }));
    }, [t]);

    const trimmed = query.trim();
    const results = useMemo<SearchableTool[]>(() => {
        if (!trimmed) return items.filter((tool) => tool.isHot);
        return searchTools(trimmed, items).map((r) => r.tool);
    }, [trimmed, items]);

    const handleOpenChange = useCallback(
        (next: boolean) => {
            if (!next) {
                setQuery("");
                setActiveIndex(0);
            }
            onOpenChange(next);
        },
        [onOpenChange],
    );

    // Keep the active row in view.
    useEffect(() => {
        const node = listRef.current?.querySelector<HTMLElement>(
            '[data-active="true"]',
        );
        node?.scrollIntoView({ block: "nearest" });
    }, [activeIndex, results]);

    // Global Ctrl/Cmd+K toggles the palette.
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                handleOpenChange(!open);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, handleOpenChange]);

    const select = useCallback(
        (tool: SearchableTool | undefined) => {
            if (!tool) return;
            handleOpenChange(false);
            router.push(tool.path);
        },
        [handleOpenChange, router],
    );

    function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) =>
                results.length ? (i - 1 + results.length) % results.length : 0,
            );
        } else if (e.key === "Enter") {
            e.preventDefault();
            select(results[activeIndex]);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
            >
                <DialogTitle className="sr-only">{t("common.searchTools")}</DialogTitle>
                <DialogDescription className="sr-only">
                    {t("search.hint")}
                </DialogDescription>

                {/* Input row */}
                <div className="flex items-center gap-2.5 border-b border-border px-4">
                    <Search className="size-4.5 shrink-0 text-muted-foreground" />
                    <input
                        id="input-search"
                        autoFocus
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setActiveIndex(0);
                        }}
                        onKeyDown={onInputKeyDown}
                        placeholder={t("common.searchTools")}
                        aria-label={t("common.searchTools")}
                        className="h-12 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                        role="combobox"
                        aria-expanded={results.length > 0}
                        aria-controls="output-search-results"
                        autoComplete="off"
                    />
                </div>

                {/* Results */}
                <div className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
                    {results.length === 0 ? (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                            {t("search.noResults", { query: trimmed })}
                        </p>
                    ) : (
                        <>
                            {!trimmed && (
                                <p className="px-3 pb-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {t("home.trending")}
                                </p>
                            )}
                            <ul
                                ref={listRef}
                                id="output-search-results"
                                role="listbox"
                                className="space-y-0.5"
                            >
                                {results.map((tool, index) => {
                                    const Icon = TOOL_ICON_MAP[tool.id] ?? DefaultToolIcon;
                                    const isActive = index === activeIndex;
                                    return (
                                        <li key={tool.id} role="presentation">
                                            <button
                                                id={`opt-search-${tool.id}`}
                                                type="button"
                                                role="option"
                                                aria-selected={isActive}
                                                data-active={isActive}
                                                onClick={() => select(tool)}
                                                onMouseMove={() => setActiveIndex(index)}
                                                className={cn(
                                                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                                                    isActive
                                                        ? "bg-accent text-foreground"
                                                        : "text-foreground/90 hover:bg-accent/60",
                                                )}
                                            >
                                                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                                    <Icon className="size-4" />
                                                </span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium">
                                                        <Highlighted text={tool.name} query={trimmed} />
                                                    </span>
                                                    <span className="block truncate text-xs text-muted-foreground">
                                                        <Highlighted
                                                            text={tool.description}
                                                            query={trimmed}
                                                        />
                                                    </span>
                                                </span>
                                                <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                                                    {tool.categoryLabel}
                                                </span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </>
                    )}
                </div>

                {/* Footer hints */}
                <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <kbd className="inline-flex items-center rounded border border-border bg-card px-1 py-0.5">
                            <ArrowUp className="size-3" />
                        </kbd>
                        <kbd className="inline-flex items-center rounded border border-border bg-card px-1 py-0.5">
                            <ArrowDown className="size-3" />
                        </kbd>
                        {t("search.navigate")}
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="inline-flex items-center rounded border border-border bg-card px-1 py-0.5">
                            <CornerDownLeft className="size-3" />
                        </kbd>
                        {t("search.open")}
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="inline-flex items-center rounded border border-border bg-card px-1.5 py-0.5 font-mono">
                            Esc
                        </kbd>
                        {t("search.close")}
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
