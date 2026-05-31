"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { FileText, Eye, GripVertical, Minus, Plus, Maximize2, Minimize2 } from "lucide-react";

const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 28;
const FONT_SIZE_STEP = 2;
const FONT_SIZE_DEFAULT = 16;

export function MarkdownViewerClient() {
    const t = useTranslations("toolUI.markdown-viewer");
    const [markdown, setMarkdown] = useState<string>(t.raw("sample") as string);

    const [fontSize, setFontSize] = useState(FONT_SIZE_DEFAULT);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const decreaseFontSize = useCallback(() => {
        setFontSize((prev) => Math.max(FONT_SIZE_MIN, prev - FONT_SIZE_STEP));
    }, []);

    const increaseFontSize = useCallback(() => {
        setFontSize((prev) => Math.min(FONT_SIZE_MAX, prev + FONT_SIZE_STEP));
    }, []);

    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    useEffect(() => {
        if (!isFullscreen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsFullscreen(false);
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreen]);

    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isFullscreen]);

    const fontControls = (
        <div className="flex items-center gap-1">
            <button
                id="btn-font-increase"
                onClick={increaseFontSize}
                disabled={fontSize >= FONT_SIZE_MAX}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                title={t("increaseFont")}
            >
                <Plus className="size-3.5" />
            </button>
            <span className="min-w-[2.5rem] text-center text-xs tabular-nums text-muted-foreground">
                {fontSize}px
            </span>
            <button
                id="btn-font-decrease"
                onClick={decreaseFontSize}
                disabled={fontSize <= FONT_SIZE_MIN}
                className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
                title={t("decreaseFont")}
            >
                <Minus className="size-3.5" />
            </button>
        </div>
    );

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] flex-1 md:min-h-[400px]">
                <ResizablePanel defaultSize={50} minSize={20}>
                <ToolPanel
                    padding="none"
                    className="h-full"
                    bodyClassName="h-full"
                    header={
                        <>
                            <ToolLabel icon={<FileText className="size-3.5" />}>
                                {t("rawLabel")}
                            </ToolLabel>
                        </>
                    }
                >
                    <textarea
                        id="input-markdown"
                        value={markdown}
                        onChange={(e) => setMarkdown(e.target.value)}
                        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder={t("placeholder")}
                        spellCheck={false}
                    />
                </ToolPanel>
                </ResizablePanel>

                <ResizableHandle className="w-4 bg-transparent hover:bg-accent/50 active:bg-accent/70 transition-colors duration-150 cursor-col-resize data-[resize-handle-active]:bg-accent/70">
                    <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm border bg-border shadow-sm">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                    </div>
                </ResizableHandle>

                <ResizablePanel defaultSize={50} minSize={20}>
                <ToolPanel
                    padding="none"
                    className="h-full"
                    bodyClassName="h-full"
                    header={
                        <>
                            <ToolLabel icon={<Eye className="size-3.5" />}>
                                {t("preview")}
                            </ToolLabel>
                            <div className="flex items-center gap-1">
                                {fontControls}
                                <div className="mx-0.5 h-4 w-px bg-border" />
                                <button
                                    id="btn-fullscreen-toggle"
                                    onClick={toggleFullscreen}
                                    className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                    title={t("fullscreen")}
                                >
                                    <Maximize2 className="size-3.5" />
                                </button>
                            </div>
                        </>
                    }
                >
                    <div className="h-full w-full overflow-y-auto bg-muted/20 p-4">
                        <div
                            className="prose dark:prose-invert max-w-none w-full break-words"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </ToolPanel>
                </ResizablePanel>
            </ResizablePanelGroup>

            {/* Fullscreen overlay */}
            {isFullscreen ? (
                <div className="fixed inset-0 z-50 flex flex-col bg-background animate-in fade-in duration-200">
                    {/* Fullscreen header */}
                    <div className="flex h-12 flex-shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/50 px-4">
                        <ToolLabel icon={<Eye className="size-3.5" />}>
                            {t("previewFullscreen")}
                        </ToolLabel>
                        <div className="flex items-center gap-1">
                            {fontControls}
                            <div className="mx-0.5 h-4 w-px bg-border" />
                            <button
                                id="btn-fullscreen-exit"
                                onClick={toggleFullscreen}
                                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                                title={t("exitFullscreen")}
                            >
                                <Minimize2 className="size-4" />
                            </button>
                        </div>
                    </div>
                    {/* Fullscreen body */}
                    <div className="flex-1 overflow-y-auto bg-muted/20 p-6 md:p-10">
                        <div
                            className="prose dark:prose-invert mx-auto max-w-4xl w-full break-words"
                            style={{ fontSize: `${fontSize}px` }}
                        >
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {markdown}
                            </ReactMarkdown>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

