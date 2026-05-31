"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
    Link2,
    Link2Off,
    ArrowLeftRight,
    Trash2,
    ClipboardPaste,
    Copy,
    Check,
    AlertCircle,
    Zap,
    GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import {
    ResizablePanelGroup,
    ResizablePanel,
    ResizableHandle,
} from "@/components/ui/resizable";
import { encodeUrl, decodeUrl } from "@/lib/string/url-codec";
import { cn } from "@/lib/utils";

export function URLEncodeDecodeClient() {
    const t = useTranslations("toolUI.url-encode-decode");
    const tc = useTranslations("toolCommon");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [isAuto, setIsAuto] = useState(true);
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const convert = useCallback(
        (text: string, currentMode: "encode" | "decode") => {
            if (!text) {
                setOutput("");
                setError(null);
                return;
            }
            try {
                const result = currentMode === "encode" ? encodeUrl(text) : decodeUrl(text);
                setOutput(result);
                setError(null);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : tc("errorGeneric"));
                setOutput("");
            }
        },
        [tc],
    );

    useEffect(() => {
        if (isAuto) convert(input, mode);
    }, [input, mode, isAuto, convert]);

    const handleModeClick = useCallback(
        (newMode: "encode" | "decode") => {
            setMode(newMode);
            convert(input, newMode);
        },
        [input, convert],
    );

    const handlePaste = useCallback(async () => {
        try {
            const text = await navigator.clipboard.readText();
            setInput(text);
            convert(text, mode);
        } catch {
            /* clipboard blocked */
        }
    }, [mode, convert]);

    const handleCopy = useCallback(async () => {
        if (!output || error) return;
        try {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const el = document.getElementById("output-url") as HTMLTextAreaElement | null;
            if (el) {
                el.select();
                document.execCommand("copy");
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        }
    }, [output, error]);

    const handleSwap = useCallback(() => {
        const newMode = mode === "encode" ? "decode" : "encode";
        setMode(newMode);
        setInput(output);
        setOutput("");
        setError(null);
    }, [mode, output]);

    const handleClear = useCallback(() => {
        setInput("");
        setOutput("");
        setError(null);
    }, []);

    const outputText = error ? `❌ ${tc("errorLabel")}:\n${error}` : output;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <Button
                    id="btn-encode"
                    onClick={() => handleModeClick("encode")}
                    variant={mode === "encode" ? "default" : "outline"}
                    size="lg"
                >
                    <Link2 data-icon="inline-start" />
                    {tc("encode")}
                </Button>
                <Button
                    id="btn-decode"
                    onClick={() => handleModeClick("decode")}
                    variant={mode === "decode" ? "default" : "outline"}
                    size="lg"
                >
                    <Link2Off data-icon="inline-start" />
                    {tc("decode")}
                </Button>

                <div className="ml-auto flex items-center gap-1">
                    <button
                        onClick={() => setIsAuto((v) => !v)}
                        className={cn(
                            "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
                            isAuto
                                ? "bg-accent text-foreground"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                        title={isAuto ? tc("disableAuto") : tc("enableAuto")}
                    >
                        <Zap
                            className={cn("size-4", isAuto && "fill-yellow-400 text-yellow-500")}
                        />
                        {tc("auto")}
                    </button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSwap}
                        title={tc("swap")}
                        disabled={!output || !!error}
                    >
                        <ArrowLeftRight className="size-4" />
                    </Button>
                    <Button
                        id="btn-clear"
                        variant="destructive"
                        size="lg"
                        onClick={handleClear}
                    >
                        <Trash2 data-icon="inline-start" />
                        {tc("clear")}
                    </Button>
                </div>
            </div>

            <ResizablePanelGroup orientation="horizontal" className="min-h-[200px] flex-1 md:min-h-[400px]">
                <ResizablePanel defaultSize={50} minSize={20}>
                <ToolPanel
                    padding="none"
                    className="h-full"
                    bodyClassName="h-full"
                    header={
                        <>
                            <ToolLabel>
                                {mode === "encode" ? t("plainUrl") : t("encodedUrl")}
                            </ToolLabel>
                            <button
                                id="btn-paste"
                                onClick={handlePaste}
                                className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                <ClipboardPaste className="mr-1 size-3.5" />
                                {tc("paste")}
                            </button>
                        </>
                    }
                >
                    <textarea
                        id="input-url"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50"
                        placeholder={
                            mode === "encode"
                                ? t("placeholderEncode")
                                : t("placeholderDecode")
                        }
                        spellCheck={false}
                    />
                </ToolPanel>
                </ResizablePanel>

                <ResizableHandle className="w-4 bg-transparent hover:bg-accent/50 active:bg-accent/70 transition-colors duration-150 cursor-col-resize data-[resize-handle-active]:bg-accent/70">
                    <div className="z-10 flex h-8 w-4 items-center justify-center rounded-sm border bg-border shadow-sm">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                    </div>
                </ResizableHandle>

                <ResizablePanel defaultSize={50} minSize={20}>
                <ToolPanel
                    padding="none"
                    className="h-full"
                    bodyClassName="h-full"
                    header={
                        <>
                            <div className="flex items-center gap-2">
                                <ToolLabel>
                                    {mode === "encode" ? t("safeUrl") : t("plainUrl")}
                                </ToolLabel>
                                {error && <AlertCircle className="size-3.5 text-destructive" />}
                            </div>
                            <button
                                id="btn-copy"
                                onClick={handleCopy}
                                className="flex items-center text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {copied ? (
                                    <>
                                        <Check className="mr-1 size-3.5 text-green-500" />
                                        {tc("copied")}
                                    </>
                                ) : (
                                    <>
                                        <Copy className="mr-1 size-3.5" />
                                        {tc("copy")}
                                    </>
                                )}
                            </button>
                        </>
                    }
                >
                    <textarea
                        id="output-url"
                        value={outputText}
                        readOnly
                        className={cn(
                            "h-full w-full resize-none bg-muted/20 p-4 font-mono text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50",
                            error ? "text-destructive" : "text-foreground",
                        )}
                        placeholder={tc("resultPlaceholder")}
                        spellCheck={false}
                    />
                </ToolPanel>
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
