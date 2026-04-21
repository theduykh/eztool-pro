import { Metadata } from "next";
import { ImageResizerClient } from "./ImageResizerClient";

export const metadata: Metadata = {
    title: "Thay đổi kích thước ảnh - Resize ảnh trực tuyến miễn phí",
    description:
        "Công cụ resize ảnh online nhanh chóng. Giảm kích thước ảnh, thay đổi độ phân giải mà vẫn giữ được chất lượng tốt nhất. Hỗ trợ JPG, PNG, WEBP.",
};

export default function ImageResizerPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Thay đổi kích thước ảnh</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Điều chỉnh chiều rộng, chiều cao và chất lượng hình ảnh của bạn một cách dễ dàng và nhanh chóng ngay trên trình duyệt.
                </p>
            </div>

            <ImageResizerClient />
        </div>
    );
}
