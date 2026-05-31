"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
    Percent,
    TrendingUp,
    TrendingDown,
    Tag,
    PieChart,
    ArrowRight,
    Divide,
    type LucideIcon,
} from "lucide-react";
import { ToolPanel } from "@/components/shared/ToolPanel";
import {
    calculateValueFromPercent,
    calculatePercentOf,
    calculatePercentChange,
    addPercent,
    subtractPercent,
} from "@/lib/math/percentage";
import { cn } from "@/lib/utils";

function PercentageCard({
    title,
    icon: Icon,
    color,
    children,
    result,
    suffix = "",
    id,
}: {
    title: string;
    icon: LucideIcon;
    color: string;
    children: React.ReactNode;
    result: string | number | null;
    suffix?: string;
    id?: string;
}) {
    const formattedResult =
        typeof result === "number"
            ? (Math.round(result * 1000) / 1000).toString() + suffix
            : result + suffix;

    return (
        <ToolPanel
            id={id}
            radius="lg"
            padding="lg"
            className="group transition-all hover:border-blue-500/30 hover:shadow-md"
        >
            <div className="mb-6 flex items-center gap-3">
                <div className={cn("rounded-2xl p-2.5", color)}>
                    <Icon className="size-5 text-white" />
                </div>
                <h3 className="text-sm font-bold tracking-tight">{title}</h3>
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
        </ToolPanel>
    );
}

const inputClass =
    "w-24 rounded-lg border border-border bg-background px-3 py-1.5 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500/50 transition-all";

export function PercentageCalculatorClient() {
    const t = useTranslations("toolUI.percentage-calculator");

    const [s1P, setS1P] = useState<string>("20");
    const [s1T, setS1T] = useState<string>("100");

    const [s2V, setS2V] = useState<string>("20");
    const [s2T, setS2T] = useState<string>("100");

    const [s3S, setS3S] = useState<string>("100");
    const [s3E, setS3E] = useState<string>("120");

    const [s4V, setS4V] = useState<string>("100");
    const [s4P, setS4P] = useState<string>("10");

    const [s5V, setS5V] = useState<string>("100");
    const [s5P, setS5P] = useState<string>("10");

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <PercentageCard
                id="scenario-1"
                title={t("card1Title")}
                icon={Percent}
                color="bg-blue-500"
                result={calculateValueFromPercent(parseFloat(s1P) || 0, parseFloat(s1T) || 0)}
            >
                <span>{t("card1Calc")}</span>
                <input id="s1-p" className={inputClass} value={s1P} onChange={(e) => setS1P(e.target.value)} />
                <span>{t("card1Of")}</span>
                <input id="s1-t" className={inputClass} value={s1T} onChange={(e) => setS1T(e.target.value)} />
            </PercentageCard>

            <PercentageCard
                id="scenario-2"
                title={t("card2Title")}
                icon={PieChart}
                color="bg-indigo-500"
                result={calculatePercentOf(parseFloat(s2V) || 0, parseFloat(s2T) || 0)}
                suffix="%"
            >
                <span>{t("card2Is")}</span>
                <input id="s2-v" className={inputClass} value={s2V} onChange={(e) => setS2V(e.target.value)} />
                <span>{t("card2Of")}</span>
                <input id="s2-t" className={inputClass} value={s2T} onChange={(e) => setS2T(e.target.value)} />
            </PercentageCard>

            <PercentageCard
                id="scenario-3"
                title={t("card3Title")}
                icon={TrendingUp}
                color="bg-emerald-500"
                result={calculatePercentChange(parseFloat(s3S) || 0, parseFloat(s3E) || 0)}
                suffix="%"
            >
                <span>{t("card3From")}</span>
                <input id="s3-s" className={inputClass} value={s3S} onChange={(e) => setS3S(e.target.value)} />
                <span>{t("card3To")}</span>
                <input id="s3-e" className={inputClass} value={s3E} onChange={(e) => setS3E(e.target.value)} />
            </PercentageCard>

            <PercentageCard
                id="scenario-4"
                title={t("card4Title")}
                icon={Tag}
                color="bg-violet-500"
                result={addPercent(parseFloat(s4V) || 0, parseFloat(s4P) || 0)}
            >
                <span>{t("card4Add")}</span>
                <input id="s4-v" className={inputClass} value={s4V} onChange={(e) => setS4V(e.target.value)} />
                <span>{t("card4Plus")}</span>
                <input id="s4-p" className={inputClass} value={s4P} onChange={(e) => setS4P(e.target.value)} />
                <span>%</span>
            </PercentageCard>

            <PercentageCard
                id="scenario-5"
                title={t("card5Title")}
                icon={TrendingDown}
                color="bg-rose-500"
                result={subtractPercent(parseFloat(s5V) || 0, parseFloat(s5P) || 0)}
            >
                <span>{t("card5Sub")}</span>
                <input id="s5-v" className={inputClass} value={s5V} onChange={(e) => setS5V(e.target.value)} />
                <span>{t("card5Minus")}</span>
                <input id="s5-p" className={inputClass} value={s5P} onChange={(e) => setS5P(e.target.value)} />
                <span>%</span>
            </PercentageCard>

            <ToolPanel tone="dashed" radius="lg" padding="lg" className="justify-center">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 font-bold text-muted-foreground">
                        <Divide className="size-5" />
                        <span>{t("noteTitle")}</span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {t("noteBody")}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-lg border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase">
                            {t("taxVat")}
                        </span>
                        <span className="rounded-lg border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase">
                            {t("discount")}
                        </span>
                        <span className="rounded-lg border border-border bg-background px-3 py-1 text-[10px] font-bold uppercase">
                            {t("growth")}
                        </span>
                    </div>
                </div>
            </ToolPanel>
        </div>
    );
}
