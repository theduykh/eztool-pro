"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Copy,
    Check,
    RefreshCw,
    Type,
    Pilcrow,
    CaseSensitive,
    Settings2,
    Zap,
    Hash,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { ToolInfoBox } from "@/components/shared/ToolInfoBox";
import { ToolToggle } from "@/components/shared/ToolToggle";
import { generateLorem, generateLoremByChars, type LoremType } from "@/lib/string/lorem";
import { cn } from "@/lib/utils";

export function LoremIpsumClient() {
    const t = useTranslations("toolUI.lorem-ipsum");
    const [type, setType] = useState<LoremType | "chars">("paragraphs");
    const [count, setCount] = useState(3);
    const [startWithLorem, setStartWithLorem] = useState(true);
    const [result, setResult] = useState("");
    const [copied, setCopied] = useState(false);

    const TYPES: { id: LoremType | "chars"; label: string; icon: LucideIcon }[] = [
        { id: "paragraphs", label: t("types.paragraphs"), icon: Pilcrow },
        { id: "words", label: t("types.words"), icon: Type },
        { id: "sentences", label: t("types.sentences"), icon: CaseSensitive },
        { id: "chars", label: t("types.chars"), icon: Hash },
    ];

    const handleGenerate = useCallback(() => {
        let generated = "";
        if (type === "chars") {
            generated = generateLoremByChars(count);
        } else {
            generated = generateLorem({ type: type as LoremType, count, startWithLorem });
        }
        setResult(generated);
    }, [type, count, startWithLorem]);

    useEffect(() => {
        handleGenerate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
            <ToolPanel padding="lg">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="lg:col-span-2">
                        <ToolLabel className="mb-3">{t("textType")}</ToolLabel>
                        <div className="flex flex-wrap gap-2">
                            {TYPES.map((typeOpt) => {
                                const Icon = typeOpt.icon;
                                return (
                                    <button
                                        id={`btn-type-${typeOpt.id}`}
                                        key={typeOpt.id}
                                        onClick={() => setType(typeOpt.id)}
                                        className={cn(
                                            "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                                            type === typeOpt.id
                                                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                                                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                                        )}
                                    >
                                        <Icon className="size-4" />
                                        {typeOpt.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <ToolLabel className="mb-3">{t("count")}</ToolLabel>
                        <input
                            id="input-count"
                            type="number"
                            min={1}
                            max={type === "chars" ? 5000 : 100}
                            value={count}
                            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 0))}
                            className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>

                    <div className="flex items-end">
                        <Button
                            id="btn-generate"
                            onClick={handleGenerate}
                            className="w-full gap-2 rounded-xl bg-blue-600 py-6 text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-700 active:scale-95"
                        >
                            <RefreshCw className="size-4" />
                            {t("btnGenerate")}
                        </Button>
                    </div>
                </div>
            </ToolPanel>

            <div className="flex items-center gap-6 px-2">
                <ToolToggle
                    id="toggle-start-lorem"
                    checked={startWithLorem}
                    onChange={setStartWithLorem}
                    label={<span>{t("toggleStartLorem")}</span>}
                />
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                    <ToolLabel icon={<Zap className="size-3.5 text-yellow-500" />}>
                        {t("resultLabel", { count: result.length })}
                    </ToolLabel>
                    <Button
                        id="btn-copy"
                        size="sm"
                        variant="secondary"
                        onClick={handleCopy}
                        disabled={!result}
                        className={cn(
                            "h-8 gap-2 rounded-lg transition-all",
                            copied && "bg-green-500 text-white hover:bg-green-600",
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="size-3.5" />
                                <span>{t("btnCopied")}</span>
                            </>
                        ) : (
                            <>
                                <Copy className="size-3.5" />
                                <span>{t("btnCopy")}</span>
                            </>
                        )}
                    </Button>
                </div>
                <textarea
                    id="output-lorem"
                    className="h-80 w-full resize-y rounded-2xl border border-border bg-card p-6 font-sans text-base leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 md:h-96"
                    value={result}
                    readOnly
                />
            </div>

            <ToolInfoBox
                tone="neutral"
                icon={<Settings2 className="size-5 text-blue-500" />}
                title={t("tipsTitle")}
            >
                <ul className="list-inside list-disc space-y-1">
                    <li>{t("tipParagraphs")}</li>
                    <li>{t("tipWords")}</li>
                    <li>{t("tipChars")}</li>
                </ul>
            </ToolInfoBox>
        </div>
    );
}
