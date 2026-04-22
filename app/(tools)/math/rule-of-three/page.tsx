import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { TOOLS_DIRECTORY } from "@/config/tools";
import { RuleOfThreeClient } from "./RuleOfThreeClient";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "rule-of-three")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function RuleOfThreePage() {
    return (
        <div className="flex h-full flex-col">
            <PageHeader title={tool.name} description={tool.description} />
            <RuleOfThreeClient />
        </div>
    );
}
