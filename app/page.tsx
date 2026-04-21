import Link from "next/link";
import {
    Code,
    ArrowLeftRight,
    Link2,
    KeyRound,
    Hash,
    FileText,
    CaseSensitive,
    TextCursorInput,
    Pilcrow,
    RemoveFormatting,
    Percent,
    Activity,
    Dices,
    Ruler,
    Scale,
    QrCode,
    Palette,
    FileImage,
    RectangleHorizontal,
    Maximize2,
    ArrowRight,
    Flame,
    Sparkles,
    type LucideIcon,
} from "lucide-react";
import { TOOLS_DIRECTORY, type ToolItem } from "@/config/tools";

const TOOL_ICON_MAP: Record<string, LucideIcon> = {
    "json-formatter": Code,
    "base64-encode-decode": ArrowLeftRight,
    "url-encode-decode": Link2,
    "jwt-decoder": KeyRound,
    "hash-generator": Hash,
    "word-counter": FileText,
    "case-converter": CaseSensitive,
    "text-to-slug": TextCursorInput,
    "lorem-ipsum": Pilcrow,
    "remove-line-breaks": RemoveFormatting,
    "percentage-calculator": Percent,
    "bmi-calculator": Activity,
    "random-number": Dices,
    "unit-converter": Ruler,
    "rule-of-three": Scale,
    "qr-generator": QrCode,
    "color-converter": Palette,
    "image-to-base64": FileImage,
    "svg-placeholder": RectangleHorizontal,
    "image-resizer": Maximize2,
};

function ToolCard({ tool }: { tool: ToolItem }) {
    const Icon = TOOL_ICON_MAP[tool.id] ?? Code;
    return (
        <Link
            href={tool.path}
            className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-blue-500/40 hover:shadow-md"
        >
            {/* Badges */}
            <div className="absolute right-3 top-3 flex gap-1">
                {tool.isHot && (
                    <span className="rounded bg-orange-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                        Hot
                    </span>
                )}
                {tool.isNew && (
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        New
                    </span>
                )}
            </div>

            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Icon className="size-4.5" />
            </div>

            <div>
                <h3 className="font-semibold text-foreground">{tool.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
            </div>

            <span className="mt-auto inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                Mở công cụ
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </span>
        </Link>
    );
}

function Section({
    title,
    icon,
    tools,
}: {
    title: string;
    icon: React.ReactNode;
    tools: ToolItem[];
}) {
    if (tools.length === 0) return null;
    return (
        <section className="w-full">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                {icon}
                {title}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                ))}
            </div>
        </section>
    );
}

export default function Home() {
    const hotTools = TOOLS_DIRECTORY.filter((t) => t.isHot);
    const newTools = TOOLS_DIRECTORY.filter((t) => t.isNew);

    return (
        <div className="flex flex-col gap-12 py-8">
            {/* Hero */}
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    eztool<span className="text-blue-600 dark:text-blue-400">.pro</span>
                </h1>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                    Bộ công cụ tiện ích siêu tốc dành cho lập trình viên và người dùng
                    hàng ngày. Nhanh chóng, chính xác, không quảng cáo.
                </p>
            </div>

            <Section
                title="Đang hot"
                icon={<Flame className="size-5 text-orange-500" />}
                tools={hotTools}
            />

            <Section
                title="Mới nhất"
                icon={<Sparkles className="size-5 text-blue-500" />}
                tools={newTools}
            />
        </div>
    );
}
