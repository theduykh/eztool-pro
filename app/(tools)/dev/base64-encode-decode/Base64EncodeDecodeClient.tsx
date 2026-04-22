"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Binary,
    FileText,
    ArrowLeftRight,
    Trash2,
    ClipboardPaste,
    Copy,
    Check,
    AlertCircle,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { encodeBase64, decodeBase64 } from "@/lib/string/base64-codec";
import { cn } from "@/lib/utils";

export function Base64EncodeDecodeClient() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isAuto, setIsAuto] = useState(true);
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const convert = useCallback((text: string, currentMode: "encode" | "decode") => {
        if (!text) {
            setOutput("");
            setError(null);
            return;
        }
        try {
            const result = currentMode === "encode" ? encodeBase64(text) : decodeBase64(text);
            setOutput(result);
            setError(null);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Đã có lỗi xảy ra");
            setOutput("");
        }
    }, []);

    useEffect(() => {
        if (isAuto) convert(input, mode);
    }, [input, mode, isAuto, convert]);

    const handleModeClick = useCallback(
        (newMode: "encode" | "decode") => {
            setMode(newMode);
            convert(input, newMode);
        },
        [input, convert],
    );

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
            convert(text, mode);
        } catch {
            /* clipboard blocked */
        }
    }, [mode, convert]);

    const handleCopy = useCallback(async () => {
        if (!output || error) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.getElementById("output-base64") as HTMLTextAreaElement | null;
            if (el) {
                el.select();
                document.execCommand("copy");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    }, [output, error]);

    const handleSwap = useCallback(() => {
        const newMode = mode === "encode" ? "decode" : "encode";
        setMode(newMode);
        setInput(output);
        setOutput("");
        setError(null);
    }, [mode, output]);

    const handleClear = useCallback(() => {
        setInput("");
        setOutput("");
        setError(null);
    }, []);

    const outputText = error ? `❌ Lỗi:\n${error}` : output;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button
                    id="btn-encode"
                    onClick={() => handleModeClick("encode")}
                    variant={mode === "encode" ? "default" : "outline"}
                    size="lg"
                >
                    <Binary data-icon="inline-start" />
                    Mã hóa (Encode)
                </Button>
                <Button
                    id="btn-decode"
                    onClick={() => handleModeClick("decode")}
                    variant={mode === "decode" ? "default" : "outline"}
                    size="lg"
                >
                    <FileText data-icon="inline-start" />
                    Giải mã (Decode)
                </Button>

                <div className="ml-auto flex items-center gap-1">
                    <button
                        onClick={() => setIsAuto((v) => !v)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
                            isAuto
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                        title={isAuto ? "Tắt tự động" : "Bật tự động"}
                    >
                        <Zap
                            className={cn("size-4", isAuto && "fill-yellow-400 text-yellow-500")}
                        />
                        Tự động
                    </button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwap}
                        title="Đổi chiều (dùng output làm input)"
                        disabled={!output || !!error}
                    >
                        <ArrowLeftRight className="size-4" />
                    </Button>
                    <Button
                        id="btn-clear"
                        variant="destructive"
                        size="lg"
                        onClick={handleClear}
                    >
                        <Trash2 data-icon="inline-start" />
                        Xóa trắng
                    </Button>
                </div>
            </div>

            <div className="grid min-h-[200px] flex-1 grid-cols-1 gap-4 md:min-h-[400px] lg:grid-cols-2">
                <ToolPanel
                    padding="none"
                    header={
                        <>
                            <ToolLabel>
                                {mode === "encode" ? "Văn bản gốc" : "Chuỗi Base64"}
                            </ToolLabel>
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
                        id="input-base64"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder={
                            mode === "encode"
                                ? "Paste text to encode"
                                : "Paste base64 to decode"
                        }
                        spellCheck={false}
                    />
                </ToolPanel>

                <ToolPanel
                    padding="none"
                    header={
                        <>
                            <div className="flex items-center gap-2">
                                <ToolLabel>
                                    {mode === "encode" ? "Chuỗi Base64" : "Văn bản gốc"}
                                </ToolLabel>
                                {error && <AlertCircle className="size-3.5 text-destructive" />}
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
                        id="output-base64"
                        value={outputText}
                        readOnly
                        className={cn(
                            "h-full w-full resize-none bg-muted/20 p-4 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50",
                            error ? "text-destructive" : "text-foreground",
                        )}
                        placeholder="The result will display here..."
                        spellCheck={false}
                    />
                </ToolPanel>
            </div>
        </div>
    );
}
