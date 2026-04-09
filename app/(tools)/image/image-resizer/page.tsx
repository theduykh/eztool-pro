import { Metadata } from "next";
import { ImageResizerClient } from "./ImageResizerClient";

export const metadata: Metadata = {
    title: "Thay đổi kích thước ảnh - Resize ảnh trực tuyến miễn phí",
    description:
        "Công cụ resize ảnh online nhanh chóng. Giảm kích thước ảnh, thay đổi độ phân giải mà vẫn giữ được chất lượng tốt nhất. Hỗ trợ JPG, PNG, WEBP.",
};

export default function ImageResizerPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Thay đổi kích thước ảnh</h1>
                <p className="text-muted-foreground">
                    Điều chỉnh chiều rộng, chiều cao và chất lượng hình ảnh của bạn một cách dễ dàng và nhanh chóng ngay trên trình duyệt.
                </p>
            </div>

            <ImageResizerClient />
        </div>
    );
}
