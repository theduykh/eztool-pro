"use client";

import { useState, useRef, useEffect } from "react";
import {
    Upload,
    Maximize,
    Trash2,
    Download,
    Image as ImageIcon,
    Percent,
    Check,
    Lock,
    Unlock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ImageResizerClient() {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [quality, setQuality] = useState<number>(90);
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);
    const [isProcessing, setIsProcessing] = useState(false);

    // For preview and download
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const img = new Image();
        img.onload = () => {
            setImage(img);
            setOriginalFile(file);
            setWidth(img.width);
            setHeight(img.height);
            setAspectRatio(img.width / img.height);
        };
        img.src = URL.createObjectURL(file);
    };

    const handleWidthChange = (val: number) => {
        setWidth(val);
        if (lockAspectRatio) {
            setHeight(Math.round(val / aspectRatio));
        }
    };

    const handleHeightChange = (val: number) => {
        setHeight(val);
        if (lockAspectRatio) {
            setWidth(Math.round(val * aspectRatio));
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current || !originalFile) return;

        const canvas = canvasRef.current;
        const link = document.createElement("a");
        const format = originalFile.type === "image/png" ? "image/png" : "image/jpeg";

        link.download = `resized-${originalFile.name}`;
        link.href = canvas.toDataURL(format, quality / 100);
        link.click();
    };

    const handleClear = () => {
        setImage(null);
        setOriginalFile(null);
        setWidth(0);
        setHeight(0);
    };

    // Update canvas whenever width, height or quality changes
    useEffect(() => {
        if (!image || !canvasRef.current) return;

        const canvas = canvasRef.current;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.drawImage(image, 0, 0, width, height);
        }
    }, [image, width, height, quality]);

    return (
        <div className="flex flex-col gap-8">
            {!image ? (
                <label className="group relative flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-border bg-card transition-all hover:border-blue-500 hover:bg-blue-500/5">
                    <input type="file" className="hidden" accept="image/*" onChange={onFileChange} />
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-3xl bg-blue-500/10 p-5 text-blue-600 group-hover:scale-110 transition-transform">
                            <Upload className="size-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">Tải ảnh lên để thay đổi kích thước</p>
                            <p className="text-sm text-muted-foreground mt-1">Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB)</p>
                        </div>
                    </div>
                </label>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
                    {/* Preview Area */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Xem trước kết quả</p>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                                <span className="flex items-center gap-1"><ImageIcon className="size-3" /> Gốc: {image.width}x{image.height}</span>
                                <span className="flex items-center gap-1 text-blue-600"><Check className="size-3" /> Mới: {width}x{height}</span>
                            </div>
                        </div>
                        <div className="relative flex min-h-[400px] items-center justify-center rounded-3xl border border-border bg-card p-4 overflow-auto shadow-inner">
                            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:20px_20px]" />
                            <canvas
                                ref={canvasRef}
                                className="max-w-full shadow-2xl rounded-sm border bg-white"
                                style={{ maxHeight: '500px' }}
                            />
                        </div>
                        <Button variant="outline" onClick={handleClear} className="w-full rounded-2xl gap-2 hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="size-4" />
                            Hủy bỏ và chọn ảnh khác
                        </Button>
                    </div>

                    {/* Controls Area */}
                    <div className="flex flex-col gap-6">
                        <div className="rounded-[2.5rem] border border-border bg-card p-8 shadow-xl space-y-8">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Cấu hình Resize</h2>

                            {/* Width/Height Control */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chiều rộng (px)</label>
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-border bg-muted/50 p-4 font-black outline-none focus:ring-2 focus:ring-blue-500/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chiều cao (px)</label>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-border bg-muted/50 p-4 font-black outline-none focus:ring-2 focus:ring-blue-500/30"
                                        />
                                    </div>
                                </div>

                                {/* Aspect Ratio Lock Checkbox */}
                                <label 
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer",
                                        lockAspectRatio 
                                            ? "bg-blue-500/5 border-blue-500/20 text-blue-600" 
                                            : "bg-muted/30 border-transparent text-muted-foreground hover:bg-muted/50"
                                    )}
                                >
                                    <div className={cn(
                                        "size-5 rounded-md border-2 flex items-center justify-center transition-all",
                                        lockAspectRatio ? "bg-blue-600 border-blue-600" : "border-muted-foreground/30"
                                    )}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={lockAspectRatio}
                                            onChange={(e) => {
                                                const isChecked = e.target.checked;
                                                setLockAspectRatio(isChecked);
                                                if (isChecked && width > 0) {
                                                    setHeight(Math.round(width / aspectRatio));
                                                }
                                            }}
                                        />
                                        {lockAspectRatio && <Check className="size-3.5 text-white" />}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                        {lockAspectRatio ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                                        Khóa tỷ lệ ảnh
                                    </span>
                                </label>
                            </div>

                            {/* Quality Control (for JPEG) */}
                            {originalFile?.type !== "image/png" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                            <Percent className="size-3.5" />
                                            Chất lượng: {quality}%
                                        </label>
                                    </div>
                                    <input
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={quality}
                                        onChange={(e) => setQuality(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-muted rounded-full appearance-none accent-blue-600"
                                    />
                                    <p className="text-[10px] text-muted-foreground italic">Giảm chất lượng sẽ làm dung lượng file nhỏ hơn.</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="pt-4">
                                <Button
                                    onClick={handleDownload}
                                    className="w-full h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/30 text-lg font-bold gap-3"
                                >
                                    <Download className="size-6" />
                                    Tải ảnh đã Resize
                                </Button>
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="rounded-2xl border border-blue-500/10 bg-blue-500/5 p-6 space-y-2">
                            <p className="text-sm font-bold text-blue-600">Mẹo Resizing</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Để ảnh không bị biến dạng, hãy luôn bật chế độ <strong>Khóa tỷ lệ (Lock)</strong>. Nếu bạn muốn tối ưu tốc độ tải web, hãy thử giảm chất lượng xuống khoảng 80-90%.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
