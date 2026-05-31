"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Trash2, Settings, Zap, AlignJustify, GripVertical } from "lucide-react";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { cleanText, type CleaningOptions } from "@/lib/string/cleaner";
import { cn } from "@/lib/utils";

const OPTION_LABELS: { key: keyof CleaningOptions; label: string }[] = [
    { key: "removeEmptyLines", label: "Xóa dòng trống" },
    { key: "collapseSpaces", label: "Thu gọn khoảng trắng" },
    { key: "trimLines", label: "Xóa khoảng trắng ở đầu/cuối dòng" },
    { key: "removeAllLineBreaks", label: "Xóa tất cả dấu xuống dòng" },
];

export function RemoveLineBreaksClient() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const [options, setOptions] = useState<CleaningOptions>({
        removeEmptyLines: true,
        collapseSpaces: true,
        trimLines: true,
        removeAllLineBreaks: false,
    });

    const handleClean = useCallback((text: string, currentOptions: CleaningOptions) => {
        if (!text) {
            setOutput("");
            return;
        }
        setOutput(cleanText(text, currentOptions));
    }, []);

    useEffect(() => {
        handleClean(input, options);
    }, [input, options, handleClean]);

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
    };

    const toggleOption = (key: keyof CleaningOptions) => {
        setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <ToolPanel padding="lg" className="mb-4 shrink-0">
                <ToolLabel icon={<Settings className="size-3.5" />} className="mb-4">
                    Tùy chọn dọn dẹp
                </ToolLabel>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {OPTION_LABELS.map((opt) => {
                        const active = options[opt.key];
                        return (
                            <button
                                id={`opt-${opt.key}`}
                                key={opt.key}
                                onClick={() => toggleOption(opt.key)}
                                className={cn(
                                    "flex items-center justify-between rounded-xl border p-3 text-sm transition-all",
                                    active
                                        ? "border-blue-500/50 bg-blue-500/5 text-blue-600 dark:text-blue-400"
                                        : "border-border hover:bg-muted",
                                )}
                            >
                                <span>{opt.label}</span>
                                <div
                                    className={cn(
                                        "flex size-4 items-center justify-center rounded border",
                                        active && "border-blue-500 bg-blue-500 text-white",
                                    )}
                                >
                                    {active && <Check className="size-3" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ToolPanel>

            <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] flex-1 md:min-h-[400px]">
                <ResizablePanel defaultSize={50} minSize={20}>
                <ToolPanel
                    padding="none"
                    className="h-full"
                    bodyClassName="h-full"
                    header={
                        <>
                            <ToolLabel>Văn bản gốc</ToolLabel>
                            <button
                                id="btn-clear"
                                onClick={handleClear}
                                className="flex items-center text-xs text-muted-foreground transition-colors hover:text-destructive"
                            >
                                <Trash2 className="mr-1 size-3.5" />
                                Xóa trắng
                            </button>
                        </>
                    }
                >
                    <textarea
                        id="input-text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder="Paste text to clean up"
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
                            <ToolLabel>Kết quả đã dọn dẹp</ToolLabel>
                            <button
                                id="btn-copy"
                                onClick={handleCopy}
                                disabled={!output}
                                className={cn(
                                    "flex items-center text-xs transition-colors",
                                    copied
                                        ? "text-green-500"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {copied ? (
                                    <>
                                        <Check className="mr-1 size-3.5" />
                                        Đã copy!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-1 size-3.5" />
                                        Copy
                                    </>
                                )}
                            </button>
                        </>
                    }
                >
                    <textarea
                        id="output-text"
                        value={output}
                        readOnly
                        className="h-full w-full resize-none bg-muted/20 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder="Cleaned text will display here..."
                        spellCheck={false}
                    />
                </ToolPanel>
                </ResizablePanel>
            </ResizablePanelGroup>

            {input && (
                <div className="mt-4 flex shrink-0 flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="size-3.5 text-yellow-500" />
                        <span>
                            Giảm bớt:{" "}
                            <span className="font-bold text-foreground">
                                {input.length - output.length}
                            </span>{" "}
                            ký tự
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlignJustify className="size-3.5 text-blue-500" />
                        <span>
                            Số dòng: {output.split("\n").filter(Boolean).length} (
                            {input.split("\n").length} trước đó)
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
