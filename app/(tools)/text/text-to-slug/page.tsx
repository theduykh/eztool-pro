import { Metadata } from "next";
import { TextToSlugClient } from "./TextToSlugClient";

export const metadata: Metadata = {
    title: "Tạo URL Slug - Chuyển tiêu đề thành link SEO",
    description:
        "Công cụ tạo URL Slug trực tuyến. Loại bỏ dấu tiếng Việt, ký tự đặc biệt và chuyển đổi tiêu đề bài viết thành đường dẫn (link) thân thiện với SEO.",
};

export default function TextToSlugPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tạo URL Slug</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Biến các tiêu đề hoặc đoạn văn bản có dấu thành đường dẫn URL không dấu, thân thiện với SEO và dễ dàng chia sẻ.
                </p>
            </div>

            <TextToSlugClient />
        </div>
    );
}
