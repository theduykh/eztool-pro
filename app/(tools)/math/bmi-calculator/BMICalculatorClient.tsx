"use client";

import { useState, useMemo } from "react";
import { Activity, Weight, Ruler, Heart, Info, ArrowRight, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { ToolInfoBox } from "@/components/shared/ToolInfoBox";
import { calculateBMI, getBMICategories, type BMIResult, type BMIStandard } from "@/lib/math/bmi";
import { cn } from "@/lib/utils";

export function BmiCalculatorClient() {
    const [weight, setWeight] = useState<string>("70");
    const [height, setHeight] = useState<string>("170");
    const [standard, setStandard] = useState<BMIStandard>("asian");

    const categories = useMemo(() => getBMICategories(standard), [standard]);

    const result = useMemo<BMIResult | null>(() => {
        const w = parseFloat(weight);
        const h = parseFloat(height);
        if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
        try {
            return calculateBMI(w, h, standard);
        } catch {
            return null;
        }
    }, [weight, height, standard]);

    const MIN_BMI = 15;
    const MAX_BMI = 45;
    const TOTAL_SCOPE = MAX_BMI - MIN_BMI;

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
                <ToolPanel padding="md">
                    <ToolLabel className="mb-3">Chọn tiêu chuẩn</ToolLabel>
                    <div className="flex gap-2">
                        <Button
                            id="btn-standard-global"
                            variant={standard === "global" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStandard("global")}
                            className="flex-1 rounded-xl text-xs"
                        >
                            Toàn cầu (WHO)
                        </Button>
                        <Button
                            id="btn-standard-asian"
                            variant={standard === "asian" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStandard("asian")}
                            className="flex-1 rounded-xl text-xs"
                        >
                            Châu Á (IDI & WPRO)
                        </Button>
                    </div>
                </ToolPanel>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                        <ToolLabel htmlFor="input-weight" icon={<Weight className="size-3.5" />}>
                            Cân nặng (kg)
                        </ToolLabel>
                        <input
                            id="input-weight"
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card p-4 text-2xl font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="70"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <ToolLabel htmlFor="input-height" icon={<Ruler className="size-3.5" />}>
                            Chiều cao (cm)
                        </ToolLabel>
                        <input
                            id="input-height"
                            type="number"
                            step="1"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card p-4 text-2xl font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="170"
                        />
                    </div>
                </div>

                <ToolPanel padding="lg">
                    <ToolLabel className="mb-4">Thang đo chỉ số BMI</ToolLabel>
                    <div className="relative flex h-6 w-full overflow-hidden rounded-full bg-muted">
                        {categories.map((cat) => (
                            <div
                                key={cat.label}
                                className={cn("h-full transition-all duration-500", cat.color)}
                                style={{ width: `${((cat.max - cat.min) / TOTAL_SCOPE) * 100}%` }}
                                title={`${cat.label} (${cat.range})`}
                            />
                        ))}
                        {result && (
                            <div
                                className="absolute top-0 h-full w-1 border-x border-white bg-black shadow-lg transition-all duration-500 ease-out dark:border-black dark:bg-white"
                                style={{
                                    left: `${Math.min(Math.max(((result.bmi - MIN_BMI) / TOTAL_SCOPE) * 100, 0), 100)}%`,
                                }}
                            />
                        )}
                    </div>
                    <div className="relative mt-2 h-4 w-full text-[11px] font-medium text-muted-foreground sm:text-xs">
                        <span className="absolute left-0">15</span>
                        <span
                            className="absolute"
                            style={{
                                left: `${((18.5 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                transform: "translateX(-50%)",
                            }}
                        >
                            18.5
                        </span>
                        {standard === "global" ? (
                            <>
                                <span
                                    className="absolute"
                                    style={{
                                        left: `${((25 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    25
                                </span>
                                <span
                                    className="absolute"
                                    style={{
                                        left: `${((30 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    30
                                </span>
                                <span
                                    className="absolute"
                                    style={{
                                        left: `${((35 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    35
                                </span>
                                <span
                                    className="absolute"
                                    style={{
                                        left: `${((40 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    40
                                </span>
                            </>
                        ) : (
                            <>
                                <span
                                    className="absolute"
                                    style={{
                                        left: `${((23 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    23
                                </span>
                                <span
                                    className="absolute"
                                    style={{
                                        left: `${((25 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    25
                                </span>
                                <span
                                    className="absolute"
                                    style={{
                                        left: `${((30 - MIN_BMI) / TOTAL_SCOPE) * 100}%`,
                                        transform: "translateX(-50%)",
                                    }}
                                >
                                    30
                                </span>
                            </>
                        )}
                        <span className="absolute right-0">45</span>
                    </div>
                </ToolPanel>

                <ToolPanel tone="subtle" padding="lg">
                    <ToolLabel className="mb-2">
                        {standard === "global" ? "Phân loại WHO Toàn cầu" : "Phân loại WHO Châu Á"}
                    </ToolLabel>
                    <div className="space-y-1">
                        {categories.map((cat) => (
                            <div
                                key={cat.label}
                                className="flex items-center justify-between border-b border-border/50 py-1 text-sm last:border-0"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={cn("size-2 rounded-full", cat.color)} />
                                    <span className="text-muted-foreground">{cat.label}</span>
                                </div>
                                <span className="font-mono text-xs">{cat.range}</span>
                            </div>
                        ))}
                    </div>
                </ToolPanel>
            </div>

            <div className="flex flex-col gap-6">
                {result ? (
                    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-xl">
                        <Activity className="absolute -bottom-10 -right-10 size-48 rotate-12 text-muted-foreground/5" />

                        <p className="mb-2 text-sm font-semibold text-muted-foreground">Chỉ số BMI của bạn</p>
                        <h2
                            id="bmi-value"
                            className={cn(
                                "mb-4 text-5xl font-black tracking-tighter sm:text-7xl",
                                result.color,
                            )}
                        >
                            {result.bmi}
                        </h2>

                        <div
                            className={cn(
                                "mb-6 flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg",
                                result.color.replace("text-", "bg-"),
                            )}
                        >
                            <Heart className="size-4 animate-pulse fill-white" />
                            {result.label}
                        </div>

                        <div className="relative z-10 w-full rounded-2xl bg-muted/30 p-6 text-center backdrop-blur-sm">
                            <p className="text-sm font-medium italic leading-relaxed text-foreground">
                                &quot;{result.advice}&quot;
                            </p>
                        </div>

                        <div className="mt-8 flex gap-4">
                            <Button
                                id="btn-reset"
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400"
                                onClick={() => {
                                    setWeight("70");
                                    setHeight("170");
                                }}
                            >
                                <RefreshCcw className="mr-2 size-3.5" />
                                Làm mới
                            </Button>
                        </div>
                    </div>
                ) : (
                    <ToolPanel
                        tone="dashed"
                        padding="lg"
                        radius="lg"
                        className="h-full items-center justify-center"
                        bodyClassName="flex flex-col items-center justify-center p-12 text-center text-muted-foreground"
                    >
                        <Info className="mb-4 size-12 opacity-20" />
                        <p className="font-medium">
                            Vui lòng nhập cân nặng và chiều cao
                            <br />
                            để xem kết quả phân tích.
                        </p>
                    </ToolPanel>
                )}

                <ToolInfoBox
                    tone="accent"
                    icon={<Info className="size-5 text-blue-600 dark:text-blue-400" />}
                    title={<span className="text-blue-600 dark:text-blue-400">Kiến thức cơ bản</span>}
                >
                    <p className="leading-relaxed">
                        BMI (Body Mass Index) là chỉ số được dùng để xác định một người ở mức cân nặng bình thường, suy
                        dinh dưỡng hay béo phì. Lưu ý BMI <strong>không áp dụng</strong> cho bà bầu, vận động viên thể
                        hình hoặc người già có khối lượng cơ thấp.
                    </p>
                    <a href="#" className="mt-3 flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                        Tìm hiểu thêm về sức khỏe <ArrowRight className="size-3" />
                    </a>
                </ToolInfoBox>
            </div>
        </div>
    );
}
