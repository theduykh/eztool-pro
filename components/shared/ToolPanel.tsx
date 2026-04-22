import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "subtle" | "dashed" | "accent";
type Padding = "none" | "sm" | "md" | "lg";
type Radius = "md" | "lg";

interface ToolPanelProps {
    children: ReactNode;
    /** header row shown inside the panel's top border; use for labels + inline actions */
    header?: ReactNode;
    /** card visual style */
    tone?: Tone;
    /** padding around children (panel body) */
    padding?: Padding;
    /** border radius scale */
    radius?: Radius;
    /** extra classes applied to the outer wrapper */
    className?: string;
    /** classes applied to the body wrapper (inner padding container) */
    bodyClassName?: string;
    id?: string;
}

const toneClasses: Record<Tone, string> = {
    default: "border-border bg-card shadow-sm",
    subtle: "border-border bg-card/30",
    dashed: "border-dashed border-border bg-card/30",
    accent: "border-blue-500/20 bg-blue-500/5",
};

const paddingClasses: Record<Padding, string> = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
};

const radiusClasses: Record<Radius, string> = {
    md: "rounded-2xl",
    lg: "rounded-3xl",
};

export function ToolPanel({
    children,
    header,
    tone = "default",
    padding = "md",
    radius = "md",
    className,
    bodyClassName,
    id,
}: ToolPanelProps) {
    return (
        <div
            id={id}
            className={cn(
                "flex flex-col overflow-hidden border",
                radiusClasses[radius],
                toneClasses[tone],
                className,
            )}
        >
            {header ? (
                <div className="flex h-10 flex-shrink-0 items-center justify-between gap-2 border-b border-border bg-muted/50 px-3">
                    {header}
                </div>
            ) : null}
            <div className={cn(paddingClasses[padding], header ? "flex-1 min-h-0" : undefined, bodyClassName)}>
                {children}
            </div>
        </div>
    );
}
