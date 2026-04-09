"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    Ruler, 
    Scale, 
    Box, 
    Thermometer, 
    Layers, 
    ArrowLeftRight,
    Zap,
    Copy,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { convertUnit, getUnitsForCategory, type UnitCategory } from "@/lib/math/converter";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: UnitCategory; label: string; icon: any }[] = [
    { id: "length", label: "Độ dài", icon: Ruler },
    { id: "weight", label: "Khối lượng", icon: Scale },
    { id: "area", label: "Diện tích", icon: Layers },
    { id: "volume", label: "Thể tích", icon: Box },
    { id: "temperature", label: "Nhiệt độ", icon: Thermometer },
];

export function UnitConverterClient() {
    const [category, setCategory] = useState<UnitCategory>("length");
    const [fromValue, setFromValue] = useState<string>("1");
    const [fromUnit, setFromUnit] = useState<string>("");
    const [toUnit, setToUnit] = useState<string>("");
    const [copied, setCopied] = useState(false);

    const units = useMemo(() => getUnitsForCategory(category), [category]);

    // Set initial units when category changes
    useEffect(() => {
        setFromUnit(units[0].id);
        setToUnit(units[1]?.id || units[0].id);
    }, [units]);

    const result = useMemo(() => {
        const val = parseFloat(fromValue);
        if (isNaN(val)) return 0;
        const res = convertUnit(val, fromUnit, toUnit, category);
        // Round to 8 decimal places to avoid float precision issues but keep it clean
        return Math.round(res * 100000000) / 100000000;
    }, [fromValue, fromUnit, toUnit, category]);

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
        setFromValue(result.toString());
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(result.toString());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Category selection */}
            <div className="flex flex-wrap gap-2 md:gap-4">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "flex flex-1 items-center justify-center gap-3 rounded-2xl border px-6 py-4 transition-all min-w-[140px]",
                                category === cat.id
                                    ? "border-blue-500 bg-blue-500/10 text-blue-600 shadow-sm"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                            )}
                        >
                            <Icon className="size-5" />
                            <span className="font-semibold text-sm">{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main Converter card */}
            <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-xl md:p-12">
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
                    {/* From Section */}
                    <div className="flex flex-col gap-4">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Từ</label>
                        <div className="flex flex-col gap-3">
                            <input
                                type="number"
                                value={fromValue}
                                onChange={(e) => setFromValue(e.target.value)}
                                className="w-full bg-transparent text-5xl font-black tracking-tighter outline-none focus:text-blue-600 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                            <select
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/50 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>{u.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Swap button */}
                    <div className="flex justify-center">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSwap}
                            className="size-14 rounded-full border-2 border-blue-500/20 bg-background transition-all hover:bg-blue-500 hover:text-white active:scale-95"
                        >
                            <ArrowLeftRight className="size-6" />
                        </Button>
                    </div>

                    {/* To Section */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Đến</label>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={handleCopy}
                                className={cn("h-8 size-8 p-0 rounded-lg", copied && "text-green-500")}
                            >
                                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </Button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div className="flex h-[60px] items-center text-5xl font-black tracking-tighter text-blue-600 dark:text-blue-400 overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide">
                                {result}
                            </div>
                            <select
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/50 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>{u.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Metrics / Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-6">
                    <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-600">
                        <Zap className="size-6" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Công thức tính toán</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed italic">
                            1 {units.find(u => u.id === fromUnit)?.id} x {units.find(u => u.id === fromUnit)?.ratio} = {units.find(u => u.id === fromUnit)?.ratio} hế thống chuẩn quốc tế (SI)
                        </p>
                    </div>
                </div>
                <div className="flex flex-col justify-center rounded-3xl border border-border bg-blue-600 p-6 text-white shadow-lg shadow-blue-500/20">
                    <p className="text-xs font-bold uppercase opacity-80 tracking-widest mb-1">Kết quả tóm tắt</p>
                    <p className="text-lg font-bold">
                        {fromValue} {fromUnit} = {result} {toUnit}
                    </p>
                </div>
            </div>
        </div>
    );
}
