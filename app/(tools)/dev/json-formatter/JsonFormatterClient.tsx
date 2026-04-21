"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { formatJson, minifyJson, type JsonFormatResult } from "@/lib/formatters/json";
import {
    AlignLeft,
    Minimize2,
    Trash2,
    ClipboardPaste,
    Copy,
    Check,
    AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function JsonFormatterClient() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [hasError, setHasError] = useState(false);
    const [copied, setCopied] = useState(false);

    // ── Actions ──

    const handleProcess = useCallback(
        (mode: "format" | "minify") => {
            let result: JsonFormatResult;
            if (mode === "format") {
                result = formatJson(input);
            } else {
                result = minifyJson(input);
            }

            if (result.success) {
                setOutput(result.data);
                setHasError(false);
            } else {
                setOutput("❌ Lỗi định dạng JSON:\n" + result.error);
                setHasError(true);
            }
        },
        [input]
    );

    const handleClear = useCallback(() => {
        setInput("");
        setOutput("");
        setHasError(false);
    }, []);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
            // Auto-format on paste
            const result = formatJson(text);
            if (result.success) {
                setOutput(result.data);
                setHasError(false);
            } else {
                setOutput("❌ Lỗi định dạng JSON:\n" + result.error);
                setHasError(true);
            }
        } catch {
            // Clipboard API may be blocked
        }
    }, []);

    const handleCopy = useCallback(async () => {
        if (!output || hasError) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback: select + copy
            const el = document.getElementById("output-json") as HTMLTextAreaElement | null;
            if (el) {
                el.select();
                document.execCommand("copy");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    }, [output, hasError]);

    // Auto-format on paste event in textarea
    const handleInputPaste = useCallback(() => {
        setTimeout(() => {
            const el = document.getElementById("input-json") as HTMLTextAreaElement | null;
            if (el) {
                const val = el.value;
                const result = formatJson(val);
                if (result.success) {
                    setOutput(result.data);
                    setHasError(false);
                } else {
                    setOutput("❌ Lỗi định dạng JSON:\n" + result.error);
                    setHasError(true);
                }
            }
        }, 10);
    }, []);

    return (
        <div className="flex flex-1 min-h-0 flex-col">
            {/* Action Bar */}
            <div className="mb-4 flex flex-wrap gap-2">
                <Button
                    id="btn-format"
                    onClick={() => handleProcess("format")}
                    size="lg"
                >
                    <AlignLeft data-icon="inline-start" />
                    Format (Làm đẹp)
                </Button>
                <Button
                    id="btn-minify"
                    variant="outline"
                    size="lg"
                    onClick={() => handleProcess("minify")}
                >
                    <Minimize2 data-icon="inline-start" />
                    Minify (Nén)
                </Button>
                <Button
                    id="btn-clear"
                    variant="destructive"
                    size="lg"
                    className="ml-auto"
                    onClick={handleClear}
                >
                    <Trash2 data-icon="inline-start" />
                    Xóa trắng
                </Button>
            </div>

            {/* Editor grid */}
            <div className="grid min-h-[200px] flex-1 grid-cols-1 gap-4 md:min-h-[400px] lg:grid-cols-2">
                {/* Input panel */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border bg-muted/50 px-3">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                            Input
                        </span>
                        <button
                            id="btn-paste"
                            onClick={handlePaste}
                            className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            <ClipboardPaste className="mr-1 size-3.5" />
                            Paste
                        </button>
                    </div>
                    <textarea
                        id="input-json"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPaste={handleInputPaste}
                        className="flex-1 w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500/50"
                        placeholder={'Dán dữ liệu JSON vào đây...\nVí dụ: {"name": "eztool", "status": "active"}'}
                        spellCheck={false}
                    />
                </div>

                {/* Output panel */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border bg-muted/50 px-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                                Output
                            </span>
                            {hasError && (
                                <AlertCircle className="size-3.5 text-destructive" />
                            )}
                        </div>
                        <button
                            id="btn-copy"
                            onClick={handleCopy}
                            className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {copied ? (
                                <>
                                    <Check className="mr-1 size-3.5 text-green-500" />
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
                        id="output-json"
                        value={output}
                        readOnly
                        className={cn(
                            "flex-1 w-full resize-none bg-muted/20 p-4 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-inset focus:ring-2 focus:ring-blue-500/50",
                            hasError ? "text-destructive" : "text-foreground"
                        )}
                        placeholder="Kết quả sẽ hiển thị tại đây..."
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
