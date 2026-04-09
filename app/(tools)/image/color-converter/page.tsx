import { Metadata } from "next";
import { ColorConverterClient } from "./ColorConverterClient";

export const metadata: Metadata = {
    title: "Chuyển đổi HEX / RGB / HSL - Công cụ chọn màu",
    description:
        "Công cụ chuyển đổi và chọn màu sắc chuyên nghiệp. Hỗ trợ HEX, RGB, HSL, xem trước màu trực quan và gợi ý mã màu phổ biến cho lập trình viên.",
};

export default function ColorConverterPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Chuyển đổi màu sắc</h1>
                <p className="text-muted-foreground">
                    Chuyển đổi định dạng màu sắc linh hoạt, xem trước kết quả trực quan và khám phá các bảng màu phổ biến.
                </p>
            </div>

            <ColorConverterClient />
        </div>
    );
}
