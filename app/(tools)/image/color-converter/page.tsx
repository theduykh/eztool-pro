import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { ColorConverterClient } from "./ColorConverterClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "color-converter")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function ColorConverterPage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <ColorConverterClient />
        </div>
    );
}
