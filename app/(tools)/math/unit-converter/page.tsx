import { Metadata } from "next";
import { UnitConverterClient } from "./UnitConverterClient";

export const metadata: Metadata = {
    title: "Đổi đơn vị đo lường trực tuyến - Chuyển đổi chính xác",
    description:
        "Công cụ chuyển đổi đơn vị đo lường toàn diện. Hỗ trợ đổi Độ dài, Khối lượng, Diện tích, Thể tích, Nhiệt độ nhanh chóng và chính xác.",
};

export default function UnitConverterPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Đổi đơn vị đo lường</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Chuyển đổi linh hoạt giữa các đơn vị đo lường phổ biến. Chọn loại đơn vị, nhập giá trị và xem kết quả ngay lập tức.
                </p>
            </div>

            <UnitConverterClient />
        </div>
    );
}
