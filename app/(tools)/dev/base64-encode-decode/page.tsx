import { Metadata } from "next";
import { Base64EncodeDecodeClient } from "./Base64EncodeDecodeClient";

export const metadata: Metadata = {
    title: "Base64 Encode/Decode - Mã hóa và giải mã Base64",
    description:
        "Công cụ mã hóa văn bản sang Base64 hoặc giải mã chuỗi Base64 về dạng văn bản gốc. Hỗ trợ đầy đủ tiếng Việt và ký tự đặc biệt.",
};

export default function Base64EncodeDecodePage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Base64 Encode/Decode</h1>
                <p className="text-muted-foreground">
                    Chuyển đổi dữ liệu văn bản sang định dạng Base64 và ngược lại một cách nhanh chóng và an toàn.
                </p>
            </div>

            <Base64EncodeDecodeClient />
        </div>
    );
}
