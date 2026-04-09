"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    Copy, 
    Check, 
    Trash2, 
    Fingerprint, 
    Zap,
    ShieldCheck,
    Type
} from "lucide-react";
import { Button } from "@/components/ui/button";
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

    // Generate all hashes
    const updateHashes = useCallback((text: string) => {
        if (!text) {
            setHashes({});
            return;
        }

        const results: Record<string, string> = {};
        ALGORITHMS.forEach((alg) => {
            try {
                results[alg.id] = generateHash(text, alg.id);
            } catch (e) {
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
            {/* Input Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Dữ liệu đầu vào
                    </label>
                    <div className="flex items-center gap-4">
                        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
                            <div 
                                className={cn(
                                    "flex h-5 w-9 items-center rounded-full bg-muted p-0.5 transition-colors",
                                    isUpper && "bg-blue-600"
                                )}
                                onClick={() => setIsUpper(!isUpper)}
                            >
                                <div 
                                    className={cn(
                                        "h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                                        isUpper ? "translate-x-4" : "translate-x-0"
                                    )}
                                />
                            </div>
                            <span className="flex items-center gap-1">
                                <Type className="size-3.5" />
                                Chữ hoa
                            </span>
                        </label>
                        <Button
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
                        className="h-32 w-full resize-none rounded-2xl border border-border bg-card p-4 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        placeholder="Nhập văn bản cần tạo mã băm tại đây..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-muted-foreground pointer-events-none">
                        {input.length} ký tự
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <ShieldCheck className="size-4" />
                    Kết quả mã băm
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                    {ALGORITHMS.map((alg) => {
                        const value = hashes[alg.id] || "";
                        const displayValue = isUpper ? value.toUpperCase() : value.toLowerCase();
                        const isCopied = copiedId === alg.id;

                        return (
                            <div 
                                key={alg.id}
                                className="group relative flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 transition-all hover:border-blue-500/30 hover:shadow-md dark:hover:bg-blue-500/5"
                            >
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
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCopy(alg.id, value)}
                                        disabled={!value}
                                        className={cn(
                                            "h-8 gap-2 rounded-lg transition-all",
                                            isCopied ? "border-green-500 text-green-500 bg-green-500/5" : "hover:bg-accent"
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
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 overflow-hidden">
                                        <p className={cn(
                                            "break-all font-mono text-sm leading-relaxed",
                                            value ? "text-foreground" : "text-muted-foreground/30 italic"
                                        )}>
                                            {displayValue || `Chưa có dữ liệu ${alg.label}...`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Hint Box */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 flex gap-3 items-start">
                <Zap className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Mẹo sử dụng:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Mã băm là một chiều, không thể "giải băm" (de-hash) để lấy lại văn bản gốc.</li>
                        <li>Chúng tôi xử lý mọi dữ liệu 100% trên trình duyệt của bạn (Client-side), dữ liệu không bao giờ được gửi lên máy chủ.</li>
                        <li>Sử dụng <strong>SHA-256</strong> hoặc <strong>SHA-512</strong> cho các nhu cầu bảo mật dữ liệu nhạy cảm.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
