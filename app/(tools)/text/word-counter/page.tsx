import type { Metadata } from "next";
import { WordCounterClient } from "./WordCounterClient";
import { TOOLS_DIRECTORY } from "@/config/tools";

const tool = TOOLS_DIRECTORY.find((t) => t.id === "word-counter")!;

export const metadata: Metadata = {
    title: `${tool.name} - eztool.pro`,
    description: tool.description,
};

export default function WordCounterPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                    {tool.name}
                </h1>
                <p className="mt-2 text-muted-foreground">
                    {tool.description}
                </p>
            </div>

            <WordCounterClient />
        </div>
    );
}
