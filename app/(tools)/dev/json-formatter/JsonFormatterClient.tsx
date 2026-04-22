"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
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
        [input],
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
            const el = document.getElementById("output-json") as HTMLTextAreaElement | null;
            if (el) {
                el.select();
                document.execCommand("copy");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    }, [output, hasError]);

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
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button id="btn-format" onClick={() => handleProcess("format")} size="lg">
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

            <div className="grid min-h-[200px] flex-1 grid-cols-1 gap-4 md:min-h-[400px] lg:grid-cols-2">
                <ToolPanel
                    padding="none"
                    header={
                        <>
                            <ToolLabel>Input</ToolLabel>
                            <button
                                id="btn-paste"
                                onClick={handlePaste}
                                className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ClipboardPaste className="mr-1 size-3.5" />
                                Paste
                            </button>
                        </>
                    }
                >
                    <textarea
                        id="input-json"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onPaste={handleInputPaste}
                        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder={'Example: {"name": "eztool", "status": "active"}'}
                        spellCheck={false}
                    />
                </ToolPanel>

                <ToolPanel
                    padding="none"
                    header={
                        <>
                            <div className="flex items-center gap-2">
                                <ToolLabel>Output</ToolLabel>
                                {hasError && <AlertCircle className="size-3.5 text-destructive" />}
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
                        </>
                    }
                >
                    <textarea
                        id="output-json"
                        value={output}
                        readOnly
                        className={cn(
                            "h-full w-full resize-none bg-muted/20 p-4 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50",
                            hasError ? "text-destructive" : "text-foreground",
                        )}
                        placeholder={`{
  "name": "eztool",
  "status": "active"
}`}
                        spellCheck={false}
                    />
                </ToolPanel>
            </div>
        </div>
    );
}
