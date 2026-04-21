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
        if (!text) { setOutput(""); setError(null); return; }
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

    // Clicking a mode button always triggers immediate conversion
    const handleModeClick = useCallback((newMode: "encode" | "decode") => {
        setMode(newMode);
        convert(input, newMode);
    }, [input, convert]);

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
            convert(text, mode);
        } catch { /* clipboard blocked */ }
    }, [mode, convert]);

    const handleCopy = useCallback(async () => {
        if (!output || error) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.getElementById("output-base64") as HTMLTextAreaElement | null;
            if (el) { el.select(); document.execCommand("copy"); setCopied(true); setTimeout(() => setCopied(false), 2000); }
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
        setInput(""); setOutput(""); setError(null);
    }, []);

    const outputText = error ? `❌ Lỗi:\n${error}` : output;

    return (
        <div className="flex flex-1 min-h-0 flex-col">
            {/* Action Bar */}
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
                        <Zap className={cn("size-4", isAuto && "fill-yellow-400 text-yellow-500")} />
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

            {/* Editor grid */}
            <div className="grid min-h-[200px] flex-1 grid-cols-1 gap-4 md:min-h-[400px] lg:grid-cols-2">
                {/* Input panel */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border bg-muted/50 px-3">
                        <span className="text-xs font-semibold uppercase text-muted-foreground">
                            {mode === "encode" ? "Văn bản gốc" : "Chuỗi Base64"}
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
                        id="input-base64"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder={
                            mode === "encode"
                                ? "Dán văn bản cần mã hóa vào đây..."
                                : "Dán chuỗi Base64 cần giải mã vào đây..."
                        }
                        spellCheck={false}
                    />
                </div>

                {/* Output panel */}
                <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b border-border bg-muted/50 px-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold uppercase text-muted-foreground">
                                {mode === "encode" ? "Chuỗi Base64" : "Văn bản gốc"}
                            </span>
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
                    </div>
                    <textarea
                        id="output-base64"
                        value={outputText}
                        readOnly
                        className={cn(
                            "w-full flex-1 resize-none bg-muted/20 p-4 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50",
                            error ? "text-destructive" : "text-foreground",
                        )}
                        placeholder="Kết quả sẽ hiển thị tại đây..."
                        spellCheck={false}
                    />
                </div>
            </div>
        </div>
    );
}
