"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    Copy, 
    Check, 
    RefreshCw, 
    Type, 
    Pilcrow, 
    CaseSensitive,
    Settings2,
    Zap,
    Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateLorem, generateLoremByChars, type LoremType } from "@/lib/string/lorem";
import { cn } from "@/lib/utils";

const TYPES: { id: LoremType | "chars"; label: string; icon: any }[] = [
    { id: "paragraphs", label: "Đoạn văn", icon: Pilcrow },
    { id: "words", label: "Từ", icon: Type },
    { id: "sentences", label: "Câu", icon: CaseSensitive },
    { id: "chars", label: "Ký tự", icon: Hash },
];

export function LoremIpsumClient() {
    const [type, setType] = useState<LoremType | "chars">("paragraphs");
    const [count, setCount] = useState(3);
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [result, setResult] = useState("");
    const [copied, setCopied] = useState(false);

    const handleGenerate = useCallback(() => {
        let generated = "";
        if (type === "chars") {
            generated = generateLoremByChars(count);
        } else {
            generated = generateLorem({ type: type as LoremType, count, startWithLorem });
        }
        setResult(generated);
    }, [type, count, startWithLorem]);

    // Initial generate
    useEffect(() => {
        handleGenerate();
    }, []); // Run once on mount

    const handleCopy = async () => {
        if (!result) return;
        try {
            await navigator.clipboard.writeText(result);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Control Panel */}
            <div className="grid grid-cols-1 gap-6 rounded-2xl border border-border bg-card p-6 shadow-sm lg:grid-cols-4">
                {/* Type Selection */}
                <div className="lg:col-span-2">
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Loại văn bản
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {TYPES.map((t) => {
                            const Icon = t.icon;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={cn(
                                        "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                                        type === t.id
                                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                                    )}
                                >
                                    <Icon className="size-4" />
                                    {t.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Count Input */}
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Số lượng
                    </p>
                    <div className="flex items-center gap-3">
                        <input
                            type="number"
                            min={1}
                            max={type === "chars" ? 5000 : 100}
                            value={count}
                            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-end">
                    <Button
                        onClick={handleGenerate}
                        className="w-full gap-2 rounded-xl bg-blue-600 py-6 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
                    >
                        <RefreshCw className="size-4" />
                        Tạo lại
                    </Button>
                </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center gap-6 px-2">
                <label className="flex cursor-pointer items-center gap-3 text-sm text-foreground transition-colors">
                    <div 
                        className={cn(
                            "flex h-5 w-9 items-center rounded-full bg-muted p-0.5 transition-colors",
                            startWithLorem && "bg-blue-600"
                        )}
                        onClick={() => setStartWithLorem(!startWithLorem)}
                    >
                        <div 
                            className={cn(
                                "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                startWithLorem ? "translate-x-4" : "translate-x-0"
                            )}
                        />
                    </div>
                    <span>Bắt đầu bằng "Lorem ipsum..."</span>
                </label>
            </div>

            {/* Result Area */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Zap className="size-3.5 text-yellow-500" />
                        Kết quả ({result.length} ký tự)
                    </div>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCopy}
                        disabled={!result}
                        className={cn(
                            "h-8 gap-2 rounded-lg transition-all",
                            copied && "bg-green-500 text-white hover:bg-green-600"
                        )}
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
                <div className="relative">
                    <textarea
                        className="h-80 w-full resize-y rounded-2xl border border-border bg-card p-6 font-sans text-base leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:h-96"
                        value={result}
                        readOnly
                    />
                </div>
            </div>

            {/* Quick Tips */}
            <div className="rounded-xl border border-border bg-card/50 p-6 flex gap-4 items-start">
                <Settings2 className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground mb-1">Mẹo nhỏ:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Dùng <strong>Đoạn văn</strong> để lấp đầy các khối văn bản lớn.</li>
                        <li>Dùng <strong>Từ</strong> hoặc <strong>Câu</strong> cho các tiêu đề hoặc thẻ mô tả ngắn.</li>
                        <li>Dùng <strong>Ký tự</strong> khi bạn cần độ chính xác tuyệt đối cho giới hạn của giao diện.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
