"use client";

import { useState, useMemo } from "react";
import { 
    Calculator, 
    TrendingUp, 
    TrendingDown, 
    Info,
    ArrowRight,
    Divide,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
            {/* Mode Toggle */}
            <div className="flex flex-col gap-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-1">Loại tam suất</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setType("direct")}
                        className={cn(
                            "flex items-center gap-4 rounded-3xl border p-6 transition-all",
                            type === "direct" 
                                ? "border-blue-500 bg-blue-500/10 text-blue-600 shadow-md shadow-blue-500/5" 
                                : "border-border bg-card text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <div className={cn("rounded-2xl p-3", type === "direct" ? "bg-blue-500 text-white" : "bg-muted")}>
                            <TrendingUp className="size-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Tỷ lệ thuận</p>
                            <p className="text-xs opacity-70">A tăng thì B tăng, A giảm thì B giảm.</p>
                        </div>
                    </button>

                    <button
                        onClick={() => setType("inverse")}
                        className={cn(
                            "flex items-center gap-4 rounded-3xl border p-6 transition-all",
                            type === "inverse" 
                                ? "border-orange-500 bg-orange-500/10 text-orange-600 shadow-md shadow-orange-500/5" 
                                : "border-border bg-card text-muted-foreground hover:bg-muted"
                        )}
                    >
                        <div className={cn("rounded-2xl p-3", type === "inverse" ? "bg-orange-500 text-white" : "bg-muted")}>
                            <TrendingDown className="size-6" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold">Tỷ lệ nghịch</p>
                            <p className="text-xs opacity-70">A tăng thì B giảm, A giảm thì B tăng.</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Workplace Grid */}
            <div className="rounded-[2.5rem] border border-border bg-card p-8 md:p-12 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-6 md:gap-12">
                    
                    {/* Left Column (A & C) */}
                    <div className="flex flex-col gap-8">
                         <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giá trị A</label>
                            <input
                                type="number"
                                value={a}
                                onChange={(e) => setA(e.target.value)}
                                className="w-full bg-transparent text-4xl font-black outline-none focus:text-blue-500 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                        </div>
                        <div className="h-px bg-border/50 relative">
                             <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[10px] font-bold text-muted-foreground bg-card pr-2">Tương ứng với</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giá trị C</label>
                            <input
                                type="number"
                                value={c}
                                onChange={(e) => setC(e.target.value)}
                                className="w-full bg-transparent text-4xl font-black outline-none focus:text-blue-500 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Middle Arrows */}
                    <div className="flex flex-col justify-around py-4 h-full min-h-[140px] text-muted-foreground/30">
                        <ArrowRight className="size-8" />
                        <ArrowRight className="size-8" />
                    </div>

                    {/* Right Column (B & Result) */}
                    <div className="flex flex-col gap-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Giá trị B</label>
                            <input
                                type="number"
                                value={b}
                                onChange={(e) => setB(e.target.value)}
                                className="w-full bg-transparent text-4xl font-black outline-none focus:text-blue-500 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                        </div>
                        <div className="h-px bg-border/50 relative">
                             <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[10px] font-bold text-muted-foreground bg-card pr-2">Kết quả (x)</div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className={cn(
                                "text-5xl font-black tracking-tighter truncate",
                                result !== null ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground/20"
                            )}>
                                {result !== null ? (Math.round(result * 1000) / 1000) : "?"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Formula Visualization */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-3xl border border-border bg-card/30 p-8 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Cách tính toán</p>
                    <div className="flex items-center gap-4 font-mono text-xl">
                        <span>x</span>
                        <span className="text-muted-foreground">=</span>
                        {type === "direct" ? (
                            <div className="flex flex-col items-center">
                                <span className="border-b border-foreground px-4">({b} × {c})</span>
                                <span className="pt-1">{a}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <span className="border-b border-foreground px-4">({a} × {b})</span>
                                <span className="pt-1">{c}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl bg-blue-600 p-8 text-white shadow-xl shadow-blue-500/20">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="size-5" />
                        <span className="font-bold">Mẹo nhỏ</span>
                    </div>
                    <ul className="text-sm space-y-3 opacity-90">
                        <li>• <strong>Thuận:</strong> Nhân chéo (B × C) rồi chia ngang (A). Thường dùng cho: Tính giá tiền, tính khối lượng nguyên liệu...</li>
                        <li>• <strong>Nghịch:</strong> Nhân ngang (A × B) rồi chia dưới (C). Thường dùng cho: Tính thời gian hoàn thành công việc theo số người...</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
