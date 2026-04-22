"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import {
    Upload,
    Trash2,
    Download,
    Image as ImageIcon,
    Percent,
    Check,
    Lock,
    Unlock,
    Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { ToolInfoBox } from "@/components/shared/ToolInfoBox";
import { cn } from "@/lib/utils";

export function ImageResizerClient() {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [width, setWidth] = useState<number>(0);
    const [height, setHeight] = useState<number>(0);
    const [quality, setQuality] = useState<number>(90);
    const [aspectRatio, setAspectRatio] = useState<number>(1);
    const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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
                <label className="group relative flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-dashed border-border bg-card transition-all hover:border-blue-500 hover:bg-blue-500/5">
                    <input
                        id="input-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={onFileChange}
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-3xl bg-blue-500/10 p-5 text-blue-600 transition-transform group-hover:scale-110">
                            <Upload className="size-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">Tải ảnh lên để thay đổi kích thước</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Hỗ trợ JPG, PNG, WEBP (Tối đa 10MB)
                            </p>
                        </div>
                    </div>
                </label>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_1fr]">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-2">
                            <ToolLabel>Xem trước kết quả</ToolLabel>
                            <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground">
                                <span id="stat-original" className="flex items-center gap-1">
                                    <ImageIcon className="size-3" /> Gốc: {image.width}x{image.height}
                                </span>
                                <span id="stat-new" className="flex items-center gap-1 text-blue-600">
                                    <Check className="size-3" /> Mới: {width}x{height}
                                </span>
                            </div>
                        </div>
                        <ToolPanel
                            radius="lg"
                            padding="md"
                            className="relative min-h-[400px] shadow-inner"
                            bodyClassName="flex items-center justify-center overflow-auto"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.03] [background-size:20px_20px]" />
                            <canvas
                                ref={canvasRef}
                                className="max-w-full rounded-sm border bg-white shadow-2xl"
                                style={{ maxHeight: "500px" }}
                            />
                        </ToolPanel>
                        <Button
                            id="btn-clear"
                            variant="outline"
                            onClick={handleClear}
                            className="w-full gap-2 rounded-2xl hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                            Hủy bỏ và chọn ảnh khác
                        </Button>
                    </div>

                    <div className="flex flex-col gap-6">
                        <ToolPanel radius="lg" padding="lg" className="shadow-xl md:p-8">
                            <ToolLabel className="mb-8">Cấu hình Resize</ToolLabel>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <ToolLabel htmlFor="input-width">Chiều rộng (px)</ToolLabel>
                                        <input
                                            id="input-width"
                                            type="number"
                                            value={width}
                                            onChange={(e) => handleWidthChange(parseInt(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-border bg-muted/50 p-4 font-black outline-none focus:ring-2 focus:ring-blue-500/30"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <ToolLabel htmlFor="input-height">Chiều cao (px)</ToolLabel>
                                        <input
                                            id="input-height"
                                            type="number"
                                            value={height}
                                            onChange={(e) => handleHeightChange(parseInt(e.target.value) || 0)}
                                            className="w-full rounded-xl border border-border bg-muted/50 p-4 font-black outline-none focus:ring-2 focus:ring-blue-500/30"
                                        />
                                    </div>
                                </div>

                                <label
                                    className={cn(
                                        "flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-all",
                                        lockAspectRatio
                                            ? "border-blue-500/20 bg-blue-500/5 text-blue-600"
                                            : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50",
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex size-5 items-center justify-center rounded-md border-2 transition-all",
                                            lockAspectRatio
                                                ? "border-blue-600 bg-blue-600"
                                                : "border-muted-foreground/30",
                                        )}
                                    >
                                        <input
                                            id="input-lock-aspect"
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
                                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                        {lockAspectRatio ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
                                        Khóa tỷ lệ ảnh
                                    </span>
                                </label>
                            </div>

                            {originalFile?.type !== "image/png" && (
                                <div className="mt-8 space-y-4">
                                    <ToolLabel htmlFor="input-quality" icon={<Percent className="size-3.5" />}>
                                        Chất lượng: {quality}%
                                    </ToolLabel>
                                    <input
                                        id="input-quality"
                                        type="range"
                                        min="10"
                                        max="100"
                                        value={quality}
                                        onChange={(e) => setQuality(parseInt(e.target.value))}
                                        className="h-1.5 w-full appearance-none rounded-full bg-muted accent-blue-600"
                                    />
                                    <p className="text-[10px] italic text-muted-foreground">
                                        Giảm chất lượng sẽ làm dung lượng file nhỏ hơn.
                                    </p>
                                </div>
                            )}

                            <div className="pt-6">
                                <Button
                                    id="btn-download"
                                    onClick={handleDownload}
                                    className="h-16 w-full gap-3 rounded-2xl bg-blue-600 text-lg font-bold shadow-xl shadow-blue-500/30 hover:bg-blue-700"
                                >
                                    <Download className="size-6" />
                                    Tải ảnh đã Resize
                                </Button>
                            </div>
                        </ToolPanel>

                        <ToolInfoBox
                            tone="accent"
                            icon={<Info className="size-5 text-blue-600" />}
                            title={<span className="text-blue-600">Mẹo Resizing</span>}
                        >
                            <p className="leading-relaxed">
                                Để ảnh không bị biến dạng, hãy luôn bật chế độ{" "}
                                <strong>Khóa tỷ lệ (Lock)</strong>. Nếu bạn muốn tối ưu tốc độ tải web, hãy
                                thử giảm chất lượng xuống khoảng 80-90%.
                            </p>
                        </ToolInfoBox>
                    </div>
                </div>
            )}
        </div>
    );
}
