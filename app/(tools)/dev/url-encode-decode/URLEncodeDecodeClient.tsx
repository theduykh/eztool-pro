"use client";

import { useState, useCallback, useEffect } from "react";
import {
    Copy,
    Check,
    Trash2,
    ArrowLeftRight,
    Link2,
    Zap,
    AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { encodeUrl, decodeUrl } from "@/lib/string/url-codec";
import { cn } from "@/lib/utils";

export function URLEncodeDecodeClient() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isAuto, setIsAuto] = useState(true);
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Core conversion logic
    const convert = useCallback((text: string, currentMode: "encode" | "decode") => {
        if (!text) {
            setOutput("");
            setError(null);
            return;
        }

        try {
            const result = currentMode === "encode" ? encodeUrl(text) : decodeUrl(text);
            setOutput(result);
            setError(null);
        } catch (e: any) {
            setError(e.message || "Đã có lỗi xảy ra");
            setOutput("");
        }
    }, []);

    // Handle auto-conversion
    useEffect(() => {
        if (isAuto) {
            convert(input, mode);
        }
    }, [input, mode, isAuto, convert]);

    const handleManualConvert = () => {
        convert(input, mode);
    };

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

    const handleSwap = () => {
        const newMode = mode === "encode" ? "decode" : "encode";
        setMode(newMode);
        setInput(output);
        // Output will update via useEffect if isAuto is true
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    return (
        <div className="grid grid-cols-1 gap-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2">
                    <Button
                        variant={mode === "encode" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("encode")}
                        className="rounded-lg px-6"
                    >
                        Mã hóa (Encode)
                    </Button>
                    <Button
                        variant={mode === "decode" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setMode("decode")}
                        className="rounded-lg px-6"
                    >
                        Giải mã (Decode)
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                        <div
                            className={cn(
                                "flex h-5 w-9 items-center rounded-full bg-muted p-0.5 transition-colors",
                                isAuto && "bg-blue-600"
                            )}
                            onClick={() => setIsAuto(!isAuto)}
                        >
                            <div
                                className={cn(
                                    "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                    isAuto ? "translate-x-4" : "translate-x-0"
                                )}
                            />
                        </div>
                        <span className="flex items-center gap-1">
                            <Zap className={cn("size-3.5", isAuto && "fill-yellow-500 text-yellow-500")} />
                            Tự động
                        </span>
                    </label>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwap}
                        title="Đổi chiều và sử dụng kết quả làm đầu vào"
                        className="size-9 rounded-lg"
                    >
                        <ArrowLeftRight className="size-4" />
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClear}
                        title="Xóa tất cả"
                        className="size-9 rounded-lg hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>

            {/* Input/Output Workspace */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Input Area */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Đầu vào ({mode === "encode" ? "Văn bản" : "URL đã mã hóa"})
                        </label>
                    </div>
                    <div className="relative flex-1">
                        <textarea
                            className="h-64 w-full resize-none rounded-2xl border border-border bg-card p-4 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:h-[400px]"
                            placeholder={mode === "encode" ? "Nhập văn bản cần mã hóa..." : "Nhập URL cần giải mã..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </div>
                </div>

                {/* Output Area */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            Kết quả ({mode === "encode" ? "URL an toàn" : "Văn bản gốc"})
                        </label>
                    </div>
                    <div className="relative flex-1">
                        <textarea
                            className={cn(
                                "h-64 w-full resize-none rounded-2xl border border-border bg-card p-4 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:h-[400px]",
                                error ? "border-destructive/50 bg-destructive/5" : "bg-card/50"
                            )}
                            placeholder="Kết quả sẽ hiển thị ở đây..."
                            value={output}
                            readOnly
                        />

                        {/* Status/Error overlay */}
                        {error && (
                            <div className="absolute inset-x-0 bottom-0 p-4">
                                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive border border-destructive/20">
                                    <AlertCircle className="size-4 shrink-0" />
                                    {error}
                                </div>
                            </div>
                        )}

                        {/* Copy button */}
                        <div className="absolute right-4 top-4">
                            <Button
                                size="sm"
                                variant="secondary"
                                onClick={handleCopy}
                                disabled={!output}
                                className="h-8 gap-2 rounded-lg bg-background/80 backdrop-blur-sm"
                            >
                                {copied ? (
                                    <>
                                        <Check className="size-3.5" />
                                        <span>Đã chép</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="size-3.5" />
                                        <span>Sao chép</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Action (shown when auto is off) */}
            {!isAuto && (
                <div className="flex justify-center">
                    <Button
                        size="lg"
                        onClick={handleManualConvert}
                        className="w-full gap-2 rounded-xl md:w-64"
                        disabled={!input}
                    >
                        {mode === "encode" ? <Link2 className="size-5" /> : < Zap className="size-5" />}
                        Thực hiện {mode === "encode" ? "Mã hóa" : "Giải mã"}
                    </Button>
                </div>
            )}
        </div>
    );
}
