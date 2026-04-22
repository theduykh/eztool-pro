"use client";

import { useState, useCallback } from "react";
import {
    Copy,
    Check,
    Trash2,
    Type,
    ArrowLeftRight,
    CaseLower,
    CaseUpper,
    CaseSensitive,
    Pilcrow,
    Code,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { ToolInfoBox } from "@/components/shared/ToolInfoBox";
import { convertCase, type CaseType } from "@/lib/string/case-converter";
import { cn } from "@/lib/utils";

const CASE_OPTIONS: { id: CaseType; label: string; icon: LucideIcon; hint: string }[] = [
    { id: "uppercase", label: "UPPERCASE", icon: CaseUpper, hint: "CHỮ HOA TOÀN BỘ" },
    { id: "lowercase", label: "lowercase", icon: CaseLower, hint: "chữ thường toàn bộ" },
    { id: "sentence", label: "Sentence case", icon: Pilcrow, hint: "Viết hoa chữ cái đầu câu." },
    { id: "title", label: "Title Case", icon: CaseSensitive, hint: "Viết Hoa Chữ Cái Đầu Mỗi Từ" },
    { id: "camel", label: "camelCase", icon: Code, hint: "dùngChoBiếnTrongCode" },
    { id: "pascal", label: "PascalCase", icon: Code, hint: "DùngChoTênLớpTrongCode" },
    { id: "snake", label: "snake_case", icon: Type, hint: "dùng_cho_tên_tệp_hoặc_db" },
    { id: "kebab", label: "kebab-case", icon: Type, hint: "dùng-cho-url-slug" },
];

export function CaseConverterClient() {
    const [text, setText] = useState("");
    const [copied, setCopied] = useState(false);

    const handleConvert = useCallback(
        (type: CaseType) => {
            if (!text) return;
            const result = convertCase(text, type);
            setText(result);
        },
        [text],
    );

    const handleCopy = async () => {
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleClear = () => {
        setText("");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <ToolLabel>Nội dung văn bản</ToolLabel>
                    <div className="flex items-center gap-2">
                        <Button
                            id="btn-clear"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            disabled={!text}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-3.5" />
                            Xóa
                        </Button>
                        <Button
                            id="btn-copy"
                            variant="secondary"
                            size="sm"
                            onClick={handleCopy}
                            disabled={!text}
                            className={cn(
                                "h-8 gap-1.5 text-xs transition-all",
                                copied && "bg-green-500 text-white hover:bg-green-600",
                            )}
                        >
                            {copied ? (
                                <>
                                    <Check className="size-3.5" />
                                    Đã chép
                                </>
                            ) : (
                                <>
                                    <Copy className="size-3.5" />
                                    Sao chép
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className="relative">
                    <textarea
                        id="input-text"
                        className="h-64 w-full resize-y rounded-2xl border border-border bg-card p-6 font-sans text-base leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:h-80"
                        placeholder="Nhập hoặc dán văn bản của bạn tại đây để bắt đầu chuyển đổi..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 font-mono text-[10px] text-muted-foreground">
                        {text.length} ký tự | {text.split(/\s+/).filter(Boolean).length} từ
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {CASE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                        <button
                            id={`btn-case-${opt.id}`}
                            key={opt.id}
                            onClick={() => handleConvert(opt.id)}
                            disabled={!text}
                            className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 transition-all hover:border-blue-500/50 hover:bg-blue-500/5 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <div className="flex size-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-blue-500 group-hover:text-white">
                                <Icon className="size-5" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-semibold">{opt.label}</p>
                                <p className="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground">
                                    {opt.hint}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <ToolInfoBox
                tone="neutral"
                icon={<ArrowLeftRight className="size-5 text-blue-500" />}
                title="Mẹo chuyển đổi"
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <p>
                        • <strong>Sentence case</strong> tự động nhận diện dấu chấm để viết hoa đầu câu mới.
                    </p>
                    <p>
                        • <strong>Snake/Camel case</strong> hỗ trợ dọn dẹp các ký tự đặc biệt để dùng trong lập
                        trình.
                    </p>
                </div>
            </ToolInfoBox>
        </div>
    );
}
