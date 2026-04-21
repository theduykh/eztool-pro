import { Metadata } from "next";
import { URLEncodeDecodeClient } from "./URLEncodeDecodeClient";

export const metadata: Metadata = {
    title: "URL Encode/Decode - Mã hóa và giải mã URL trực tuyến",
    description:
        "Công cụ mã hóa URL (Percent Encoding) để gán vào tham số truy vấn hoặc giải mã các URL đã được mã hóa về định dạng dễ đọc nhất.",
};

export default function URLEncodeDecodePage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">URL Encode/Decode</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Mã hóa URL an toàn hoặc giải mã URL về dạng dễ đọc nhất. Hỗ trợ xử lý tham số truy vấn và ký tự tiếng Việt.
                </p>
            </div>

            <URLEncodeDecodeClient />
        </div>
    );
}
