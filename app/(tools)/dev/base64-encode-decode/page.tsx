import { Metadata } from "next";
import { Base64EncodeDecodeClient } from "./Base64EncodeDecodeClient";

export const metadata: Metadata = {
    title: "Base64 Encode/Decode - Mã hóa và giải mã Base64",
    description:
        "Công cụ mã hóa văn bản sang Base64 hoặc giải mã chuỗi Base64 về dạng văn bản gốc. Hỗ trợ đầy đủ tiếng Việt và ký tự đặc biệt.",
};

export default function Base64EncodeDecodePage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Base64 Encode/Decode</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Chuyển đổi dữ liệu văn bản sang định dạng Base64 và ngược lại một cách nhanh chóng và an toàn.
                </p>
            </div>

            <Base64EncodeDecodeClient />
        </div>
    );
}
