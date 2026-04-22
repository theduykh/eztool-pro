import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { SvgPlaceholderClient } from "./SvgPlaceholderClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "svg-placeholder")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function SvgPlaceholderPage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <SvgPlaceholderClient />
        </div>
    );
}
