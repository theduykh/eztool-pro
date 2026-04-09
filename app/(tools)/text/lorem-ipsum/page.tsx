import { Metadata } from "next";
import { LoremIpsumClient } from "./LoremIpsumClient";

export const metadata: Metadata = {
    title: "Tạo chữ giả Lorem Ipsum - Công cụ cho Designer",
    description:
        "Công cụ tạo văn bản mẫu Lorem Ipsum chuyên nghiệp. Tùy chỉnh số lượng từ, câu, đoạn văn hoặc ký tự để dùng trong thiết kế UI/UX và dàn trang web.",
};

export default function LoremIpsumPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Tạo chữ giả (Lorem Ipsum)</h1>
                <p className="text-muted-foreground">
                    Tạo nhanh các đoạn văn bản giả để lấp đầy không gian thiết kế, giúp bạn hình dung bố cục trang web hoặc ứng dụng một cách dễ dàng.
                </p>
            </div>

            <LoremIpsumClient />
        </div>
    );
}
