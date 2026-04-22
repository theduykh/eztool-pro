import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { URLEncodeDecodeClient } from "./URLEncodeDecodeClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "url-encode-decode")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function URLEncodeDecodePage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <URLEncodeDecodeClient />
        </div>
    );
}
