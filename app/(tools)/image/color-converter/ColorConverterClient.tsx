"use client";

import { useState, useEffect } from "react";
import {
    Palette,
    Copy,
    Check,
    RotateCcw,
    Pipette,
    Hash,
    SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    hexToRgb,
    rgbToHex,
    rgbToHsl,
    POPULAR_COLORS,
    type RGB,
    type HSL
} from "@/lib/image/color";
import { cn } from "@/lib/utils";

export function ColorConverterClient() {
    const [hex, setHex] = useState("#4169e1");
    const [rgb, setRgb] = useState<RGB>({ r: 65, g: 105, b: 225 });
    const [hsl, setHsl] = useState<HSL>({ h: 225, s: 73, l: 57 });
    const [copied, setCopied] = useState<string | null>(null);

    // Sync from HEX
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

    // Sync from RGB
    const updateFromRgb = (r: number, g: number, b: number) => {
        const newRgb = { r: Math.min(255, Math.max(0, r)), g: Math.min(255, Math.max(0, g)), b: Math.min(255, Math.max(0, b)) };
        setRgb(newRgb);
        const newHex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
        setHex(newHex);
        setHsl(rgbToHsl(newRgb.r, newRgb.g, newRgb.b));
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

            {/* Left: Preview & Picker */}
            <div className="flex flex-col gap-6">
                <div
                    className="relative flex h-64 w-full flex-col items-center justify-center rounded-[2.5rem] shadow-2xl transition-all duration-300"
                    style={{ backgroundColor: hex }}
                >
                    <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/20 to-transparent rounded-b-[2.5rem]" />

                    <label className="group relative cursor-pointer active:scale-95 transition-transform">
                        <input
                            type="color"
                            className="absolute inset-0 size-full opacity-0 cursor-pointer"
                            value={hex}
                            onChange={(e) => updateFromHex(e.target.value)}
                        />
                        <div className="flex size-20 items-center justify-center rounded-3xl bg-white/20 text-white backdrop-blur-md border border-white/30 shadow-lg group-hover:bg-white/30 transition-all">
                            <Pipette className="size-10" />
                        </div>
                    </label>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-white/90 drop-shadow-md">Chọn màu thủ công</p>
                </div>

                {/* Popular Colors */}
                <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <Palette className="size-4" />
                        Màu phổ biến
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                        {POPULAR_COLORS.map((color) => (
                            <button
                                key={color.hex}
                                onClick={() => updateFromHex(color.hex)}
                                className={cn(
                                    "size-full aspect-square rounded-xl border border-white/10 shadow-sm transition-transform hover:scale-110",
                                    hex.toLowerCase() === color.hex.toLowerCase() && "ring-2 ring-blue-500 ring-offset-2"
                                )}
                                style={{ backgroundColor: color.hex }}
                                title={color.name}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Inputs */}
            <div className="flex flex-col gap-6">

                {/* HEX Input */}
                <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                            <Hash className="size-4" />
                            HEX Format
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopy(hex, 'hex')}
                            className={cn("h-8 gap-2", copied === 'hex' && "text-green-500")}
                        >
                            {copied === 'hex' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                            <span>{copied === 'hex' ? "Đã chép" : "Sao chép"}</span>
                        </Button>
                    </div>
                    <input
                        type="text"
                        value={hex}
                        onChange={(e) => updateFromHex(e.target.value)}
                        className="w-full bg-transparent text-5xl font-black tracking-tighter uppercase outline-none focus:text-blue-500 transition-colors"
                        spellCheck={false}
                    />
                </div>

                {/* RGB & HSL Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* RGB */}
                    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">RGB</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, 'rgb')}
                                className={cn("h-7 px-2", copied === 'rgb' && "text-green-500")}
                            >
                                <Copy className="size-3.5" />
                            </Button>
                        </div>
                        <div className="space-y-4">
                            {(['r', 'g', 'b'] as const).map((ch) => (
                                <div key={ch} className="flex items-center gap-4">
                                    <span className="w-4 font-mono font-bold uppercase text-muted-foreground">{ch}</span>
                                    <input
                                        type="range"
                                        min="0"
                                        max="255"
                                        value={rgb[ch]}
                                        onChange={(e) => updateFromRgb({ ...rgb, [ch]: parseInt(e.target.value) }.r, { ...rgb, [ch]: parseInt(e.target.value) }.g, { ...rgb, [ch]: parseInt(e.target.value) }.b)}
                                        className="h-1.5 w-full appearance-none rounded-full bg-muted accent-blue-500"
                                    />
                                    <input
                                        type="number"
                                        value={rgb[ch]}
                                        onChange={(e) => updateFromRgb({ ...rgb, [ch]: parseInt(e.target.value) || 0 }.r, { ...rgb, [ch]: parseInt(e.target.value) || 0 }.g, { ...rgb, [ch]: parseInt(e.target.value) || 0 }.b)}
                                        className="w-12 text-right font-mono font-bold outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* HSL */}
                    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">HSL</div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`, 'hsl')}
                                className={cn("h-7 px-2", copied === 'hsl' && "text-green-500")}
                            >
                                <Copy className="size-3.5" />
                            </Button>
                        </div>
                        <div className="flex flex-col justify-center h-[calc(100%-2rem)]">
                            <div className="text-3xl font-black tracking-tight mb-2">
                                {hsl.h}°, {hsl.s}%, {hsl.l}%
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                                Hue, Saturation, Lightness
                            </p>
                        </div>
                    </div>
                </div>

                {/* CSS Export */}
                <div className="rounded-3xl border-2 border-dashed border-border bg-card/30 p-6">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <SlidersHorizontal className="size-4" />
                        CSS Variable
                    </div>
                    <code className="block rounded-xl bg-muted/50 p-4 font-mono text-sm">
                        <span className="text-blue-500">--color-primary</span>: {hex};<br />
                        <span className="text-blue-500">--color-primary-rgb</span>: {rgb.r}, {rgb.g}, {rgb.b};
                    </code>
                </div>
            </div>
        </div>
    );
}
