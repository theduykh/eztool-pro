"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Dices, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import {
    parseItems,
    getWinnerIndexFromAngle,
    type WheelItem,
} from "@/lib/math/random-wheel";

// ─── Constants ────────────────────────────────────────────────────────────────

const CANVAS_SIZE = 400;
const DECELERATION = 0.985;
const STOP_VELOCITY = 0.0015;

const SEGMENT_COLORS = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#F7DC6F",
    "#DDA0DD",
    "#98D8C8",
    "#FFEAA7",
    "#BB8FCE",
    "#85C1E9",
    "#F8B500",
    "#27AE60",
];

const DEFAULT_ITEMS = "Mục 1\nMục 2\nMục 3\nMục 4\nMục 5\nMục 6";

// ─── Canvas drawing ────────────────────────────────────────────────────────────

function renderWheel(
    ctx: CanvasRenderingContext2D,
    items: WheelItem[],
    angle: number,
    highlightIndex: number | null,
): void {
    const size = CANVAS_SIZE;
    const center = size / 2;
    const radius = center - 32;

    ctx.clearRect(0, 0, size, size);

    if (items.length === 0) {
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "#e5e7eb";
        ctx.fill();
        ctx.fillStyle = "#9ca3af";
        ctx.font = "15px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Thêm mục để bắt đầu", center, center);
        return;
    }

    const segAngle = (2 * Math.PI) / items.length;
    const fontSize = items.length > 10 ? 10 : items.length > 6 ? 12 : 14;

    items.forEach((item, i) => {
        const startAngle = angle + i * segAngle;
        const endAngle = startAngle + segAngle;
        const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
        const isHighlighted = highlightIndex === i;

        // Segment fill
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = isHighlighted ? "#FFD700" : color;
        ctx.fill();
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Segment label
        const midAngle = startAngle + segAngle / 2;
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(midAngle);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isHighlighted ? "#1a1a1a" : "#ffffff";
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        ctx.shadowColor = "rgba(0,0,0,0.35)";
        ctx.shadowBlur = 3;
        const maxChars = items.length > 8 ? 8 : 12;
        const label =
            item.label.length > maxChars
                ? item.label.slice(0, maxChars) + "…"
                : item.label;
        ctx.fillText(label, radius - 10, 0);
        ctx.restore();
    });

    // Outer border ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center hub
    ctx.beginPath();
    ctx.arc(center, center, 20, 0, 2 * Math.PI);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Pointer triangle at top (pointing down into wheel)
    const pointerTipY = center - radius + 8;
    ctx.beginPath();
    ctx.moveTo(center, pointerTipY);
    ctx.lineTo(center - 13, pointerTipY - 22);
    ctx.lineTo(center + 13, pointerTipY - 22);
    ctx.closePath();
    ctx.fillStyle = "#EF4444";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RandomNumberClient() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const angleRef = useRef(0);
    const velocityRef = useRef(0);

    const [itemsText, setItemsText] = useState(DEFAULT_ITEMS);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<WheelItem | null>(null);
    const [highlightIndex, setHighlightIndex] = useState<number | null>(null);
    const [items, setItems] = useState<WheelItem[]>(() =>
        parseItems(DEFAULT_ITEMS),
    );

    // Re-parse items whenever the textarea changes
    useEffect(() => {
        setItems(parseItems(itemsText));
        setWinner(null);
        setHighlightIndex(null);
    }, [itemsText]);

    // Redraw whenever items or highlight changes (and when not animating)
    const redraw = useCallback(
        (hl: number | null = highlightIndex) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            renderWheel(ctx, items, angleRef.current, hl);
        },
        [items, highlightIndex],
    );

    useEffect(() => {
        redraw();
    }, [redraw]);

    const spin = useCallback(() => {
        if (isSpinning || items.length < 2) return;

        // Clear previous result
        setWinner(null);
        setHighlightIndex(null);
        setIsSpinning(true);

        velocityRef.current = 0.32 + Math.random() * 0.18; // 0.32–0.50 rad/frame

        const animate = () => {
            velocityRef.current *= DECELERATION;
            angleRef.current += velocityRef.current;

            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");
                if (ctx) renderWheel(ctx, items, angleRef.current, null);
            }

            if (velocityRef.current > STOP_VELOCITY) {
                animRef.current = requestAnimationFrame(animate);
            } else {
                // Determine winner from final resting angle
                const idx = getWinnerIndexFromAngle(
                    angleRef.current,
                    items.length,
                );
                setHighlightIndex(idx);
                setWinner(items[idx]);
                setIsSpinning(false);

                // Final draw with highlight
                const canvas2 = canvasRef.current;
                if (canvas2) {
                    const ctx = canvas2.getContext("2d");
                    if (ctx) renderWheel(ctx, items, angleRef.current, idx);
                }
            }
        };

        animRef.current = requestAnimationFrame(animate);
    }, [isSpinning, items]);

    const reset = useCallback(() => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        setIsSpinning(false);
        setWinner(null);
        setHighlightIndex(null);
        angleRef.current = 0;
        redraw(null);
    }, [redraw]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current);
        };
    }, []);

    const canSpin = items.length >= 2 && !isSpinning;

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            <div className="flex w-full flex-col gap-4 lg:w-72 lg:flex-shrink-0">
                <ToolPanel padding="md">
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        Danh sách mục
                    </label>
                    <textarea
                        id="input-items"
                        className="h-52 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
                        value={itemsText}
                        onChange={(e) => setItemsText(e.target.value)}
                        placeholder={"Nhập mỗi mục trên một dòng…\nVí dụ:\nAnh\nEm\nBạn bè"}
                        disabled={isSpinning}
                        spellCheck={false}
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                        {items.length} mục
                        {items.length < 2 && (
                            <span className="ml-1 text-destructive">
                                — cần ít nhất 2 để quay
                            </span>
                        )}
                    </p>
                </ToolPanel>

                {winner && (
                    <div
                        id="winner-card"
                        className="rounded-2xl border-2 border-yellow-400 bg-yellow-400/10 p-5 text-center shadow-md"
                    >
                        <div className="mb-2 flex items-center justify-center gap-2">
                            <Trophy className="size-4 text-yellow-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-400">
                                Kết quả
                            </span>
                            <Trophy className="size-4 text-yellow-500" />
                        </div>
                        <p className="break-all text-2xl font-extrabold text-foreground">
                            {winner.label}
                        </p>
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col items-center gap-5">
                <ToolPanel padding="md" className="shadow-lg">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        className="block max-w-full"
                        style={{ maxWidth: CANVAS_SIZE }}
                    />
                </ToolPanel>

                <div className="flex items-center gap-3">
                    <Button
                        id="btn-spin"
                        onClick={spin}
                        disabled={!canSpin}
                        size="lg"
                        className="gap-2 px-8 text-base font-bold shadow-md"
                    >
                        <Dices className="size-5" />
                        {isSpinning ? "Đang quay…" : "Quay ngay!"}
                    </Button>

                    {(winner || highlightIndex !== null) && !isSpinning && (
                        <Button
                            id="btn-reset"
                            variant="outline"
                            size="lg"
                            onClick={reset}
                            className="gap-2"
                        >
                            <RotateCcw className="size-4" />
                            Đặt lại
                        </Button>
                    )}
                </div>

                <p className="text-xs text-muted-foreground">
                    Mũi tên đỏ ở trên chỉ vào mục được chọn
                </p>
            </div>
        </div>
    );
}
