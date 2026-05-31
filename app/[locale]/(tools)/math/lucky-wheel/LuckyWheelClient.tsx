"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
    Maximize,
    X,
    Shuffle,
    PartyPopper,
    Trophy,
    Zap,
    Timer,
    Flame,
    Fan,
} from "lucide-react";
import confetti from "canvas-confetti";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
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
    getWinnerIndex,
    type WheelSlice,
} from "@/lib/math/wheel";

// ─── Constants ─────────────────────────────────────────────────────────────────

interface SpeedPreset {
    id: string;
    label: string;
    icon: typeof Zap;
    /** Exponential-decay time constant (seconds). Larger = slower to stop. */
    tau: number;
    /** Initial angular velocity range for button spin (deg/sec). */
    minV: number;
    maxV: number;
}

const SPEED_PRESETS: SpeedPreset[] = [
    { id: "fast", label: "Nhanh", icon: Zap, tau: 0.5, minV: 900, maxV: 1400 },
    { id: "medium", label: "Trung bình", icon: Timer, tau: 1.2, minV: 1400, maxV: 2000 },
    { id: "suspense", label: "Hồi hộp", icon: Flame, tau: 2.0, minV: 1800, maxV: 2500 },
];

/** Wheel considered stopped when |velocity| drops below this (deg/sec). */
const STOP_VELOCITY = 12;
/** Cap flick velocity so a violent swipe doesn't spin for ages. */
const MAX_FLICK_VELOCITY = 3500;

const DEFAULT_TEXT = WHEEL_TEMPLATES[0].items.join("\n");

// ─── SVG Wheel Sub-Component ──────────────────────────────────────────────────

interface WheelSVGProps {
    slices: WheelSlice[];
    rotation: number;
    isSpinning: boolean;
    isDragging: boolean;
    canInteract: boolean;
    onPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove?: (e: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp?: (e: React.PointerEvent<HTMLDivElement>) => void;
    className?: string;
    id?: string;
}

function WheelSVG({
    slices,
    rotation,
    isSpinning,
    isDragging,
    canInteract,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    className,
    id,
}: WheelSVGProps) {
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
        // Move text slightly outwards to look balanced along the radius
        const labelRadius = radius * 0.62;
        return {
            x: center + labelRadius * Math.cos(midRad),
            y: center + labelRadius * Math.sin(midRad),
            rotation: midAngle - 90, // Text points from center outwards
        };
    }

    const sliceAngle = slices.length > 0 ? 360 / slices.length : 360;

    // Determine font constraints based on number of items
    const maxLines = slices.length > 24 ? 1 : slices.length > 12 ? 2 : 3;
    const fontSize = slices.length > 24 ? 10 : slices.length > 12 ? 12 : 14;

    const wrapText = (text: string) => {
        const maxChars = 16;
        const words = text.split(/\s+/);
        const lines: string[] = [];
        let current = "";
        for (const word of words) {
            if ((current + " " + word).trim().length <= maxChars) {
                current = (current + " " + word).trim();
            } else {
                if (current) lines.push(current);
                let rem = word;
                while (rem.length > maxChars) {
                    lines.push(rem.slice(0, maxChars) + "-");
                    rem = rem.slice(maxChars);
                }
                current = rem;
            }
        }
        if (current) lines.push(current);

        if (lines.length > maxLines) {
            const truncated = lines.slice(0, maxLines);
            truncated[maxLines - 1] =
                truncated[maxLines - 1].slice(0, maxChars - 1) + "…";
            return truncated;
        }
        return lines;
    };

    return (
        <div
            id={id}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={cn(
                "relative block select-none",
                canInteract &&
                (isDragging ? "cursor-grabbing" : "cursor-grab"),
                className,
            )}
            style={{ touchAction: "none" }}
        >
            {/* Pointer overlay: scales perfectly with the wheel using identical viewport */}
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="pointer-events-none absolute inset-0 z-20 h-full w-full drop-shadow-md"
                style={{ overflow: "visible" }}
            >
                {/* Pointer tip at right edge (x=376, y=center). Base slightly outside (x=404). */}
                <polygon
                    points="376,200 404,186 404,214"
                    fill="#EF4444"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinejoin="round"
                />
            </svg>

            {/* Outer glow ring */}
            <div
                className={cn(
                    "h-full w-full rounded-full p-1.5 transition-shadow duration-300",
                    isSpinning
                        ? "shadow-[0_0_40px_8px_rgba(234,179,8,0.4)]"
                        : "shadow-[0_0_20px_4px_rgba(100,100,255,0.15)]",
                )}
            >
                <svg
                    viewBox={`0 0 ${size} ${size}`}
                    className="block h-full w-full max-w-full pointer-events-none"
                    style={{
                        transform: `rotate(${rotation}deg)`,
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
                            const lines = wrapText(slice.text);

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
                                        transform={`rotate(${label.rotation}, ${label.x}, ${label.y})`}
                                        fill="white"
                                        fontSize={fontSize}
                                        fontWeight="bold"
                                        style={{
                                            textShadow:
                                                "0 1px 3px rgba(0,0,0,0.4)",
                                        }}
                                    >
                                        {lines.map((line, idx) => (
                                            <tspan
                                                key={idx}
                                                x={label.x}
                                                dy={
                                                    idx === 0
                                                        ? `-${(lines.length - 1) * 0.6}em`
                                                        : "1.2em"
                                                }
                                                dominantBaseline="central"
                                            >
                                                {line}
                                            </tspan>
                                        ))}
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
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // Physics + rotation tracking (refs avoid re-render on every frame)
    const currentRotationRef = useRef(0);
    const velocityRef = useRef(0); // deg/sec
    const tauRef = useRef(1.2); // friction time constant (seconds)
    const rafRef = useRef<number | null>(null);
    const lastFrameTimeRef = useRef(0);

    // Drag tracking
    const isDraggingRef = useRef(false);
    const lastPointerAngleRef = useRef(0);
    const wheelCenterRef = useRef({ x: 0, y: 0 });
    const dragStartRotationRef = useRef(0);
    const dragSamplesRef = useRef<
        Array<{ rotation: number; time: number }>
    >([]);
    const activePointerIdRef = useRef<number | null>(null);

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

    // Clear any stale winner/dialog when the items list changes
    const updateItems = useCallback(
        (next: string) => {
            setItemsText(next);
            if (!isSpinning) {
                setWinner(null);
                setShowDialog(false);
            }
        },
        [isSpinning],
    );

    // Handle template selection
    const handleTemplateChange = useCallback(
        (templateId: string) => {
            setSelectedTemplate(templateId);
            const template = WHEEL_TEMPLATES.find(
                (t: WheelTemplate) => t.id === templateId,
            );
            if (template) {
                updateItems(template.items.join("\n"));
            }
        },
        [updateItems],
    );

    // Handle shuffle
    const handleShuffle = useCallback(() => {
        const shuffled = shuffleItems(items);
        updateItems(shuffled.join("\n"));
    }, [items, updateItems]);

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

    // ── Physics engine ─────────────────────────────────────────────────────
    const stopPhysics = useCallback(() => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }
    }, []);

    const finishSpin = useCallback(() => {
        if (items.length === 0) {
            setIsSpinning(false);
            return;
        }
        const winnerIdx = getWinnerIndex(
            currentRotationRef.current,
            items.length,
        );
        const winnerText = items[winnerIdx] ?? items[0];
        const color = slices[winnerIdx]?.color ?? "#F7DC6F";
        setIsSpinning(false);
        announceWinner(winnerText, color);
    }, [announceWinner, items, slices]);

    const startPhysics = useCallback(
        (initialVelocity: number, tau: number) => {
            stopPhysics();
            velocityRef.current = initialVelocity;
            tauRef.current = tau;
            lastFrameTimeRef.current = 0;
            setWinner(null);
            setWinnerColor(null);
            setShowDialog(false);
            setIsSpinning(true);

            const tick = (now: number) => {
                if (lastFrameTimeRef.current === 0) {
                    lastFrameTimeRef.current = now;
                    rafRef.current = requestAnimationFrame(tick);
                    return;
                }
                const dt = Math.min(
                    (now - lastFrameTimeRef.current) / 1000,
                    0.05,
                );
                lastFrameTimeRef.current = now;

                // Exponential friction: v(t+dt) = v(t) * exp(-dt / τ)
                velocityRef.current *= Math.exp(-dt / tauRef.current);
                currentRotationRef.current += velocityRef.current * dt;
                setRotation(currentRotationRef.current);

                if (Math.abs(velocityRef.current) < STOP_VELOCITY) {
                    rafRef.current = null;
                    finishSpin();
                    return;
                }
                rafRef.current = requestAnimationFrame(tick);
            };

            rafRef.current = requestAnimationFrame(tick);
        },
        [finishSpin, stopPhysics],
    );

    // Handle button spin — inject a random initial velocity matching the preset
    const handleSpin = useCallback(() => {
        if (!canSpin) return;
        const v =
            selectedSpeed.minV +
            Math.random() * (selectedSpeed.maxV - selectedSpeed.minV);
        startPhysics(v, selectedSpeed.tau);
    }, [canSpin, selectedSpeed, startPhysics]);

    // ── Drag-to-spin handlers ──────────────────────────────────────────────
    const getPointerAngleDeg = (clientX: number, clientY: number): number => {
        const { x, y } = wheelCenterRef.current;
        return (Math.atan2(clientY - y, clientX - x) * 180) / Math.PI;
    };

    /** Shortest signed delta between two angles in degrees, result in (-180, 180]. */
    const shortestAngleDelta = (from: number, to: number): number => {
        return ((((to - from) % 360) + 540) % 360) - 180;
    };

    const handleWheelPointerDown = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (items.length < 2) return;
            // Only primary pointer (ignore multi-touch secondary fingers)
            if (activePointerIdRef.current !== null) return;

            const target = e.currentTarget;
            const rect = target.getBoundingClientRect();
            wheelCenterRef.current = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
            };

            // Grab the wheel — halt any in-flight physics
            stopPhysics();
            setShowDialog(false);

            try {
                target.setPointerCapture(e.pointerId);
            } catch {
                /* pointer capture may be unavailable; drag still works */
            }

            activePointerIdRef.current = e.pointerId;
            isDraggingRef.current = true;
            setIsDragging(true);
            setIsSpinning(true);
            lastPointerAngleRef.current = getPointerAngleDeg(
                e.clientX,
                e.clientY,
            );
            dragStartRotationRef.current = currentRotationRef.current;
            dragSamplesRef.current = [
                {
                    rotation: currentRotationRef.current,
                    time: e.timeStamp,
                },
            ];
        },
        [items.length, stopPhysics],
    );

    const handleWheelPointerMove = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current) return;
            if (e.pointerId !== activePointerIdRef.current) return;

            const a = getPointerAngleDeg(e.clientX, e.clientY);
            const delta = shortestAngleDelta(
                lastPointerAngleRef.current,
                a,
            );
            lastPointerAngleRef.current = a;

            currentRotationRef.current += delta;
            setRotation(currentRotationRef.current);

            const samples = dragSamplesRef.current;
            samples.push({
                rotation: currentRotationRef.current,
                time: e.timeStamp,
            });
            // Keep a rolling window of the last ~150ms
            while (
                samples.length > 2 &&
                e.timeStamp - samples[0].time > 150
            ) {
                samples.shift();
            }
        },
        [],
    );

    const handleWheelPointerUp = useCallback(
        (e: React.PointerEvent<HTMLDivElement>) => {
            if (!isDraggingRef.current) return;
            if (e.pointerId !== activePointerIdRef.current) return;

            isDraggingRef.current = false;
            setIsDragging(false);
            activePointerIdRef.current = null;

            try {
                if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                }
            } catch {
                /* ignore */
            }

            // Compute release velocity from the most recent ~100ms of samples
            const samples = dragSamplesRef.current;
            const now = e.timeStamp;
            const recent = samples.filter((s) => now - s.time <= 100);
            let velocity = 0;
            if (recent.length >= 2) {
                const first = recent[0];
                const last = recent[recent.length - 1];
                const dt = last.time - first.time;
                if (dt > 0) {
                    velocity =
                        ((last.rotation - first.rotation) / dt) * 1000;
                }
            }
            velocity = Math.max(
                -MAX_FLICK_VELOCITY,
                Math.min(MAX_FLICK_VELOCITY, velocity),
            );

            if (Math.abs(velocity) < STOP_VELOCITY) {
                // Released too slowly — no spin, no winner announcement.
                setIsSpinning(false);
                return;
            }
            startPhysics(velocity, selectedSpeed.tau);
        },
        [selectedSpeed, startPhysics],
    );

    // Cleanup rAF on unmount
    useEffect(() => {
        return () => stopPhysics();
    }, [stopPhysics]);

    // Toggle fullscreen using the component's state (fake fullscreen for better compatibility and dialog support)
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen((prev) => !prev);
    }, []);

    // Handle escape key to exit fullscreen
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isFullscreen) {
                setIsFullscreen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isFullscreen]);

    // Prevent scrolling when in fullscreen
    useEffect(() => {
        if (isFullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isFullscreen]);

    return (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
            {/* ── Left Panel: Controls ─────────────────────────────── */}
            <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0">
                <ToolPanel padding="md">
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
                </ToolPanel>

                <ToolPanel padding="md">
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                        ✏️ Danh sách mục (mỗi dòng = 1 mục)
                    </label>
                    <Textarea
                        id="items-textarea"
                        value={itemsText}
                        onChange={(e) => updateItems(e.target.value)}
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
                </ToolPanel>
            </div>

            {/* ── Right Panel: Wheel ──────────────────────────────── */}
            <div
                id="wheel-pannel-main"
                className={cn(
                    "flex flex-1 flex-col items-center gap-5 transition-all duration-300",
                    isFullscreen &&
                    "fixed inset-0 z-40 flex h-screen w-screen animate-in fade-in zoom-in-95 items-center justify-center bg-background/98 p-6 backdrop-blur-md lg:p-10",
                )}
            >
                {isFullscreen && (
                    <Button
                        id="close-fullscreen-btn"
                        variant="ghost"
                        size="icon"
                        className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground"
                        onClick={() => setIsFullscreen(false)}
                    >
                        <X className="size-6" />
                    </Button>
                )}

                <div
                    id="wheel-container"
                    className={cn(
                        "relative",
                        !isFullscreen && "rounded-2xl border border-border bg-card p-5 shadow-lg",
                    )}
                >
                    <WheelSVG
                        id="lucky-wheel-svg"
                        slices={slices}
                        rotation={rotation}
                        isSpinning={isSpinning}
                        isDragging={isDragging}
                        canInteract={items.length >= 2}
                        onPointerDown={handleWheelPointerDown}
                        onPointerMove={handleWheelPointerMove}
                        onPointerUp={handleWheelPointerUp}
                        className={
                            isFullscreen
                                ? "h-[min(78vh,92vw)] w-[min(78vh,92vw)]"
                                : "h-[300px] w-[300px] sm:h-[400px] sm:w-[400px]"
                        }
                    />

                    {/* Maximize button — hidden in fullscreen (X button handles exit) */}
                    {!isFullscreen && (
                        <Button
                            id="maximize-btn"
                            variant="ghost"
                            size="icon-sm"
                            onClick={toggleFullscreen}
                            className="absolute right-2 top-2 z-30 text-muted-foreground hover:text-foreground"
                            title="Xem toàn màn hình"
                        >
                            <Maximize className="size-4" />
                        </Button>
                    )}
                </div>

                {/* Spin button */}
                <Button
                    onClick={handleSpin}
                    disabled={!canSpin}
                    size="lg"
                    id="spin-btn"
                    className={cn(
                        "relative gap-2 px-10 text-lg font-bold shadow-lg transition-all hover:scale-105 active:scale-95 disabled:hover:scale-100",
                        isFullscreen && "h-16 px-16 text-2xl shadow-2xl",
                    )}
                >
                    {isSpinning ? (
                        <>
                            <Fan className={cn("animate-spin size-5", isFullscreen && "size-7")} />
                            Đang quay…
                        </>
                    ) : (
                        <>
                            <PartyPopper
                                className={cn("size-5", isFullscreen && "size-7")}
                            />
                            QUAY
                        </>
                    )}
                </Button>

                {/* Speed selector */}
                <div
                    id="speed-selector"
                    className={cn(
                        "flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm",
                        isFullscreen && "scale-125 shadow-lg",
                    )}
                >
                    {SPEED_PRESETS.map((preset) => {
                        const Icon = preset.icon;
                        const isActive = speedId === preset.id;
                        return (
                            <button
                                key={preset.id}
                                id={`speed-btn-${preset.id}`}
                                name={`speed-${preset.id}`}
                                onClick={() => setSpeedId(preset.id)}
                                disabled={isSpinning}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-sm"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    isFullscreen && "px-4 py-2 text-sm",
                                )}
                            >
                                <Icon
                                    className={cn(
                                        "size-3.5",
                                        isFullscreen && "size-4",
                                    )}
                                />
                                {preset.label}
                            </button>
                        );
                    })}
                </div>

                <p
                    className={cn(
                        "text-xs text-muted-foreground",
                        isFullscreen && "mt-4 text-sm",
                    )}
                >
                    Mũi tên đỏ chỉ vào mục được chọn
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
                            className="break-words text-3xl font-extrabold"
                            style={{ color: winnerColor ?? undefined }}
                        >
                            {winner}
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            id="next-spin-btn"
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
