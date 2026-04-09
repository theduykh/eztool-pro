"use client";

import { useState, useMemo } from "react";
import { 
    Activity, 
    Weight, 
    Ruler, 
    Heart, 
    Info,
    ArrowRight,
    RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateBMI, getBMICategories, type BMIResult, type BMIStandard } from "@/lib/math/bmi";
import { cn } from "@/lib/utils";

export function BMICalculatorClient() {
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
            {/* Input Panel */}
            <div className="flex flex-col gap-6">
                {/* Standard Toggle */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Chọn tiêu chuẩn</p>
                    <div className="flex gap-2">
                        <Button
                            variant={standard === "global" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStandard("global")}
                            className="flex-1 rounded-xl text-xs"
                        >
                            Toàn cầu (WHO)
                        </Button>
                        <Button
                            variant={standard === "asian" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setStandard("asian")}
                            className="flex-1 rounded-xl text-xs"
                        >
                            Châu Á (IDI & WPRO)
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Weight Input */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <Weight className="size-3.5" />
                            Cân nặng (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card p-4 text-2xl font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="70"
                        />
                    </div>

                    {/* Height Input */}
                    <div className="flex flex-col gap-2">
                        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <Ruler className="size-3.5" />
                            Chiều cao (cm)
                        </label>
                        <input
                            type="number"
                            step="1"
                            value={height}
                            onChange={(e) => setHeight(e.target.value)}
                            className="w-full rounded-2xl border border-border bg-card p-4 text-2xl font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            placeholder="170"
                        />
                    </div>
                </div>

                {/* BMI Gauge / Scale visual */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <p className="mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">Thang đo chỉ số BMI</p>
                    <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted flex">
                        {categories.map((cat) => (
                            <div 
                                key={cat.label} 
                                className={cn("h-full transition-all duration-500", cat.color)} 
                                style={{ width: `${((cat.max - cat.min) / TOTAL_SCOPE) * 100}%` }}
                                title={`${cat.label} (${cat.range})`}
                            />
                        ))}
                        {/* Needle */}
                        {result && (
                            <div 
                                className="absolute top-0 h-full w-1 border-x border-white bg-black shadow-lg transition-all duration-500 ease-out dark:bg-white dark:border-black"
                                style={{ 
                                    left: `${Math.min(Math.max((result.bmi - MIN_BMI) / TOTAL_SCOPE * 100, 0), 100)}%` 
                                }}
                            />
                        )}
                    </div>
                    <div className="relative mt-2 h-4 w-full text-[10px] text-muted-foreground font-medium">
                        <span className="absolute left-0">15</span>
                        <span className="absolute" style={{ left: `${(18.5 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>18.5</span>
                        {standard === "global" ? (
                            <>
                                <span className="absolute" style={{ left: `${(25 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>25</span>
                                <span className="absolute" style={{ left: `${(30 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>30</span>
                                <span className="absolute" style={{ left: `${(35 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>35</span>
                                <span className="absolute" style={{ left: `${(40 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>40</span>
                            </>
                        ) : (
                            <>
                                <span className="absolute" style={{ left: `${(23 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>23</span>
                                <span className="absolute" style={{ left: `${(25 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>25</span>
                                <span className="absolute" style={{ left: `${(30 - MIN_BMI) / TOTAL_SCOPE * 100}%`, transform: 'translateX(-50%)' }}>30</span>
                            </>
                        )}
                        <span className="absolute right-0">45</span>
                    </div>
                </div>

                {/* Categories Table */}
                <div className="flex flex-col gap-2 rounded-2xl border border-border bg-card/30 p-6">
                    <p className="mb-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {standard === "global" ? "Phân loại WHO Toàn cầu" : "Phân loại WHO Châu Á"}
                    </p>
                    <div className="space-y-1">
                        {categories.map((cat) => (
                            <div key={cat.label} className="flex items-center justify-between py-1 text-sm border-b border-border/50 last:border-0">
                                <div className="flex items-center gap-2">
                                    <div className={cn("size-2 rounded-full", cat.color)} />
                                    <span className="text-muted-foreground">{cat.label}</span>
                                </div>
                                <span className="font-mono text-xs">{cat.range}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Display */}
            <div className="flex flex-col gap-6">
                {result ? (
                    <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-border bg-card p-8 shadow-xl relative overflow-hidden">
                        {/* Decorative background icon */}
                        <Activity className="absolute -bottom-10 -right-10 size-48 text-muted-foreground/5 rotate-12" />
                        
                        <p className="mb-2 text-sm font-semibold text-muted-foreground">Chỉ số BMI của bạn</p>
                        <h2 className={cn("text-7xl font-black tracking-tighter mb-4", result.color)}>
                            {result.bmi}
                        </h2>
                        
                        <div className={cn(
                            "mb-6 flex items-center gap-2 rounded-full px-6 py-2 text-sm font-bold uppercase tracking-wider text-white shadow-lg",
                            result.color.replace('text-', 'bg-')
                        )}>
                            <Heart className={cn("size-4 fill-white animate-pulse")} />
                            {result.label}
                        </div>

                        <div className="relative z-10 w-full rounded-2xl bg-muted/30 p-6 text-center backdrop-blur-sm">
                            <p className="text-sm leading-relaxed text-foreground font-medium italic">
                                "{result.advice}"
                            </p>
                        </div>

                        <div className="mt-8 flex gap-4">
                             <Button 
                                variant="outline" 
                                size="sm" 
                                className="rounded-xl border-blue-500/30 text-blue-600 dark:text-blue-400"
                                onClick={() => { setWeight("70"); setHeight("170"); }}
                            >
                                <RefreshCcw className="mr-2 size-3.5" />
                                Làm mới
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
                        <Info className="mb-4 size-12 opacity-20" />
                        <p className="font-medium">Vui lòng nhập cân nặng và chiều cao<br/>để xem kết quả phân tích.</p>
                    </div>
                )}

                {/* Info Card */}
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 flex flex-col gap-4">
                    <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                        <Info className="size-5" />
                        <span>Kiến thức cơ bản</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        BMI (Body Mass Index) là chỉ số được dùng để xác định một người ở mức cân nặng bình thường, suy dinh dưỡng hay béo phì. Lưu ý BMI <strong>không áp dụng</strong> cho bà bầu, vận động viên thể hình hoặc người già có khối lượng cơ thấp.
                    </p>
                    <a href="#" className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline">
                        Tìm hiểu thêm về sức khỏe <ArrowRight className="size-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
