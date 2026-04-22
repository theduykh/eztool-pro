import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { Base64EncodeDecodeClient } from "./Base64EncodeDecodeClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "base64-encode-decode")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function Base64EncodeDecodePage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <Base64EncodeDecodeClient />
        </div>
    );
}
