"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { Shuffle, PartyPopper, Trophy, Zap, Timer, Flame } from "lucide-react";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    WHEEL_TEMPLATES,
    type WheelTemplate,
} from "@/lib/constants/wheel-templates";
import {
    generateWheelSlices,
    shuffleItems,
    calculateSpinAngle,
    getWinnerIndex,
    type WheelSlice,
} from "@/lib/math/wheel";

// ─── Constants ─────────────────────────────────────────────────────────────────

interface SpeedPreset {
    id: string;
    label: string;
    icon: typeof Zap;
    minMs: number;
    maxMs: number;
}

const SPEED_PRESETS: SpeedPreset[] = [
    { id: "fast", label: "Nhanh", icon: Zap, minMs: 1000, maxMs: 2000 },
    { id: "medium", label: "Trung bình", icon: Timer, minMs: 3000, maxMs: 5000 },
    { id: "suspense", label: "Hồi hộp", icon: Flame, minMs: 7000, maxMs: 10000 },
];

const DEFAULT_TEXT = WHEEL_TEMPLATES[0].items.join("\n");

// ─── SVG Wheel Sub-Component ──────────────────────────────────────────────────

interface WheelSVGProps {
    slices: WheelSlice[];
    rotation: number;
    isSpinning: boolean;
    spinDurationMs: number;
}

function WheelSVG({ slices, rotation, isSpinning, spinDurationMs }: WheelSVGProps) {
    const size = 400;
    const center = size / 2;
    const radius = 180;

    /** Convert degrees → SVG arc path for a pie slice with rounded outer edge. */
    function describeArc(startAngle: number, endAngle: number): string {
        const startRad = ((startAngle - 90) * Math.PI) / 180;
        const endRad = ((endAngle - 90) * Math.PI) / 180;

        const x1 = center + radius * Math.cos(startRad);
        const y1 = center + radius * Math.sin(startRad);
        const x2 = center + radius * Math.cos(endRad);
        const y2 = center + radius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return [
            `M ${center} ${center}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            "Z",
        ].join(" ");
    }

    /** Calculate text position for a slice label. */
    function getLabelPosition(
        startAngle: number,
        sliceAngle: number,
    ): { x: number; y: number; rotation: number } {
        const midAngle = startAngle + sliceAngle / 2;
        const midRad = ((midAngle - 90) * Math.PI) / 180;
        const labelRadius = radius * 0.62;
        return {
            x: center + labelRadius * Math.cos(midRad),
            y: center + labelRadius * Math.sin(midRad),
            rotation: midAngle,
        };
    }

    const sliceAngle = slices.length > 0 ? 360 / slices.length : 360;

    return (
        <div className="relative inline-block select-none">
            {/* Pointer triangle at top-center */}
            <div className="absolute top-0 left-1/2 z-20 -translate-x-1/2 -translate-y-1">
                <svg width="28" height="32" viewBox="0 0 28 32">
                    <polygon
                        points="14,30 2,4 26,4"
                        fill="#EF4444"
                        stroke="white"
                        strokeWidth="2"
                    />
                </svg>
            </div>

            {/* Outer glow ring */}
            <div
                className={`rounded-full p-1.5 transition-shadow duration-300 ${
                    isSpinning
                        ? "shadow-[0_0_40px_8px_rgba(234,179,8,0.4)]"
                        : "shadow-[0_0_20px_4px_rgba(100,100,255,0.15)]"
                }`}
            >
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="block max-w-full"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning
                            ? `transform ${spinDurationMs}ms cubic-bezier(0.25, 0.1, 0.15, 1)`
                            : "none",
                    }}
                >
                    {/* Outer decorative border */}
                    <circle
                        cx={center}
                        cy={center}
                        r={radius + 6}
                        fill="none"
                        stroke="url(#borderGrad)"
                        strokeWidth="4"
                    />

                    {/* Gradient definitions */}
                    <defs>
                        <linearGradient
                            id="borderGrad"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop offset="0%" stopColor="#FFD700" />
                            <stop offset="50%" stopColor="#FF6B6B" />
                            <stop offset="100%" stopColor="#6C5CE7" />
                        </linearGradient>
                        <radialGradient id="centerGrad">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#e5e7eb" />
                        </radialGradient>
                        <filter id="sliceShadow">
                            <feDropShadow
                                dx="0"
                                dy="0"
                                stdDeviation="1"
                                floodColor="#000"
                                floodOpacity="0.15"
                            />
                        </filter>
                    </defs>

                    {slices.length === 0 ? (
                        <>
                            <circle
                                cx={center}
                                cy={center}
                                r={radius}
                                className="fill-muted"
                            />
                            <text
                                x={center}
                                y={center}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="fill-muted-foreground text-sm"
                            >
                                Thêm mục để bắt đầu
                            </text>
                        </>
                    ) : (
                        slices.map((slice, i) => {
                            const startAngle = i * sliceAngle;
                            const endAngle = startAngle + sliceAngle;
                            const label = getLabelPosition(
                                startAngle,
                                sliceAngle,
                            );
                            const maxChars =
                                slices.length > 10
                                    ? 6
                                    : slices.length > 6
                                      ? 8
                                      : 12;
                            const displayText =
                                slice.text.length > maxChars
                                    ? slice.text.slice(0, maxChars) + "…"
                                    : slice.text;
                            const fontSize =
                                slices.length > 10
                                    ? 10
                                    : slices.length > 6
                                      ? 12
                                      : 14;

                            return (
                                <g key={i} filter="url(#sliceShadow)">
                                    <path
                                        d={describeArc(startAngle, endAngle)}
                                        fill={slice.color}
                                        stroke="rgba(255,255,255,0.7)"
                                        strokeWidth="1.5"
                                    />
                                    <text
                                        x={label.x}
                                        y={label.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={`rotate(${label.rotation}, ${label.x}, ${label.y})`}
                                        fill="white"
                                        fontSize={fontSize}
                                        fontWeight="bold"
                                        style={{
                                            textShadow:
                                                "0 1px 3px rgba(0,0,0,0.4)",
                                        }}
                                    >
                                        {displayText}
                                    </text>
                                </g>
                            );
                        })
                    )}

                    {/* Center hub */}
                    <circle
                        cx={center}
                        cy={center}
                        r={32}
                        fill="url(#centerGrad)"
                        stroke="white"
                        strokeWidth="3"
                        className="drop-shadow-md"
                    />
                </svg>
            </div>

            {/* SPIN button overlay at center */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="pointer-events-auto" />
            </div>
        </div>
    );
}

// ─── Main Client Component ────────────────────────────────────────────────────

export function LuckyWheelClient() {
    const [itemsText, setItemsText] = useState(DEFAULT_TEXT);
    const [rotation, setRotation] = useState(0);
    const [isSpinning, setIsSpinning] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [winnerColor, setWinnerColor] = useState<string | null>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>(
        WHEEL_TEMPLATES[0].id,
    );
    const [speedId, setSpeedId] = useState<string>("medium");

    // Track current rotation without triggering transition on each set
    const currentRotationRef = useRef(0);
    const spinButtonRef = useRef<HTMLButtonElement>(null);
    const activeDurationRef = useRef(0);

    // Randomise duration within selected speed range
    const selectedSpeed = useMemo(
        () => SPEED_PRESETS.find((s) => s.id === speedId) ?? SPEED_PRESETS[1],
        [speedId],
    );

    // Parse items from textarea
    const items = itemsText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

    const slices = generateWheelSlices(items);
    const canSpin = items.length >= 2 && !isSpinning;

    // Handle template selection
    const handleTemplateChange = useCallback(
        (templateId: string) => {
            setSelectedTemplate(templateId);
            const template = WHEEL_TEMPLATES.find(
                (t: WheelTemplate) => t.id === templateId,
            );
            if (template) {
                setItemsText(template.items.join("\n"));
            }
        },
        [],
    );

    // Handle shuffle
    const handleShuffle = useCallback(() => {
        const shuffled = shuffleItems(items);
        setItemsText(shuffled.join("\n"));
    }, [items]);

    // Fire confetti + show dialog
    const announceWinner = useCallback((winnerText: string, color: string) => {
        setWinner(winnerText);
        setWinnerColor(color);
        setShowDialog(true);

        // Fire confetti 🎉
        const duration = 2500;
        const end = Date.now() + duration;

        const frame = () => {
            confetti({
                particleCount: 3,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.6 },
                colors: ["#FF6B6B", "#4ECDC4", "#F7DC6F", "#DDA0DD", "#6C5CE7"],
            });
            confetti({
                particleCount: 3,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.6 },
                colors: ["#FF6B6B", "#4ECDC4", "#F7DC6F", "#DDA0DD", "#6C5CE7"],
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        };
        frame();
    }, []);

    // Handle spin
    const handleSpin = useCallback(() => {
        if (!canSpin) return;

        setIsSpinning(true);
        setWinner(null);
        setWinnerColor(null);
        setShowDialog(false);

        // Randomise duration within selected speed range
        const durationMs =
            selectedSpeed.minMs +
            Math.random() * (selectedSpeed.maxMs - selectedSpeed.minMs);
        activeDurationRef.current = durationMs;

        const targetAngle = calculateSpinAngle(currentRotationRef.current);
        setRotation(targetAngle);
        currentRotationRef.current = targetAngle;

        // Wait for CSS transition to finish
        setTimeout(() => {
            const winnerIdx = getWinnerIndex(targetAngle, items.length);
            const winnerText = items[winnerIdx] ?? items[0];
            const color = slices[winnerIdx]?.color ?? "#F7DC6F";
            setIsSpinning(false);
            announceWinner(winnerText, color);
        }, durationMs + 200);
    }, [canSpin, items, slices, selectedSpeed, announceWinner]);

    // Reset rotation on items change (avoid stale visual)
    useEffect(() => {
        // Don't reset while spinning
        if (!isSpinning) {
            setWinner(null);
            setShowDialog(false);
        }
    }, [itemsText]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* ── Left Panel: Controls ─────────────────────────────── */}
            <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
                {/* Template selector */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        📋 Chọn mẫu có sẵn
                    </label>
                    <Select
                        value={selectedTemplate}
                        onValueChange={handleTemplateChange}
                    >
                        <SelectTrigger
                            className="w-full"
                            id="template-select"
                        >
                            <SelectValue placeholder="Chọn một template…" />
                        </SelectTrigger>
                        <SelectContent>
                            {WHEEL_TEMPLATES.map(
                                (template: WheelTemplate) => (
                                    <SelectItem
                                        key={template.id}
                                        value={template.id}
                                    >
                                        {template.name}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Items textarea */}
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        ✏️ Danh sách mục (mỗi dòng = 1 mục)
                    </label>
                    <Textarea
                        id="items-textarea"
                        value={itemsText}
                        onChange={(e) => setItemsText(e.target.value)}
                        placeholder={
                            "Nhập mỗi mục trên một dòng…\nVí dụ:\nNam\nHùng\nLinh"
                        }
                        className="min-h-[200px] resize-y font-sans"
                        disabled={isSpinning}
                        spellCheck={false}
                    />
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            {items.length} mục
                            {items.length < 2 && (
                                <span className="ml-1 text-destructive">
                                    — cần ít nhất 2
                                </span>
                            )}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShuffle}
                            disabled={items.length < 2 || isSpinning}
                            className="gap-1.5"
                            id="shuffle-btn"
                        >
                            <Shuffle className="size-3.5" />
                            Trộn đều
                        </Button>
                    </div>
                </div>
            </div>

            {/* ── Right Panel: Wheel ──────────────────────────────── */}
            <div className="flex flex-1 flex-col items-center gap-5">
                <div className="rounded-2xl border border-border bg-card p-5 shadow-lg">
                    <WheelSVG
                        slices={slices}
                        rotation={rotation}
                        isSpinning={isSpinning}
                        spinDurationMs={activeDurationRef.current}
                    />
                </div>

                {/* Spin button */}
                <Button
                    ref={spinButtonRef}
                    onClick={handleSpin}
                    disabled={!canSpin}
                    size="lg"
                    id="spin-btn"
                    className="relative gap-2 px-10 text-lg font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100"
                >
                    {isSpinning ? (
                        <>
                            <span className="animate-spin">🎡</span>
                            Đang quay…
                        </>
                    ) : (
                        <>
                            <PartyPopper className="size-5" />
                            QUAY
                        </>
                    )}
                </Button>

                {/* Speed selector */}
                <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
                    {SPEED_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isActive = speedId === preset.id;
                        return (
                            <button
                                key={preset.id}
                                onClick={() => setSpeedId(preset.id)}
                                disabled={isSpinning}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50 ${
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                }`}
                            >
                                <Icon className="size-3.5" />
                                {preset.label}
                            </button>
                        );
                    })}
                </div>

                <p className="text-xs text-muted-foreground">
                    Mũi tên đỏ ở trên chỉ vào mục được chọn
                </p>
            </div>

            {/* ── Winner Dialog ────────────────────────────────────── */}
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
                <DialogContent className="text-center sm:max-w-md">
                    <DialogHeader className="items-center">
                        <div className="mb-2 flex items-center justify-center gap-2">
                            <Trophy className="size-6 text-yellow-500" />
                            <DialogTitle className="text-lg">
                                🎉 Kết quả
                            </DialogTitle>
                            <Trophy className="size-6 text-yellow-500" />
                        </div>
                        <DialogDescription>
                            Vòng quay may mắn đã chọn ra:
                        </DialogDescription>
                    </DialogHeader>

                    <div
                        className="rounded-xl border-2 p-6"
                        style={{
                            borderColor: winnerColor ?? "#F7DC6F",
                            backgroundColor: winnerColor
                                ? `${winnerColor}18`
                                : "rgba(247,220,111,0.1)",
                        }}
                    >
                        <p
                            className="break-all text-3xl font-extrabold"
                            style={{ color: winnerColor ?? undefined }}
                        >
                            {winner}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                setShowDialog(false);
                            }}
                            className="w-full gap-2"
                        >
                            <PartyPopper className="size-4" />
                            Quay tiếp
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
