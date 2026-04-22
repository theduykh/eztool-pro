import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "warning";

interface ToolInfoBoxProps {
    children: ReactNode;
    icon?: ReactNode;
    title?: ReactNode;
    tone?: Tone;
    className?: string;
}

const toneClasses: Record<Tone, string> = {
    neutral: "border-border bg-card/50 text-muted-foreground",
    accent: "border-blue-500/20 bg-blue-500/5 text-muted-foreground",
    warning: "border-amber-500/20 bg-amber-500/5 text-muted-foreground",
};

export function ToolInfoBox({
    children,
    icon,
    title,
    tone = "neutral",
    className,
}: ToolInfoBoxProps) {
    return (
        <div
            className={cn(
                "flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
                toneClasses[tone],
                className,
            )}
        >
            {icon ? <div className="mt-0.5 flex-shrink-0">{icon}</div> : null}
            <div className="flex-1 min-w-0">
                {title ? <p className="mb-1 font-semibold text-foreground">{title}</p> : null}
                {children}
            </div>
        </div>
    );
}
