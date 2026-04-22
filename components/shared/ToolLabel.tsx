import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "muted" | "accent" | "danger" | "success";

interface ToolLabelProps extends Omit<ComponentPropsWithoutRef<"label">, "children"> {
    children: ReactNode;
    icon?: ReactNode;
    tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
    default: "text-muted-foreground",
    muted: "text-muted-foreground/70",
    accent: "text-blue-600 dark:text-blue-400",
    danger: "text-red-500",
    success: "text-emerald-500",
};

export function ToolLabel({
    children,
    icon,
    tone = "default",
    className,
    ...rest
}: ToolLabelProps) {
    return (
        <label
            className={cn(
                "flex items-center gap-2 text-xs font-bold uppercase tracking-widest",
                toneClasses[tone],
                className,
            )}
            {...rest}
        >
            {icon}
            <span>{children}</span>
        </label>
    );
}
