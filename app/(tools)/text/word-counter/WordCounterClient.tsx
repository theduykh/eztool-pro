"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { countText } from "@/lib/string/word-counter";
import {
    Trash2,
    Type,
    Hash,
    FileText,
    AlignLeft,
    Clock,
    Space,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * WordCounterClient - Giao diện chính của công cụ đếm từ
 * Sử dụng bối cảnh "use client" vì có tương tác thời gian thực với người dùng.
 */
export function WordCounterClient() {
    const [text, setText] = useState("");

    // Memoize kết quả tính toán để tối ưu hiệu năng khi text thay đổi
    const stats = useMemo(() => countText(text), [text]);

    const handleClear = () => {
        setText("");
    };

    // Cấu trúc các thẻ hiển thị chỉ số
    const statCards = [
        {
            label: "Từ",
            value: stats.words,
            icon: Type,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Ký tự",
            value: stats.characters,
            icon: Hash,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
        },
        {
            label: "Câu",
            value: stats.sentences,
            icon: FileText,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
        },
        {
            label: "Đoạn văn",
            value: stats.paragraphs,
            icon: AlignLeft,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
        },
    ];

    return (
        <div className="flex h-full flex-col gap-4">
            {/* Stats Grid */}
            <div className="grid shrink-0 grid-cols-2 gap-4 md:grid-cols-4">
                {statCards.map((card) => (
                    <div
                        key={card.label}
                        className="group flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-border/80 hover:shadow-md"
                    >
                        <div
                            className={cn(
                                "mb-3 flex size-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110",
                                card.bgColor
                            )}
                        >
                            <card.icon className={cn("size-5", card.color)} />
                        </div>
                        <span className="text-3xl font-bold tracking-tight text-foreground">
                            {card.value.toLocaleString()}
                        </span>
                        <span className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {card.label}
                        </span>
                    </div>
                ))}
            </div>

            {/* Main Area: Input + Secondary Stats */}
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-500/20">
                {/* Secondary Info Bar */}
                <div className="flex flex-col gap-3 border-b border-border bg-muted/30 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <Clock className="mr-2 size-4 text-blue-500" />
                            Thời gian đọc: 
                            <span className="ml-1 font-bold text-foreground">
                                {stats.readingTime} {stats.readingTime <= 1 ? "phút" : "phút"}
                            </span>
                        </div>
                        <div className="hidden h-4 w-px bg-border sm:block" />
                        <div className="flex items-center text-sm font-medium text-muted-foreground">
                            <Space className="mr-2 size-4 text-purple-500" />
                            Ký tự (không cách): 
                            <span className="ml-1 font-bold text-foreground">
                                {stats.charactersNoSpaces.toLocaleString()}
                            </span>
                        </div>
                    </div>
                    
                    <Button
                        id="btn-clear"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={!text}
                        className="self-end text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive active:scale-95 sm:self-auto"
                    >
                        <Trash2 className="mr-2 size-4" />
                        Xóa trắng
                    </Button>
                </div>

                {/* Text Area */}
                <textarea
                    id="input-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="flex-1 w-full resize-none border-none bg-transparent p-6 text-xl leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-0 sm:p-8"
                    placeholder="Nhập hoặc dán văn bản của bạn tại đây để bắt đầu đếm tự động..."
                    spellCheck={false}
                    autoFocus
                />

                {/* Footer hint */}
                <div className="border-t border-border bg-muted/10 px-6 py-2">
                    <p className="text-[10px] text-muted-foreground/60">
                        * Dữ liệu được xử lý trực tiếp trên trình duyệt của bạn, đảm bảo tính riêng tư tuyệt đối.
                    </p>
                </div>
            </div>
        </div>
    );
}
