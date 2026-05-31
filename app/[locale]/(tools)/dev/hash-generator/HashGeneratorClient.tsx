"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Trash2, Zap, ShieldCheck, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { ToolInfoBox } from "@/components/shared/ToolInfoBox";
import { ToolToggle } from "@/components/shared/ToolToggle";
import { generateHash, type HashAlgorithm } from "@/lib/math/hash";
import { cn } from "@/lib/utils";

const ALGORITHMS: { id: HashAlgorithm; label: string }[] = [
    { id: "md5", label: "MD5" },
    { id: "sha1", label: "SHA-1" },
    { id: "sha256", label: "SHA-256" },
    { id: "sha512", label: "SHA-512" },
];

export function HashGeneratorClient() {
    const t = useTranslations("toolUI.hash-generator");
    const tc = useTranslations("toolCommon");
    const [input, setInput] = useState("");
    const [isUpper, setIsUpper] = useState(false);
    const [hashes, setHashes] = useState<Record<string, string>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const updateHashes = useCallback((text: string) => {
        if (!text) {
            setHashes({});
            return;
        }

        const results: Record<string, string> = {};
        ALGORITHMS.forEach((alg) => {
            try {
                results[alg.id] = generateHash(text, alg.id);
            } catch {
                results[alg.id] = "Error";
            }
        });
        setHashes(results);
    }, []);

    useEffect(() => {
        updateHashes(input);
    }, [input, updateHashes]);

    const handleCopy = async (id: string, value: string) => {
        const textToCopy = isUpper ? value.toUpperCase() : value.toLowerCase();
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleClear = () => {
        setInput("");
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <ToolLabel>{t("inputLabel")}</ToolLabel>
                    <div className="flex items-center gap-4">
                        <ToolToggle
                            id="toggle-upper"
                            checked={isUpper}
                            onChange={setIsUpper}
                            label={
                                <>
                                    <Type className="size-3.5" />
                                    {t("uppercase")}
                                </>
                            }
                        />
                        <Button
                            id="btn-clear"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-3.5" />
                            {tc("clear")}
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <textarea
                        id="input-hash"
                        className="h-32 w-full resize-none rounded-2xl border border-border bg-card p-4 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder={t("placeholder")}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="pointer-events-none absolute bottom-4 right-4 text-xs text-muted-foreground">
                        {tc("charCount", { count: input.length })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <ToolLabel icon={<ShieldCheck className="size-4" />}>{t("resultsLabel")}</ToolLabel>

                <div className="grid grid-cols-1 gap-3">
                    {ALGORITHMS.map((alg) => {
                        const value = hashes[alg.id] || "";
                        const displayValue = isUpper ? value.toUpperCase() : value.toLowerCase();
                        const isCopied = copiedId === alg.id;

                        return (
                            <ToolPanel
                                key={alg.id}
                                id={`hash-${alg.id}`}
                                padding="md"
                                className="group transition-all hover:border-blue-500/30 hover:shadow-md dark:hover:bg-blue-500/5"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {alg.label}
                                            </span>
                                            <span className="hidden text-[10px] text-muted-foreground sm:inline-block">
                                                {t(`${alg.id}Desc`)}
                                            </span>
                                        </div>
                                        <Button
                                            id={`btn-copy-${alg.id}`}
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopy(alg.id, value)}
                                            disabled={!value}
                                            className={cn(
                                                "h-8 gap-2 rounded-lg transition-all",
                                                isCopied
                                                    ? "border-green-500 bg-green-500/5 text-green-500"
                                                    : "hover:bg-accent",
                                            )}
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check className="size-3.5" />
                                                    <span className="text-xs">{tc("copied")}</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    <span className="text-xs">{tc("copy")}</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p
                                        className={cn(
                                            "break-all font-mono text-sm leading-relaxed",
                                            value ? "text-foreground" : "italic text-muted-foreground/30",
                                        )}
                                    >
                                        {displayValue || t("emptyHash", { alg: alg.label })}
                                    </p>
                                </div>
                            </ToolPanel>
                        );
                    })}
                </div>
            </div>

            <ToolInfoBox
                tone="accent"
                icon={<Zap className="size-5 text-blue-500" />}
                title={t("tipTitle")}
            >
                <ul className="list-inside list-disc space-y-1">
                    <li>{t("tip1")}</li>
                    <li>{t("tip2")}</li>
                    <li>{t("tip3")}</li>
                </ul>
            </ToolInfoBox>
        </div>
    );
}
