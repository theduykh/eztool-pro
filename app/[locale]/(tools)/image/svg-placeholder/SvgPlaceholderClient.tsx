"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    Maximize,
    Type,
    Palette,
    Download,
    Copy,
    Code,
    Check,
    RotateCcw,
    FileImage,
    Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    generateSVGPlaceholder,
    svgToDataUri,
    type PlaceholderOptions,
} from "@/lib/image/placeholder";
import { cn } from "@/lib/utils";

const DEFAULTS: PlaceholderOptions = {
    width: 300,
    height: 200,
    text: "",
    bgColor: "#e2e8f0",
    textColor: "#64748b",
    fontSize: 20,
};

export function SvgPlaceholderClient() {
    const t = useTranslations("toolUI.svg-placeholder");
    const tc = useTranslations("toolCommon");

    const [options, setOptions] = useState<PlaceholderOptions>(DEFAULTS);
    const [copied, setCopied] = useState<string | null>(null);

    const svgCode = useMemo(() => generateSVGPlaceholder(options), [options]);
    const dataUri = useMemo(() => svgToDataUri(svgCode), [svgCode]);

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleDownload = async (format: "svg" | "png" | "jpeg") => {
        if (format === "svg") {
            const link = document.createElement("a");
            link.href = dataUri;
            link.download = `placeholder-${options.width}x${options.height}.svg`;
            link.click();
            return;
        }

        const canvas = document.createElement("canvas");
        canvas.width = options.width;
        canvas.height = options.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            if (format === "jpeg") {
                ctx.fillStyle = options.bgColor || "#ffffff";
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            ctx.drawImage(img, 0, 0);

            const link = document.createElement("a");
            link.download = `placeholder-${options.width}x${options.height}.${format === "jpeg" ? "jpg" : format}`;
            link.href = canvas.toDataURL(`image/${format}`, 0.95);
            link.click();
        };
        img.src = dataUri;
    };

    const reset = () => setOptions(DEFAULTS);

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
            <div className="flex flex-col gap-6">
                <ToolPanel radius="lg" padding="lg" className="md:p-8">
                    <div className="mb-8 flex items-center justify-between">
                        <ToolLabel>{t("customizeImage")}</ToolLabel>
                        <Button
                            id="btn-reset"
                            variant="ghost"
                            size="sm"
                            onClick={reset}
                            className="h-8 gap-2 text-xs"
                        >
                            <RotateCcw className="size-3" />
                            {t("reset")}
                        </Button>
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <ToolLabel htmlFor="input-width" icon={<Maximize className="size-3.5" />}>
                                    {t("widthPx")}
                                </ToolLabel>
                                <input
                                    id="input-width"
                                    type="number"
                                    value={options.width}
                                    onChange={(e) =>
                                        setOptions((prev) => ({
                                            ...prev,
                                            width: parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-border bg-muted/50 p-3 font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                            <div className="space-y-2">
                                <ToolLabel
                                    htmlFor="input-height"
                                    icon={<Maximize className="size-3.5 rotate-90" />}
                                >
                                    {t("heightPx")}
                                </ToolLabel>
                                <input
                                    id="input-height"
                                    type="number"
                                    value={options.height}
                                    onChange={(e) =>
                                        setOptions((prev) => ({
                                            ...prev,
                                            height: parseInt(e.target.value) || 0,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-border bg-muted/50 p-3 font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <ToolLabel htmlFor="input-text" icon={<Type className="size-3.5" />}>
                                {t("displayText")}
                            </ToolLabel>
                            <input
                                id="input-text"
                                type="text"
                                value={options.text}
                                placeholder={`${options.width}x${options.height}`}
                                onChange={(e) =>
                                    setOptions((prev) => ({ ...prev, text: e.target.value }))
                                }
                                className="w-full rounded-xl border border-border bg-muted/50 p-3 font-semibold outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <ToolLabel icon={<Palette className="size-3.5 text-blue-500" />}>
                                    {t("bgColor")}
                                </ToolLabel>
                                <div className="flex gap-2">
                                    <input
                                        id="input-bg-color-picker"
                                        type="color"
                                        value={options.bgColor}
                                        onChange={(e) =>
                                            setOptions((prev) => ({ ...prev, bgColor: e.target.value }))
                                        }
                                        className="size-11 cursor-pointer rounded-lg border-none bg-transparent"
                                    />
                                    <input
                                        id="input-bg-color"
                                        type="text"
                                        value={options.bgColor}
                                        onChange={(e) =>
                                            setOptions((prev) => ({ ...prev, bgColor: e.target.value }))
                                        }
                                        className="w-full rounded-xl border border-border bg-muted/50 px-3 font-mono text-xs font-bold uppercase outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <ToolLabel icon={<Palette className="size-3.5 text-slate-500" />}>
                                    {t("textColor")}
                                </ToolLabel>
                                <div className="flex gap-2">
                                    <input
                                        id="input-text-color-picker"
                                        type="color"
                                        value={options.textColor}
                                        onChange={(e) =>
                                            setOptions((prev) => ({ ...prev, textColor: e.target.value }))
                                        }
                                        className="size-11 cursor-pointer rounded-lg border-none bg-transparent"
                                    />
                                    <input
                                        id="input-text-color"
                                        type="text"
                                        value={options.textColor}
                                        onChange={(e) =>
                                            setOptions((prev) => ({ ...prev, textColor: e.target.value }))
                                        }
                                        className="w-full rounded-xl border border-border bg-muted/50 px-3 font-mono text-xs font-bold uppercase outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </ToolPanel>
            </div>

            <div className="flex flex-col gap-6">
                <ToolPanel radius="lg" padding="sm" className="group relative overflow-hidden shadow-2xl">
                    <div
                        id="preview-container"
                        className="flex min-h-[360px] items-center justify-center overflow-auto rounded-[2rem] bg-muted/30 p-8"
                    >
                        <div
                            dangerouslySetInnerHTML={{ __html: svgCode }}
                            className="max-w-full shadow-2xl"
                        />
                    </div>
                </ToolPanel>

                <ToolPanel radius="lg" padding="lg" className="md:p-8">
                    <ToolLabel className="mb-6" icon={<Download className="size-4 text-blue-500" />}>
                        {t("downloadImage")}
                    </ToolLabel>
                    <div className="grid grid-cols-3 gap-3">
                        <Button
                            id="btn-download-svg"
                            variant="outline"
                            className="group h-24 flex-col gap-2 rounded-2xl border-2 transition-all hover:border-blue-500 hover:bg-blue-500/5"
                            onClick={() => handleDownload("svg")}
                        >
                            <Code className="size-6 text-muted-foreground group-hover:text-blue-500" />
                            <span className="font-bold">.SVG</span>
                        </Button>
                        <Button
                            id="btn-download-png"
                            variant="outline"
                            className="group h-24 flex-col gap-2 rounded-2xl border-2 transition-all hover:border-blue-500 hover:bg-blue-500/5"
                            onClick={() => handleDownload("png")}
                        >
                            <FileImage className="size-6 text-muted-foreground group-hover:text-blue-500" />
                            <span className="font-bold">.PNG</span>
                        </Button>
                        <Button
                            id="btn-download-jpeg"
                            variant="outline"
                            className="group h-24 flex-col gap-2 rounded-2xl border-2 transition-all hover:border-blue-500 hover:bg-blue-500/5"
                            onClick={() => handleDownload("jpeg")}
                        >
                            <Layers className="size-6 text-muted-foreground group-hover:text-blue-500" />
                            <span className="font-bold">.JPG</span>
                        </Button>
                    </div>
                </ToolPanel>

                <div className="space-y-4">
                    <ToolLabel className="px-4">{t("exportSourceCode")}</ToolLabel>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            id="btn-copy-code"
                            variant="outline"
                            className={cn(
                                "h-14 gap-3 rounded-2xl text-sm font-bold",
                                copied === "code" && "border-green-500 text-green-500",
                            )}
                            onClick={() => handleCopy(svgCode, "code")}
                        >
                            {copied === "code" ? <Check className="size-5" /> : <Code className="size-5" />}
                            SVG Code
                        </Button>
                        <Button
                            id="btn-copy-uri"
                            variant="outline"
                            className={cn(
                                "h-14 gap-3 rounded-2xl text-sm font-bold",
                                copied === "uri" && "border-green-500 text-green-500",
                            )}
                            onClick={() => handleCopy(dataUri, "uri")}
                        >
                            {copied === "uri" ? <Check className="size-5" /> : <Copy className="size-5" />}
                            Data URI
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
