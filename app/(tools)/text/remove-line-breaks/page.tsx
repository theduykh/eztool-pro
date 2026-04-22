import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { RemoveLineBreaksClient } from "./RemoveLineBreaksClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "remove-line-breaks")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function RemoveLineBreaksPage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <RemoveLineBreaksClient />
        </div>
    );
}
