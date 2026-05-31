"use client";

import { useState, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import {
    Upload,
    Image as ImageIcon,
    Copy,
    Check,
    Code,
    FileJson,
    Trash2,
    Info,
    Zap,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { toHtmlTag, toCssDataUri } from "@/lib/image/base64";
import { cn } from "@/lib/utils";

type Tab = { id: string; label: string; icon: LucideIcon };
const TABS: Tab[] = [
    { id: "datauri", label: "Data URI", icon: Zap },
    { id: "html", label: "HTML Tag", icon: Code },
    { id: "css", label: "CSS", icon: ImageIcon },
    { id: "raw", label: "Raw Base64", icon: FileJson },
];

export function ImageToBase64Client() {
    const t = useTranslations("toolUI.image-to-base64");
    const tc = useTranslations("toolCommon");

    const [image, setImage] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string>("");
    const [fileSize, setFileSize] = useState<number>(0);
    const [copied, setCopied] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string>("datauri");

    const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            alert(t("selectImageAlert"));
            return;
        }

        setFileName(file.name);
        setFileSize(file.size);

        const reader = new FileReader();
        reader.onload = (event) => {
            setImage(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleCopy = async (text: string, id: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(id);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleClear = () => {
        setImage(null);
        setFileName("");
        setFileSize(0);
    };

    const getOutput = () => {
        if (!image) return "";
        switch (activeTab) {
            case "datauri":
                return image;
            case "html":
                return toHtmlTag(image, fileName);
            case "css":
                return toCssDataUri(image);
            case "raw":
                return image.split(",")[1];
            default:
                return image;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            {!image ? (
                <label className="group relative flex h-72 w-full cursor-pointer flex-col items-center justify-center rounded-3xl border-4 border-dashed border-border bg-card transition-all hover:border-blue-500 hover:bg-blue-500/5">
                    <input
                        id="input-file"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={onFileChange}
                    />
                    <div className="flex flex-col items-center gap-4">
                        <div className="rounded-3xl bg-blue-500/10 p-5 text-blue-600 transition-transform group-hover:scale-110">
                            <Upload className="size-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold">{t("dragAndDropText")}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {t("supportedFormats")}
                            </p>
                        </div>
                    </div>
                </label>
            ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.5fr]">
                    <div className="flex flex-col gap-4">
                        <ToolLabel>{t("previewImage")}</ToolLabel>
                        <ToolPanel padding="md" className="relative min-h-[300px] shadow-inner" bodyClassName="flex items-center justify-center overflow-hidden">
                            <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] opacity-[0.03] [background-size:20px_20px]" />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                id="preview-image"
                                src={image}
                                alt="Preview"
                                className="relative max-h-64 rounded-lg object-contain shadow-lg"
                            />
                        </ToolPanel>
                        <Button
                            id="btn-clear"
                            variant="outline"
                            onClick={handleClear}
                            className="w-full gap-2 rounded-2xl hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-4" />
                            {t("deleteImage")}
                        </Button>

                        <ToolPanel padding="lg">
                            <ToolLabel icon={<Info className="size-4" />}>{t("fileInfo")}</ToolLabel>
                            <div className="mt-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                        {t("originalSize")}
                                    </p>
                                    <p id="stat-original-size" className="font-bold">
                                        {(fileSize / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                                        {t("base64Size")}
                                    </p>
                                    <p id="stat-base64-size" className="font-bold text-blue-600">
                                        {(getOutput().length / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center gap-2 rounded-xl border border-yellow-500/10 bg-yellow-500/5 p-3">
                                <Zap className="size-4 shrink-0 text-yellow-600" />
                                <p className="text-[10px] leading-tight text-yellow-700">
                                    {t("base64IncreaseNotice")}
                                </p>
                            </div>
                        </ToolPanel>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            id={`btn-tab-${tab.id}`}
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={cn(
                                                "flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                                                activeTab === tab.id
                                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                                    : "border border-border bg-card text-muted-foreground hover:bg-muted",
                                            )}
                                        >
                                            <Icon className="size-3.5" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="group relative">
                            <textarea
                                id="output-text"
                                value={getOutput()}
                                readOnly
                                className="h-[400px] w-full resize-none rounded-3xl border border-border bg-card p-6 font-mono text-sm leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                placeholder={t("placeholderOutput")}
                            />
                            <div className="absolute right-4 top-4">
                                <Button
                                    id="btn-copy"
                                    onClick={() => handleCopy(getOutput(), "main")}
                                    className={cn(
                                        "h-10 gap-2 rounded-xl transition-all",
                                        copied === "main"
                                            ? "bg-green-600 hover:bg-green-700"
                                            : "bg-blue-600 shadow-lg shadow-blue-500/20 hover:bg-blue-700",
                                    )}
                                >
                                    {copied === "main" ? (
                                        <>
                                            <Check className="size-4" />
                                            <span>{t("copied")}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="size-4" />
                                            <span>{t("copyCode")}</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <p className="px-4 text-xs text-muted-foreground">
                            {t("embedInstruction")}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
