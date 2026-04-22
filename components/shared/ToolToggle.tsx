"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolToggleProps {
    checked: boolean;
    onChange: (next: boolean) => void;
    label?: ReactNode;
    disabled?: boolean;
    id?: string;
    className?: string;
}

export function ToolToggle({
    checked,
    onChange,
    label,
    disabled,
    id,
    className,
}: ToolToggleProps) {
    return (
        <label
            className={cn(
                "inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                disabled && "cursor-not-allowed opacity-50 hover:text-muted-foreground",
                className,
            )}
        >
            <button
                type="button"
                role="switch"
                id={id}
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "flex h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                    checked ? "bg-blue-600" : "bg-muted",
                    disabled && "cursor-not-allowed",
                )}
            >
                <span
                    className={cn(
                        "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                        checked ? "translate-x-4" : "translate-x-0",
                    )}
                />
            </button>
            {label ? <span className="flex items-center gap-1">{label}</span> : null}
        </label>
    );
}
