"use client";

import { useState, useMemo } from "react";
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
    Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateSVGPlaceholder, svgToDataUri, type PlaceholderOptions } from "@/lib/image/placeholder";
import { cn } from "@/lib/utils";

export function SvgPlaceholderClient() {
    const [options, setOptions] = useState<PlaceholderOptions>({
        width: 300,
        height: 200,
        text: "",
        bgColor: "#e2e8f0",
        textColor: "#64748b",
        fontSize: 20
    });
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

    const handleDownload = async (format: 'svg' | 'png' | 'jpeg') => {
        if (format === 'svg') {
            const link = document.createElement("a");
            link.href = dataUri;
            link.download = `placeholder-${options.width}x${options.height}.svg`;
            link.click();
            return;
        }

        // Create a canvas to draw the SVG
        const canvas = document.createElement('canvas');
        canvas.width = options.width;
        canvas.height = options.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create an image from the SVG data URI
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            // Fill background (important for JPEG as it doesn't support transparency)
            if (format === 'jpeg') {
                ctx.fillStyle = options.bgColor || '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
            
            ctx.drawImage(img, 0, 0);
            
            const link = document.createElement("a");
            link.download = `placeholder-${options.width}x${options.height}.${format === 'jpeg' ? 'jpg' : format}`;
            link.href = canvas.toDataURL(`image/${format}`, 0.95);
            link.click();
        };
        img.src = dataUri;
    };

    const reset = () => {
        setOptions({
            width: 300,
            height: 200,
            text: "",
            bgColor: "#e2e8f0",
            textColor: "#64748b",
            fontSize: 20
        });
    };

    return (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
            
            {/* Controls */}
            <div className="flex flex-col gap-6">
                <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                         <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Tùy chỉnh ảnh</h2>
                         <Button variant="ghost" size="sm" onClick={reset} className="h-8 gap-2 text-xs">
                             <RotateCcw className="size-3" />
                             Đặt lại
                         </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <Maximize className="size-3.5" />
                                Chiều rộng (px)
                            </label>
                            <input 
                                type="number" 
                                value={options.width}
                                onChange={(e) => setOptions(prev => ({ ...prev, width: parseInt(e.target.value) || 0 }))}
                                className="w-full rounded-xl border border-border bg-muted/50 p-3 font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <Maximize className="size-3.5 rotate-90" />
                                Chiều cao (px)
                            </label>
                            <input 
                                type="number" 
                                value={options.height}
                                onChange={(e) => setOptions(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                                className="w-full rounded-xl border border-border bg-muted/50 p-3 font-mono font-bold outline-none focus:ring-2 focus:ring-blue-500/30"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                            <Type className="size-3.5" />
                            Văn bản hiển thị
                        </label>
                        <input 
                            type="text" 
                            value={options.text}
                            placeholder={`${options.width}x${options.height}`}
                            onChange={(e) => setOptions(prev => ({ ...prev, text: e.target.value }))}
                            className="w-full rounded-xl border border-border bg-muted/50 p-3 font-semibold outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <Palette className="size-3.5 text-blue-500" />
                                Màu nền
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="color" 
                                    value={options.bgColor}
                                    onChange={(e) => setOptions(prev => ({ ...prev, bgColor: e.target.value }))}
                                    className="size-11 rounded-lg border-none bg-transparent cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    value={options.bgColor}
                                    onChange={(e) => setOptions(prev => ({ ...prev, bgColor: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-muted/50 px-3 text-xs font-mono font-bold outline-none uppercase"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                             <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <Palette className="size-3.5 text-slate-500" />
                                Màu chữ
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="color" 
                                    value={options.textColor}
                                    onChange={(e) => setOptions(prev => ({ ...prev, textColor: e.target.value }))}
                                    className="size-11 rounded-lg border-none bg-transparent cursor-pointer"
                                />
                                <input 
                                    type="text" 
                                    value={options.textColor}
                                    onChange={(e) => setOptions(prev => ({ ...prev, textColor: e.target.value }))}
                                    className="w-full rounded-xl border border-border bg-muted/50 px-3 text-xs font-mono font-bold outline-none uppercase"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview & Export */}
            <div className="flex flex-col gap-6">
                <div className="rounded-[2.5rem] border border-border bg-card p-2 shadow-2xl relative overflow-hidden group">
                     {/* Preview Container */}
                    <div className="flex min-h-[360px] items-center justify-center rounded-[2rem] bg-muted/30 p-8 overflow-auto">
                        <div 
                            dangerouslySetInnerHTML={{ __html: svgCode }} 
                            className="shadow-2xl max-w-full"
                        />
                    </div>

                    {/* Quick copy overlay for premium feel */}
                </div>

                <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-2">
                        <Download className="size-4 text-blue-500" />
                        <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Tải ảnh về</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <Button 
                            variant="outline" 
                            className="flex-col h-24 rounded-2xl gap-2 border-2 hover:border-blue-500 hover:bg-blue-500/5 group transition-all"
                            onClick={() => handleDownload('svg')}
                        >
                            <Code className="size-6 text-muted-foreground group-hover:text-blue-500" />
                            <span className="font-bold">.SVG</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            className="flex-col h-24 rounded-2xl gap-2 border-2 hover:border-blue-500 hover:bg-blue-500/5 group transition-all"
                            onClick={() => handleDownload('png')}
                        >
                            <FileImage className="size-6 text-muted-foreground group-hover:text-blue-500" />
                            <span className="font-bold">.PNG</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            className="flex-col h-24 rounded-2xl gap-2 border-2 hover:border-blue-500 hover:bg-blue-500/5 group transition-all"
                            onClick={() => handleDownload('jpeg')}
                        >
                            <Layers className="size-6 text-muted-foreground group-hover:text-blue-500" />
                            <span className="font-bold">.JPG</span>
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground px-4">Xuất mã nguồn</p>
                    <div className="grid grid-cols-2 gap-4">
                        <Button 
                            variant="outline" 
                            className={cn("h-14 rounded-2xl gap-3 text-sm font-bold", copied === 'code' && "border-green-500 text-green-500")}
                            onClick={() => handleCopy(svgCode, 'code')}
                        >
                            {copied === 'code' ? <Check className="size-5" /> : <Code className="size-5" />}
                            SVG Code
                        </Button>
                        <Button 
                            variant="outline" 
                            className={cn("h-14 rounded-2xl gap-3 text-sm font-bold", copied === 'uri' && "border-green-500 text-green-500")}
                            onClick={() => handleCopy(dataUri, 'uri')}
                        >
                            {copied === 'uri' ? <Check className="size-5" /> : <Copy className="size-5" />}
                            Data URI
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
