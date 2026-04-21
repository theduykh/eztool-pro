import { Metadata } from "next";
import { LoremIpsumClient } from "./LoremIpsumClient";

export const metadata: Metadata = {
    title: "Tạo chữ giả Lorem Ipsum - Công cụ cho Designer",
    description:
        "Công cụ tạo văn bản mẫu Lorem Ipsum chuyên nghiệp. Tùy chỉnh số lượng từ, câu, đoạn văn hoặc ký tự để dùng trong thiết kế UI/UX và dàn trang web.",
};

export default function LoremIpsumPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tạo chữ giả (Lorem Ipsum)</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Tạo nhanh các đoạn văn bản giả để lấp đầy không gian thiết kế, giúp bạn hình dung bố cục trang web hoặc ứng dụng một cách dễ dàng.
                </p>
            </div>

            <LoremIpsumClient />
        </div>
    );
}
