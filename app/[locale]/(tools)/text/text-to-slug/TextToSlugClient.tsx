"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Copy, Check, Trash2, Link2, Zap, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { ToolInfoBox } from "@/components/shared/ToolInfoBox";
import { toSlug } from "@/lib/string/slug";
import { cn } from "@/lib/utils";

export function TextToSlugClient() {
    const t = useTranslations("toolUI.text-to-slug");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [copied, setCopied] = useState(false);

    const handleConvert = useCallback((text: string) => {
        if (!text) {
            setOutput("");
            return;
        }
        setOutput(toSlug(text));
    }, []);

    useEffect(() => {
        handleConvert(input);
    }, [input, handleConvert]);

    const handleCopy = async () => {
        if (!output) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleClear = () => {
        setInput("");
        setOutput("");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <ToolLabel>{t("inputLabel")}</ToolLabel>
                    <Button
                        id="btn-clear"
                        variant="ghost"
                        size="sm"
                        onClick={handleClear}
                        disabled={!input}
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                        <Trash2 className="size-3.5" />
                        {t("btnClear")}
                    </Button>
                </div>
                <input
                    id="input-slug"
                    type="text"
                    className="w-full rounded-2xl border border-border bg-card p-4 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder={t("placeholderInput")}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
            </div>

            <div className="flex flex-col gap-3">
                <ToolLabel>{t("outputLabel")}</ToolLabel>
                <div className="group relative flex items-center gap-2 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-1 pl-4">
                    <div className="scrollbar-hide flex-1 overflow-x-auto whitespace-nowrap py-3 pr-2">
                        <span
                            id="output-slug"
                            className={cn(
                                "font-mono text-sm tracking-tight",
                                output
                                    ? "font-semibold text-blue-600 dark:text-blue-400"
                                    : "italic text-muted-foreground",
                            )}
                        >
                            {output || t("placeholderOutput")}
                        </span>
                    </div>

                    <Button
                        id="btn-copy"
                        onClick={handleCopy}
                        disabled={!output}
                        className={cn(
                            "h-full rounded-xl px-6 transition-all",
                            copied ? "bg-green-500 hover:bg-green-600" : "bg-blue-600 hover:bg-blue-700",
                        )}
                    >
                        {copied ? (
                            <>
                                <Check className="mr-2 size-4" />
                                <span>{t("btnCopied")}</span>
                            </>
                        ) : (
                            <>
                                <Copy className="mr-2 size-4" />
                                <span>{t("btnCopy")}</span>
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {output && (
                <div className="flex flex-wrap gap-4 px-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Zap className="size-3.5 text-yellow-500" />
                        <span>{t("removedChars", { count: input.length - output.length })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Link2 className="size-3.5 text-blue-500" />
                        <span>{t("lengthChars", { count: output.length })}</span>
                    </div>
                </div>
            )}

            <ToolInfoBox
                tone="neutral"
                icon={<Info className="size-5 text-blue-500" />}
                title={t("whatIsSlugTitle")}
            >
                {t("whatIsSlugBody")}
            </ToolInfoBox>
        </div>
    );
}
