import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
import { Link } from "@/i18n/navigation";
import { TOOLS_DIRECTORY, type ToolItem } from "@/config/tools";
import { buildAlternates } from "@/lib/seo/alternates";

type Translator = Awaited<ReturnType<typeof getTranslations>>;
type LocaleParams = { params: Promise<{ locale: string }> };

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

export async function generateMetadata({
    params,
}: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    return {
        alternates: buildAlternates(locale, "/"),
    };
}

function ToolCard({ tool, t }: { tool: ToolItem; t: Translator }) {
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
                        {t("common.hot")}
                    </span>
                )}
                {tool.isNew && (
                    <span className="rounded bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                        {t("common.new")}
                    </span>
                )}
            </div>

            <div className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Icon className="size-4.5" />
            </div>

            <div>
                <h3 className="font-semibold text-foreground">
                    {t(`tools.${tool.id}.name`)}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    {t(`tools.${tool.id}.description`)}
                </p>
            </div>

            <span className="mt-auto inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400">
                {t("common.openTool")}
                <ArrowRight className="ml-1 size-4 transition-transform group-hover:translate-x-1" />
            </span>
        </Link>
    );
}

function Section({
    title,
    icon,
    tools,
    t,
}: {
    title: string;
    icon: React.ReactNode;
    tools: ToolItem[];
    t: Translator;
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
                    <ToolCard key={tool.id} tool={tool} t={t} />
                ))}
            </div>
        </section>
    );
}

export default async function Home({ params }: LocaleParams) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations();

    const hotTools = TOOLS_DIRECTORY.filter((tool) => tool.isHot);
    const newTools = TOOLS_DIRECTORY.filter((tool) => tool.isNew);

    return (
        <div className="flex flex-col gap-12 py-8">
            {/* Hero */}
            <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    eztool<span className="text-blue-600 dark:text-blue-400">.pro</span>
                </h1>
                <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                    {t("home.tagline")}
                </p>
            </div>

            <Section
                title={t("home.trending")}
                icon={<Flame className="size-5 text-orange-500" />}
                tools={hotTools}
                t={t}
            />

            <Section
                title={t("home.latest")}
                icon={<Sparkles className="size-5 text-blue-500" />}
                tools={newTools}
                t={t}
            />
        </div>
    );
}
