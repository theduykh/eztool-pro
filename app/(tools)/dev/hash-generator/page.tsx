import { Metadata } from "next";
import { HashGeneratorClient } from "./HashGeneratorClient";

export const metadata: Metadata = {
    title: "Hash Generator - Tạo mã băm MD5, SHA-1, SHA-256",
    description:
        "Công cụ trực tuyến để tạo các mã băm (hash) bảo mật từ văn bản. Hỗ trợ MD5, SHA-1, SHA-256, SHA-512 nhanh chóng và an toàn.",
};

export default function HashGeneratorPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Hash Generator</h1>
                <p className="text-muted-foreground">
                    Tạo các mã băm bảo mật MD5, SHA-1, SHA-256 hoặc SHA-512 từ bất kỳ chuỗi văn bản nào. Toàn bộ logic được xử lý trực tiếp trên trình duyệt của bạn.
                </p>
            </div>

            <HashGeneratorClient />
        </div>
    );
}
