"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    Copy, 
    Check, 
    Trash2, 
    Link2, 
    Zap,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toSlug } from "@/lib/string/slug";
import { cn } from "@/lib/utils";

export function TextToSlugClient() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);

    const handleConvert = useCallback((text: string) => {
        if (!text) {
            setOutput("");
            return;
        }
        setOutput(toSlug(text));
    }, []);

    useEffect(() => {
        handleConvert(input);
    }, [input, handleConvert]);

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

    return (
        <div className="flex flex-col gap-6">
            {/* Input Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Tiêu đề hoặc văn bản gốc
                    </label>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={!input}
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" />
                        Xóa
                    </Button>
                </div>
                <div className="relative">
                    <input
                        type="text"
                        className="w-full rounded-2xl border border-border bg-card p-4 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Ví dụ: Cách cài đặt React mới nhất 2024"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                </div>
            </div>

            {/* Output Section */}
            <div className="flex flex-col gap-3">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    URL Slug (Kết quả)
                </label>
                <div className="group relative flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-1 pl-4">
                    <div className="flex-1 overflow-x-auto whitespace-nowrap py-3 pr-2 scrollbar-hide">
                        <span className={cn(
                            "font-mono text-sm tracking-tight",
                            output ? "text-blue-600 dark:text-blue-400 font-semibold" : "text-muted-foreground italic"
                        )}>
                            {output || "Kết quả slug sẽ hiển thị ở đây..."}
                        </span>
                    </div>
                    
                    <Button
                        onClick={handleCopy}
                        disabled={!output}
                        className={cn(
                            "h-full rounded-xl px-6 transition-all",
                            copied ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="mr-2 size-4" />
                                <span>Đã chép</span>
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 size-4" />
                                <span>Copy Slug</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Detailed result summary */}
            {output && (
                <div className="flex flex-wrap gap-4 px-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="size-3.5 text-yellow-500" />
                        <span>Đã loại bỏ {input.length - output.length} ký tự đặc biệt</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="size-3.5 text-blue-500" />
                        <span>Độ dài: {output.length} ký tự</span>
                    </div>
                </div>
            )}

            {/* Info box */}
            <div className="rounded-xl border border-border bg-card/30 p-6 flex gap-4 items-start">
                <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-1">URL Slug là gì?</p>
                    Slug là phần cuối cùng của URL giúp mô tả nội dung trang một cách dễ hiểu cho cả người dùng và công cụ tìm kiếm (Google). 
                    Một slug tốt phải <strong>không dấu</strong>, các từ cách nhau bởi <strong>dấu gạch ngang</strong> và <strong>không chứa ký tự đặc biệt</strong>.
                </div>
            </div>
        </div>
    );
}
