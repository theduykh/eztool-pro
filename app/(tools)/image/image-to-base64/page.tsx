import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { ImageToBase64Client } from "./ImageToBase64Client";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "image-to-base64")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function ImageToBase64Page() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <ImageToBase64Client />
        </div>
    );
}
