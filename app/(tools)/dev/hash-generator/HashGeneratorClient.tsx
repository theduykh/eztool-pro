"use client";

import { useState, useCallback, useEffect } from "react";
import { Copy, Check, Trash2, Zap, ShieldCheck, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolPanel } from "@/components/shared/ToolPanel";
import { ToolLabel } from "@/components/shared/ToolLabel";
import { ToolInfoBox } from "@/components/shared/ToolInfoBox";
import { ToolToggle } from "@/components/shared/ToolToggle";
import { generateHash, type HashAlgorithm } from "@/lib/math/hash";
import { cn } from "@/lib/utils";

const ALGORITHMS: { id: HashAlgorithm; label: string; desc: string }[] = [
    { id: "md5", label: "MD5", desc: "Mã băm 128-bit (Dùng phổ biến để kiểm tra tính toàn vẹn file)" },
    { id: "sha1", label: "SHA-1", desc: "Mã băm 160-bit (Tiêu chuẩn cũ, không khuyến nghị cho bảo mật cao)" },
    { id: "sha256", label: "SHA-256", desc: "Mã băm 256-bit (Rất an toàn, tiêu chuẩn hiện đại cho SSL/Blockchain)" },
    { id: "sha512", label: "SHA-512", desc: "Mã băm 512-bit (Cực kỳ an toàn, dùng cho các ứng dụng yêu cầu bảo mật tối đa)" },
];

export function HashGeneratorClient() {
    const [input, setInput] = useState("");
    const [isUpper, setIsUpper] = useState(false);
    const [hashes, setHashes] = useState<Record<string, string>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const updateHashes = useCallback((text: string) => {
        if (!text) {
            setHashes({});
            return;
        }

        const results: Record<string, string> = {};
        ALGORITHMS.forEach((alg) => {
            try {
                results[alg.id] = generateHash(text, alg.id);
            } catch {
                results[alg.id] = "Error";
            }
        });
        setHashes(results);
    }, []);

    useEffect(() => {
        updateHashes(input);
    }, [input, updateHashes]);

    const handleCopy = async (id: string, value: string) => {
        const textToCopy = isUpper ? value.toUpperCase() : value.toLowerCase();
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleClear = () => {
        setInput("");
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <ToolLabel>Dữ liệu đầu vào</ToolLabel>
                    <div className="flex items-center gap-4">
                        <ToolToggle
                            id="toggle-upper"
                            checked={isUpper}
                            onChange={setIsUpper}
                            label={
                                <>
                                    <Type className="size-3.5" />
                                    Chữ hoa
                                </>
                            }
                        />
                        <Button
                            id="btn-clear"
                            variant="ghost"
                            size="sm"
                            onClick={handleClear}
                            className="h-8 gap-1.5 text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                            <Trash2 className="size-3.5" />
                            Xóa
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <textarea
                        id="input-hash"
                        className="h-32 w-full resize-none rounded-2xl border border-border bg-card p-4 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Nhập văn bản cần tạo mã băm tại đây..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="pointer-events-none absolute bottom-4 right-4 text-xs text-muted-foreground">
                        {input.length} ký tự
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <ToolLabel icon={<ShieldCheck className="size-4" />}>Kết quả mã băm</ToolLabel>

                <div className="grid grid-cols-1 gap-3">
                    {ALGORITHMS.map((alg) => {
                        const value = hashes[alg.id] || "";
                        const displayValue = isUpper ? value.toUpperCase() : value.toLowerCase();
                        const isCopied = copiedId === alg.id;

                        return (
                            <ToolPanel
                                key={alg.id}
                                id={`hash-${alg.id}`}
                                padding="md"
                                className="group transition-all hover:border-blue-500/30 hover:shadow-md dark:hover:bg-blue-500/5"
                            >
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {alg.label}
                                            </span>
                                            <span className="hidden text-[10px] text-muted-foreground sm:inline-block">
                                                {alg.desc}
                                            </span>
                                        </div>
                                        <Button
                                            id={`btn-copy-${alg.id}`}
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopy(alg.id, value)}
                                            disabled={!value}
                                            className={cn(
                                                "h-8 gap-2 rounded-lg transition-all",
                                                isCopied
                                                    ? "border-green-500 bg-green-500/5 text-green-500"
                                                    : "hover:bg-accent",
                                            )}
                                        >
                                            {isCopied ? (
                                                <>
                                                    <Check className="size-3.5" />
                                                    <span className="text-xs">Đã chép</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    <span className="text-xs">Sao chép</span>
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                    <p
                                        className={cn(
                                            "break-all font-mono text-sm leading-relaxed",
                                            value ? "text-foreground" : "italic text-muted-foreground/30",
                                        )}
                                    >
                                        {displayValue || `Chưa có dữ liệu ${alg.label}...`}
                                    </p>
                                </div>
                            </ToolPanel>
                        );
                    })}
                </div>
            </div>

            <ToolInfoBox
                tone="accent"
                icon={<Zap className="size-5 text-blue-500" />}
                title="Mẹo sử dụng:"
            >
                <ul className="list-inside list-disc space-y-1">
                    <li>Mã băm là một chiều, không thể &quot;giải băm&quot; (de-hash) để lấy lại văn bản gốc.</li>
                    <li>
                        Chúng tôi xử lý mọi dữ liệu 100% trên trình duyệt của bạn (Client-side), dữ liệu không bao giờ được
                        gửi lên máy chủ.
                    </li>
                    <li>
                        Sử dụng <strong>SHA-256</strong> hoặc <strong>SHA-512</strong> cho các nhu cầu bảo mật dữ liệu nhạy
                        cảm.
                    </li>
                </ul>
            </ToolInfoBox>
        </div>
    );
}
