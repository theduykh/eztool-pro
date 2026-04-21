import { Metadata } from "next";
import { ColorConverterClient } from "./ColorConverterClient";

export const metadata: Metadata = {
    title: "Chuyển đổi HEX / RGB / HSL - Công cụ chọn màu",
    description:
        "Công cụ chuyển đổi và chọn màu sắc chuyên nghiệp. Hỗ trợ HEX, RGB, HSL, xem trước màu trực quan và gợi ý mã màu phổ biến cho lập trình viên.",
};

export default function ColorConverterPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Chuyển đổi màu sắc</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Chuyển đổi định dạng màu sắc linh hoạt, xem trước kết quả trực quan và khám phá các bảng màu phổ biến.
                </p>
            </div>

            <ColorConverterClient />
        </div>
    );
}
