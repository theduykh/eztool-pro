import { Metadata } from "next";
import { SvgPlaceholderClient } from "./SvgPlaceholderClient";

export const metadata: Metadata = {
    title: "Tạo SVG Placeholder - Ảnh giả lập cho Web",
    description:
        "Công cụ tạo ảnh placeholder SVG tùy chỉnh kích thước, màu sắc và văn bản. Cực kỳ nhẹ và dễ dàng sử dụng cho bản thiết kế web của bạn.",
};

export default function SvgPlaceholderPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Tạo SVG Placeholder</h1>
                <p className="text-muted-foreground">
                    Tạo các hình ảnh giả lập (placeholder) định dạng SVG với tùy chọn màu sắc và kích thước linh hoạt, không lo bị vỡ hình.
                </p>
            </div>

            <SvgPlaceholderClient />
        </div>
    );
}
