import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { TextToSlugClient } from "./TextToSlugClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "text-to-slug")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function TextToSlugPage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <TextToSlugClient />
        </div>
    );
}
