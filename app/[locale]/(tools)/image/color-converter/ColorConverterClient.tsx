"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Palette, Copy, Check, Pipette, Hash, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    POPULAR_COLORS,
    type RGB,
    type HSL,
} from "@/lib/image/color";
import { cn } from "@/lib/utils";

export function ColorConverterClient() {
    const t = useTranslations("toolUI.color-converter");
    const tc = useTranslations("toolCommon");

    const [hex, setHex] = useState("#4169e1");
    const [rgb, setRgb] = useState<RGB>({ r: 65, g: 105, b: 225 });
    const [hsl, setHsl] = useState<HSL>({ h: 225, s: 73, l: 57 });
    const [copied, setCopied] = useState<string | null>(null);

    const updateFromHex = (value: string) => {
        setHex(value);
        if (/^#?([a-f\d]{3}|[a-f\d]{6})$/i.test(value)) {
            const res = hexToRgb(value);
            if (res) {
                setRgb(res);
                setHsl(rgbToHsl(res.r, res.g, res.b));
            }
        }
    };

    const updateFromRgb = (next: RGB) => {
        const clamped: RGB = {
            r: Math.min(255, Math.max(0, next.r)),
            g: Math.min(255, Math.max(0, next.g)),
            b: Math.min(255, Math.max(0, next.b)),
        };
        setRgb(clamped);
        setHex(rgbToHex(clamped.r, clamped.g, clamped.b));
        setHsl(rgbToHsl(clamped.r, clamped.g, clamped.b));
    };

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_2fr]">
            <div className="flex flex-col gap-6">
                <div
                    id="color-preview"
                    className="relative flex h-64 w-full flex-col items-center justify-center rounded-3xl shadow-2xl transition-all duration-300"
                    style={{ backgroundColor: hex }}
                >
                    <div className="absolute inset-x-0 bottom-0 top-1/2 rounded-b-3xl bg-gradient-to-t from-black/20 to-transparent" />

                    <label className="group relative cursor-pointer transition-transform active:scale-95">
                        <input
                            id="input-color-picker"
                            type="color"
                            className="absolute inset-0 size-full cursor-pointer opacity-0"
                            value={hex}
                            onChange={(e) => updateFromHex(e.target.value)}
                        />
                        <div className="flex size-20 items-center justify-center rounded-3xl border border-white/30 bg-white/20 text-white shadow-lg backdrop-blur-md transition-all group-hover:bg-white/30">
                            <Pipette className="size-10" />
                        </div>
                    </label>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/90 drop-shadow-md">
                        {t("selectColorManually")}
                    </p>
                </div>

                <ToolPanel radius="lg" padding="lg">
                    <ToolLabel className="mb-4" icon={<Palette className="size-4" />}>
                        {t("popularColors")}
                    </ToolLabel>
                    <div className="grid grid-cols-5 gap-3">
                        {POPULAR_COLORS.map((color) => (
                            <button
                                id={`color-swatch-${color.hex.replace("#", "")}`}
                                key={color.hex}
                                onClick={() => updateFromHex(color.hex)}
                                className={cn(
                                    "aspect-square size-full rounded-xl border border-white/10 shadow-sm transition-transform hover:scale-110",
                                    hex.toLowerCase() === color.hex.toLowerCase() &&
                                        "ring-2 ring-blue-500 ring-offset-2",
                                )}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </ToolPanel>
            </div>

            <div className="flex flex-col gap-6">
                <ToolPanel radius="lg" padding="lg" className="md:p-8">
                    <div className="mb-4 flex items-center justify-between">
                        <ToolLabel icon={<Hash className="size-4" />}>{t("hexFormat")}</ToolLabel>
                        <Button
                            id="btn-copy-hex"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(hex, "hex")}
                            className={cn("h-8 gap-2", copied === "hex" && "text-green-500")}
                        >
                            {copied === "hex" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            <span>{copied === "hex" ? tc("copied") : tc("copy")}</span>
                        </Button>
                    </div>
                    <input
                        id="input-hex"
                        type="text"
                        value={hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        className="w-full bg-transparent text-5xl font-black uppercase tracking-tighter outline-none transition-colors focus:text-blue-500"
                        spellCheck={false}
                    />
                </ToolPanel>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <ToolPanel radius="lg" padding="lg">
                        <div className="mb-6 flex items-center justify-between">
                            <ToolLabel>RGB</ToolLabel>
                            <Button
                                id="btn-copy-rgb"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, "rgb")}
                                className={cn("h-7 px-2", copied === "rgb" && "text-green-500")}
                            >
                                <Copy className="size-3.5" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {(["r", "g", "b"] as const).map((ch) => (
                                <div key={ch} className="flex items-center gap-4">
                                    <span className="w-4 font-mono font-bold uppercase text-muted-foreground">
                                        {ch}
                                    </span>
                                    <input
                                        id={`input-rgb-${ch}-range`}
                                        type="range"
                                        min="0"
                                        max="255"
                                        value={rgb[ch]}
                                        onChange={(e) =>
                                            updateFromRgb({ ...rgb, [ch]: parseInt(e.target.value) || 0 })
                                        }
                                        className="h-1.5 w-full appearance-none rounded-full bg-muted accent-blue-500"
                                    />
                                    <input
                                        id={`input-rgb-${ch}`}
                                        type="number"
                                        value={rgb[ch]}
                                        onChange={(e) =>
                                            updateFromRgb({ ...rgb, [ch]: parseInt(e.target.value) || 0 })
                                        }
                                        className="w-12 text-right font-mono font-bold outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </ToolPanel>

                    <ToolPanel radius="lg" padding="lg">
                        <div className="mb-6 flex items-center justify-between">
                            <ToolLabel>HSL</ToolLabel>
                            <Button
                                id="btn-copy-hsl"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, "hsl")}
                                className={cn("h-7 px-2", copied === "hsl" && "text-green-500")}
                            >
                                <Copy className="size-3.5" />
                            </Button>
                        </div>
                        <div className="flex h-[calc(100%-2rem)] flex-col justify-center">
                            <div id="output-hsl" className="mb-2 text-3xl font-black tracking-tight">
                                {hsl.h}°, {hsl.s}%, {hsl.l}%
                            </div>
                            <p className="text-xs italic text-muted-foreground">
                                Hue, Saturation, Lightness
                            </p>
                        </div>
                    </ToolPanel>
                </div>

                <ToolPanel tone="dashed" radius="lg" padding="lg">
                    <ToolLabel className="mb-3" icon={<SlidersHorizontal className="size-4" />}>
                        {t("cssVariable")}
                    </ToolLabel>
                    <code id="output-css" className="block rounded-xl bg-muted/50 p-4 font-mono text-sm">
                        <span className="text-blue-500">--color-primary</span>: {hex};<br />
                        <span className="text-blue-500">--color-primary-rgb</span>: {rgb.r}, {rgb.g}, {rgb.b};
                    </code>
                </ToolPanel>
            </div>
        </div>
    );
}
