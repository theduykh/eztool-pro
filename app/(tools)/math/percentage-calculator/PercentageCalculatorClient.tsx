"use client";

import { useState } from "react";
import { 
    Percent, 
    TrendingUp, 
    TrendingDown, 
    Tag, 
    PieChart,
    ArrowRight,
    Divide
} from "lucide-react";
import { 
    calculateValueFromPercent, 
    calculatePercentOf, 
    calculatePercentChange, 
    addPercent, 
    subtractPercent 
} from "@/lib/math/percentage";
import { cn } from "@/lib/utils";

/**
 * Reusable Card for each percentage scenario
 */
function PercentageCard({ 
    title, 
    icon: Icon, 
    color, 
    children, 
    result,
    suffix = ""
}: { 
    title: string; 
    icon: any; 
    color: string; 
    children: React.ReactNode; 
    result: string | number | null; 
    suffix?: string;
}) {
    const formattedResult = typeof result === 'number' 
        ? (Math.round(result * 1000) / 1000).toString() + suffix 
        : result + suffix;

    return (
        <div className="group rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-500/30 hover:shadow-md">
            <div className="flex items-center gap-3 mb-6">
                <div className={cn("rounded-2xl p-2.5", color)}>
                    <Icon className="size-5 text-white" />
                </div>
                <h3 className="font-bold text-sm tracking-tight">{title}</h3>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-lg font-medium">
                {children}
                <div className="flex items-center gap-3">
                    <ArrowRight className="size-5 text-muted-foreground/30" />
                    <div className="rounded-xl bg-muted/50 px-4 py-2 font-black text-blue-600 dark:text-blue-400">
                        {result !== null ? formattedResult : "?"}
                    </div>
                </div>
            </div>
        </div>
    );
}

const inputClass = "w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all";

export function PercentageCalculatorClient() {
    // States for scenario 1
    const [s1P, setS1P] = useState<string>("20");
    const [s1T, setS1T] = useState<string>("100");
    
    // States for scenario 2
    const [s2V, setS2V] = useState<string>("20");
    const [s2T, setS2T] = useState<string>("100");

    // States for scenario 3
    const [s3S, setS3S] = useState<string>("100");
    const [s3E, setS3E] = useState<string>("120");

    // States for scenario 4 (Add)
    const [s4V, setS4V] = useState<string>("100");
    const [s4P, setS4P] = useState<string>("10");

    // States for scenario 5 (Sub)
    const [s5V, setS5V] = useState<string>("100");
    const [s5P, setS5P] = useState<string>("10");

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* Scenario 1: What is P% of T? */}
            <PercentageCard 
                title="Tính giá trị từ phần trăm" 
                icon={Percent} 
                color="bg-blue-500"
                result={calculateValueFromPercent(parseFloat(s1P) || 0, parseFloat(s1T) || 0)}
            >
                <span>Tính</span>
                <input className={inputClass} value={s1P} onChange={e => setS1P(e.target.value)} />
                <span>% của số</span>
                <input className={inputClass} value={s1T} onChange={e => setS1T(e.target.value)} />
            </PercentageCard>

            {/* Scenario 2: V is what % of T? */}
            <PercentageCard 
                title="Tính tỷ lệ phần trăm giữa 2 số" 
                icon={PieChart} 
                color="bg-indigo-500"
                result={calculatePercentOf(parseFloat(s2V) || 0, parseFloat(s2T) || 0)}
                suffix="%"
            >
                <span>Số</span>
                <input className={inputClass} value={s2V} onChange={e => setS2V(e.target.value)} />
                <span>là bao nhiêu % của</span>
                <input className={inputClass} value={s2T} onChange={e => setS2T(e.target.value)} />
            </PercentageCard>

            {/* Scenario 3: Increase/Decrease % */}
            <PercentageCard 
                title="Tính % tăng trưởng (Tăng/Giảm)" 
                icon={TrendingUp} 
                color="bg-emerald-500"
                result={calculatePercentChange(parseFloat(s3S) || 0, parseFloat(s3E) || 0)}
                suffix="%"
            >
                <span>Từ số</span>
                <input className={inputClass} value={s3S} onChange={e => setS3S(e.target.value)} />
                <span>đến số</span>
                <input className={inputClass} value={s3E} onChange={e => setS3E(e.target.value)} />
            </PercentageCard>

            {/* Scenario 4: Add % */}
            <PercentageCard 
                title="Tính thêm phần trăm (Cộng thêm)" 
                icon={Tag} 
                color="bg-violet-500"
                result={addPercent(parseFloat(s4V) || 0, parseFloat(s4P) || 0)}
            >
                <span>Số</span>
                <input className={inputClass} value={s4V} onChange={e => setS4V(e.target.value)} />
                <span>cộng thêm</span>
                <input className={inputClass} value={s4P} onChange={e => setS4P(e.target.value)} />
                <span>%</span>
            </PercentageCard>

            {/* Scenario 5: Sub % */}
            <PercentageCard 
                title="Tính giảm giá / Chiết khấu (Trừ bớt)" 
                icon={TrendingDown} 
                color="bg-rose-500"
                result={subtractPercent(parseFloat(s5V) || 0, parseFloat(s5P) || 0)}
            >
                <span>Số</span>
                <input className={inputClass} value={s5V} onChange={e => setS5V(e.target.value)} />
                <span>giảm đi</span>
                <input className={inputClass} value={s5P} onChange={e => setS5P(e.target.value)} />
                <span>%</span>
            </PercentageCard>

            {/* Tip box */}
            <div className="rounded-3xl border border-dashed border-border bg-muted/20 p-8 flex flex-col justify-center gap-4 lg:col-span-1">
                <div className="flex items-center gap-3 font-bold text-muted-foreground">
                    <Divide className="size-5" />
                    <span>Lưu ý về phép tính</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    Mọi phép tính được thực hiện ngay lập tức (real-time). Các kết quả được làm tròn tới 3 chữ số thập phân để đảm bảo độ chính xác trong tài chính và khoa học.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                    <span className="rounded-lg bg-background px-3 py-1 text-[10px] font-bold uppercase border border-border">Thuế VAT</span>
                    <span className="rounded-lg bg-background px-3 py-1 text-[10px] font-bold uppercase border border-border">Giảm giá</span>
                    <span className="rounded-lg bg-background px-3 py-1 text-[10px] font-bold uppercase border border-border">Tăng trưởng</span>
                </div>
            </div>
        </div>
    );
}
