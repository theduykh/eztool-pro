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
    Check,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { convertUnit, getUnitsForCategory, type UnitCategory } from "@/lib/math/converter";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: UnitCategory; label: string; icon: LucideIcon }[] = [
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

    useEffect(() => {
        setFromUnit(units[0].id);
        setToUnit(units[1]?.id || units[0].id);
    }, [units]);

    const result = useMemo(() => {
        const val = parseFloat(fromValue);
        if (isNaN(val)) return 0;
        const res = convertUnit(val, fromUnit, toUnit, category);
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
            <div className="flex flex-wrap gap-2 md:gap-4">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                        <button
                            id={`btn-category-${cat.id}`}
                            key={cat.id}
                            onClick={() => setCategory(cat.id)}
                            className={cn(
                                "flex min-w-[140px] flex-1 items-center justify-center gap-3 rounded-2xl border px-6 py-4 transition-all",
                                category === cat.id
                                    ? "border-blue-500 bg-blue-500/10 text-blue-600 shadow-sm"
                                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                            )}
                        >
                            <Icon className="size-5" />
                            <span className="text-sm font-semibold">{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            <ToolPanel radius="lg" padding="lg" className="shadow-xl md:p-12">
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
                    <div className="flex flex-col gap-4">
                        <ToolLabel>Từ</ToolLabel>
                        <div className="flex flex-col gap-3">
                            <input
                                id="input-from"
                                type="number"
                                value={fromValue}
                                onChange={(e) => setFromValue(e.target.value)}
                                className="w-full bg-transparent text-5xl font-black tracking-tighter outline-none focus:text-blue-600 dark:focus:text-blue-400"
                                placeholder="0"
                            />
                            <select
                                id="select-from-unit"
                                value={fromUnit}
                                onChange={(e) => setFromUnit(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/50 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-center">
                        <Button
                            id="btn-swap"
                            variant="outline"
                            size="icon"
                            onClick={handleSwap}
                            className="size-14 rounded-full border-2 border-blue-500/20 bg-background transition-all hover:bg-blue-500 hover:text-white active:scale-95"
                        >
                            <ArrowLeftRight className="size-6" />
                        </Button>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <ToolLabel>Đến</ToolLabel>
                            <Button
                                id="btn-copy"
                                variant="ghost"
                                size="sm"
                                onClick={handleCopy}
                                className={cn(
                                    "h-8 size-8 rounded-lg p-0",
                                    copied && "text-green-500",
                                )}
                            >
                                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            </Button>
                        </div>
                        <div className="flex flex-col gap-3">
                            <div
                                id="output-result"
                                className="scrollbar-hide flex h-[60px] items-center overflow-x-auto overflow-y-hidden whitespace-nowrap text-5xl font-black tracking-tighter text-blue-600 dark:text-blue-400"
                            >
                                {result}
                            </div>
                            <select
                                id="select-to-unit"
                                value={toUnit}
                                onChange={(e) => setToUnit(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/50 p-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500/30"
                            >
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </ToolPanel>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <ToolPanel radius="lg" padding="lg">
                    <div className="flex items-start gap-4">
                        <div className="rounded-2xl bg-yellow-500/10 p-3 text-yellow-600">
                            <Zap className="size-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold">Công thức tính toán</p>
                            <p className="mt-1 text-xs italic leading-relaxed text-muted-foreground">
                                1 {units.find((u) => u.id === fromUnit)?.id} x{" "}
                                {units.find((u) => u.id === fromUnit)?.ratio} ={" "}
                                {units.find((u) => u.id === fromUnit)?.ratio} hệ thống chuẩn quốc tế
                                (SI)
                            </p>
                        </div>
                    </div>
                </ToolPanel>
                <div className="flex flex-col justify-center rounded-3xl border border-border bg-blue-600 p-6 text-white shadow-lg shadow-blue-500/20">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest opacity-80">
                        Kết quả tóm tắt
                    </p>
                    <p className="text-lg font-bold">
                        {fromValue} {fromUnit} = {result} {toUnit}
                    </p>
                </div>
            </div>
        </div>
    );
}
