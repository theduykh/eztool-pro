"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    Copy, 
    Check, 
    Trash2, 
    Settings, 
    Zap,
    AlignJustify,
    Maximize,
    Minimize
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cleanText, type CleaningOptions } from "@/lib/string/cleaner";
import { cn } from "@/lib/utils";

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
        setOptions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="flex flex-1 min-h-0 flex-col">
            {/* Options Panel */}
            <div className="shrink-0 mb-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Settings className="size-3.5" />
                    Tùy chọn dọn dẹp
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => toggleOption("removeEmptyLines")}
                        className={cn(
                            "flex items-center justify-between rounded-xl border p-3 text-sm transition-all",
                            options.removeEmptyLines ? "border-blue-500/50 bg-blue-500/5 text-blue-600 dark:text-blue-400" : "border-border hover:bg-muted"
                        )}
                    >
                        <span>Xóa dòng trống</span>
                        <div className={cn("size-4 rounded border flex items-center justify-center", options.removeEmptyLines && "bg-blue-500 border-blue-500 text-white")}>
                            {options.removeEmptyLines && <Check className="size-3" />}
                        </div>
                    </button>

                    <button
                        onClick={() => toggleOption("collapseSpaces")}
                        className={cn(
                            "flex items-center justify-between rounded-xl border p-3 text-sm transition-all",
                            options.collapseSpaces ? "border-blue-500/50 bg-blue-500/5 text-blue-600 dark:text-blue-400" : "border-border hover:bg-muted"
                        )}
                    >
                        <span>Thu gọn khoảng trắng</span>
                        <div className={cn("size-4 rounded border flex items-center justify-center", options.collapseSpaces && "bg-blue-500 border-blue-500 text-white")}>
                            {options.collapseSpaces && <Check className="size-3" />}
                        </div>
                    </button>

                    <button
                        onClick={() => toggleOption("trimLines")}
                        className={cn(
                            "flex items-center justify-between rounded-xl border p-3 text-sm transition-all",
                            options.trimLines ? "border-blue-500/50 bg-blue-500/5 text-blue-600 dark:text-blue-400" : "border-border hover:bg-muted"
                        )}
                    >
                        <span>Xóa khoảng trắng ở đầu/cuối dòng</span>
                        <div className={cn("size-4 rounded border flex items-center justify-center", options.trimLines && "bg-blue-500 border-blue-500 text-white")}>
                            {options.trimLines && <Check className="size-3" />}
                        </div>
                    </button>

                    <button
                        onClick={() => toggleOption("removeAllLineBreaks")}
                        className={cn(
                            "flex items-center justify-between rounded-xl border p-3 text-sm transition-all",
                            options.removeAllLineBreaks ? "border-blue-500/50 bg-blue-500/5 text-blue-600 dark:text-blue-400" : "border-border hover:bg-muted"
                        )}
                    >
                        <span>Xóa tất cả dấu xuống dòng</span>
                        <div className={cn("size-4 rounded border flex items-center justify-center", options.removeAllLineBreaks && "bg-blue-500 border-blue-500 text-white")}>
                            {options.removeAllLineBreaks && <Check className="size-3" />}
                        </div>
                    </button>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="grid min-h-[200px] flex-1 grid-cols-1 gap-4 md:min-h-[400px] lg:grid-cols-2">
                {/* Input Panel */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border bg-muted/50 px-3">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Văn bản gốc
                        </span>
                        <button
                            onClick={handleClear}
                            className="flex items-center text-xs text-muted-foreground transition-colors hover:text-destructive"
                        >
                            <Trash2 className="mr-1 size-3.5" />
                            Xóa trắng
                        </button>
                    </div>
                    <textarea
                        id="input-text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-1 w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Dán văn bản có nhiều dòng trống hoặc khoảng trắng thừa tại đây..."
                        spellCheck={false}
                    />
                </div>

                {/* Output Panel */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border bg-muted/50 px-3">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Kết quả đã dọn dẹp
                        </span>
                        <button
                            onClick={handleCopy}
                            disabled={!output}
                            className={cn(
                                "flex items-center text-xs transition-colors",
                                copied ? "text-green-500" : "text-muted-foreground hover:text-foreground"
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
                    </div>
                    <textarea
                        id="output-text"
                        value={output}
                        readOnly
                        className="flex-1 w-full resize-none bg-muted/20 p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Kết quả dọn dẹp sẽ hiển thị ở đây..."
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Info Metrics */}
            {input && (
                <div className="mt-4 flex shrink-0 flex-wrap gap-6 px-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="size-3.5 text-yellow-500" />
                        <span>Giảm bớt: <span className="font-bold text-foreground">{input.length - output.length}</span> ký tự</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <AlignJustify className="size-3.5 text-blue-500" />
                        <span>Số dòng: {output.split("\n").filter(Boolean).length} ({input.split("\n").length} trước đó)</span>
                    </div>
                </div>
            )}
        </div>
    );
}
