import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { buildAlternates } from "@/lib/seo/alternates";
import { LuckyWheelClient } from "./LuckyWheelClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "lucky-wheel")!;

type LocaleParams = { params: Promise<{ locale: string }> };

export async function generateMetadata({
    params,
}: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "tools" });
    return {
        title: t(`${tool.id}.name`),
        description: t(`${tool.id}.description`),
        alternates: buildAlternates(locale, tool.path),
    };
}

export default async function LuckyWheelPage({ params }: LocaleParams) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("tools");

    return (
        <div className="flex h-full flex-col">
            <PageHeader
                title={t(`${tool.id}.name`)}
                description={t(`${tool.id}.description`)}
            />
            <LuckyWheelClient />
        </div>
    );
}
