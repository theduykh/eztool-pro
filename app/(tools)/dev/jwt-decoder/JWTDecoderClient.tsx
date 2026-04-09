"use client";

import { useState, useCallback, useEffect } from "react";
import { 
    Copy, 
    Check, 
    Trash2, 
    Shield, 
    FileJson, 
    Key,
    AlertCircle,
    Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { decodeJWT, type JWTDecoded } from "@/lib/string/jwt";
import { cn } from "@/lib/utils";

export function JWTDecoderClient() {
    const [token, setToken] = useState("");
    const [decoded, setDecoded] = useState<JWTDecoded | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copiedSection, setCopiedSection] = useState<string | null>(null);

    const handleDecode = useCallback((input: string) => {
        if (!input) {
            setDecoded(null);
            setError(null);
            return;
        }

        try {
            const result = decodeJWT(input.trim());
            setDecoded(result);
            setError(null);
        } catch (e: any) {
            setError(e.message || "Token không hợp lệ");
            setDecoded(null);
        }
    }, []);

    useEffect(() => {
        handleDecode(token);
    }, [token, handleDecode]);

    const handleCopy = async (section: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSection(section);
            setTimeout(() => setCopiedSection(null), 2000);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    const handleClear = () => {
        setToken("");
        setDecoded(null);
        setError(null);
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Input Section */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        Nhập JWT Token
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
                <div className="relative">
                    <textarea
                        className={cn(
                            "h-32 w-full resize-none rounded-2xl border border-border bg-card p-4 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all",
                            error && "border-destructive/50 bg-destructive/5"
                        )}
                        placeholder="Paste your token here (header.payload.signature)..."
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
                    {error && (
                        <div className="absolute inset-x-0 -bottom-10 flex items-center gap-2 p-2 text-xs text-destructive">
                            <AlertCircle className="size-3.5" />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Decoded Results */}
            <div className={cn(
                "grid grid-cols-1 gap-6 lg:grid-cols-2 mt-4",
                !decoded && "opacity-40 grayscale pointer-events-none"
            )}>
                {/* Header Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500">
                            <Shield className="size-4" />
                            Header (ALGORITHM & TOKEN TYPE)
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy("header", JSON.stringify(decoded?.header, null, 2))}
                            disabled={!decoded}
                            className="h-8 size-8 p-0"
                            title="Copy Header JSON"
                        >
                            {copiedSection === "header" ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                        </Button>
                    </div>
                    <pre className="h-64 overflow-auto rounded-2xl border border-red-500/20 bg-red-500/5 p-4 font-mono text-xs text-red-600 dark:text-red-400">
                        {decoded ? JSON.stringify(decoded.header, null, 2) : "// Header will appear here"}
                    </pre>
                </div>

                {/* Payload Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-blue-500">
                            <FileJson className="size-4" />
                            Payload (DATA / CLAIMS)
                        </div>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopy("payload", JSON.stringify(decoded?.payload, null, 2))}
                            disabled={!decoded}
                            className="h-8 size-8 p-0"
                            title="Copy Payload JSON"
                        >
                            {copiedSection === "payload" ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                        </Button>
                    </div>
                    <pre className="h-64 overflow-auto rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 font-mono text-xs text-blue-600 dark:text-blue-400">
                        {decoded ? JSON.stringify(decoded.payload, null, 2) : "// Payload will appear here"}
                    </pre>
                </div>

                {/* Signature Section (Span full width on large) */}
                <div className="flex flex-col gap-3 lg:col-span-2">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-500">
                            <Key className="size-4" />
                            Signature
                        </div>
                    </div>
                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                        <p className="break-all font-mono text-xs text-cyan-600 dark:text-cyan-400">
                            {decoded ? decoded.signature : "// Signature hash will appear here"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Instruction Box */}
            <div className="rounded-xl border border-border bg-card/50 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-2 font-semibold">
                    <Terminal className="size-5 text-blue-500" />
                    <span>Về công cụ này</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground">
                    <div>
                        <p className="font-medium text-foreground mb-2">Không cần Secret</p>
                        <p>JWT chỉ được mã hóa Base64Url để truyền tải, bất kỳ ai cũng có thể giải mã để xem nội dung mà không cần khóa bí mật.</p>
                    </div>
                    <div>
                        <p className="font-medium text-foreground mb-2">An toàn tuyệt đối</p>
                        <p>Mọi quá trình giải mã diễn ra 100% trong trình duyệt của bạn. Token không bao giờ được gửi lên Server của chúng tôi.</p>
                    </div>
                    <div>
                        <p className="font-medium text-foreground mb-2">Xác thực Token</p>
                        <p>Công cụ này tập trung vào việc hiển thị dữ liệu ("Inspect"). Để xác thực tính hợp lệ, bạn cần khóa bí mật (Secret/Key).</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
