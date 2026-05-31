"use client";

import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Info, ArrowRight } from "lucide-react";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { calculateRuleOfThree, type RuleType } from "@/lib/math/rule-of-three";
import { cn } from "@/lib/utils";

export function RuleOfThreeClient() {
    const [type, setType] = useState<RuleType>("direct");
    const [a, setA] = useState<string>("10");
    const [b, setB] = useState<string>("100");
    const [c, setC] = useState<string>("20");

    const result = useMemo(() => {
        const valA = parseFloat(a);
        const valB = parseFloat(b);
        const valC = parseFloat(c);

        if (isNaN(valA) || isNaN(valB) || isNaN(valC)) return null;

        try {
            return calculateRuleOfThree(valA, valB, valC, type);
        } catch {
            return null;
        }
    }, [a, b, c, type]);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
                <ToolLabel className="px-1">Loại tam suất</ToolLabel>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <button
                        id="btn-direct"
                        onClick={() => setType("direct")}
                        className={cn(
                            "flex items-center gap-4 rounded-3xl border p-6 transition-all",
                            type === "direct"
                                ? "border-blue-500 bg-blue-500/10 text-blue-600 shadow-md shadow-blue-500/5"
                                : "border-border bg-card text-muted-foreground hover:bg-muted",
                        )}
                    >
                        <div
                            className={cn(
                                "rounded-2xl p-3",
                                type === "direct" ? "bg-blue-500 text-white" : "bg-muted",
                            )}
                        >
                            <TrendingUp className="size-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Tỷ lệ thuận</p>
                            <p className="text-xs opacity-70">A tăng thì B tăng, A giảm thì B giảm.</p>
                        </div>
                    </button>

                    <button
                        id="btn-inverse"
                        onClick={() => setType("inverse")}
                        className={cn(
                            "flex items-center gap-4 rounded-3xl border p-6 transition-all",
                            type === "inverse"
                                ? "border-orange-500 bg-orange-500/10 text-orange-600 shadow-md shadow-orange-500/5"
                                : "border-border bg-card text-muted-foreground hover:bg-muted",
                        )}
                    >
                        <div
                            className={cn(
                                "rounded-2xl p-3",
                                type === "inverse" ? "bg-orange-500 text-white" : "bg-muted",
                            )}
                        >
                            <TrendingDown className="size-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Tỷ lệ nghịch</p>
                            <p className="text-xs opacity-70">A tăng thì B giảm, A giảm thì B tăng.</p>
                        </div>
                    </button>
                </div>
            </div>

            <ToolPanel radius="lg" padding="lg" className="shadow-xl md:p-12">
                <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-12">
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <ToolLabel htmlFor="input-a" className="text-[10px]">
                                Giá trị A
                            </ToolLabel>
                            <input
                                id="input-a"
                                type="number"
                                value={a}
                                onChange={(e) => setA(e.target.value)}
                                className="w-full bg-transparent text-4xl font-black outline-none focus:text-blue-500 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                        </div>
                        <div className="relative h-px bg-border/50">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-card pr-2 text-[10px] font-bold text-muted-foreground">
                                Tương ứng với
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <ToolLabel htmlFor="input-c" className="text-[10px]">
                                Giá trị C
                            </ToolLabel>
                            <input
                                id="input-c"
                                type="number"
                                value={c}
                                onChange={(e) => setC(e.target.value)}
                                className="w-full bg-transparent text-4xl font-black outline-none focus:text-blue-500 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="flex h-full min-h-[140px] flex-col justify-around py-4 text-muted-foreground/30">
                        <ArrowRight className="size-8" />
                        <ArrowRight className="size-8" />
                    </div>

                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <ToolLabel htmlFor="input-b" className="text-[10px]">
                                Giá trị B
                            </ToolLabel>
                            <input
                                id="input-b"
                                type="number"
                                value={b}
                                onChange={(e) => setB(e.target.value)}
                                className="w-full bg-transparent text-4xl font-black outline-none focus:text-blue-500 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                        </div>
                        <div className="relative h-px bg-border/50">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-card pr-2 text-[10px] font-bold text-muted-foreground">
                                Kết quả (x)
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div
                                id="output-result"
                                className={cn(
                                    "truncate text-5xl font-black tracking-tighter",
                                    result !== null
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-muted-foreground/20",
                                )}
                            >
                                {result !== null ? Math.round(result * 1000) / 1000 : "?"}
                            </div>
                        </div>
                    </div>
                </div>
            </ToolPanel>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ToolPanel tone="subtle" radius="lg" padding="lg" className="items-center justify-center">
                    <div className="flex flex-col items-center text-center">
                        <ToolLabel className="mb-4">Cách tính toán</ToolLabel>
                        <div className="flex items-center gap-4 font-mono text-xl">
                            <span>x</span>
                            <span className="text-muted-foreground">=</span>
                            {type === "direct" ? (
                                <div className="flex flex-col items-center">
                                    <span className="border-b border-foreground px-4">
                                        ({b} × {c})
                                    </span>
                                    <span className="pt-1">{a}</span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="border-b border-foreground px-4">
                                        ({a} × {b})
                                    </span>
                                    <span className="pt-1">{c}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </ToolPanel>

                <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20">
                    <div className="mb-4 flex items-center gap-2">
                        <Info className="size-5" />
                        <span className="font-bold">Mẹo nhỏ</span>
                    </div>
                    <ul className="space-y-3 text-sm opacity-90">
                        <li>
                            • <strong>Thuận:</strong> Nhân chéo (B × C) rồi chia ngang (A). Thường dùng cho: Tính giá
                            tiền, tính khối lượng nguyên liệu...
                        </li>
                        <li>
                            • <strong>Nghịch:</strong> Nhân ngang (A × B) rồi chia dưới (C). Thường dùng cho: Tính
                            thời gian hoàn thành công việc theo số người...
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
