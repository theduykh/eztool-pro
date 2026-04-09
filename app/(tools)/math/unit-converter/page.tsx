import { Metadata } from "next";
import { UnitConverterClient } from "./UnitConverterClient";

export const metadata: Metadata = {
    title: "Đổi đơn vị đo lường trực tuyến - Chuyển đổi chính xác",
    description:
        "Công cụ chuyển đổi đơn vị đo lường toàn diện. Hỗ trợ đổi Độ dài, Khối lượng, Diện tích, Thể tích, Nhiệt độ nhanh chóng và chính xác.",
};

export default function UnitConverterPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Đổi đơn vị đo lường</h1>
                <p className="text-muted-foreground">
                    Chuyển đổi linh hoạt giữa các đơn vị đo lường phổ biến. Chọn loại đơn vị, nhập giá trị và xem kết quả ngay lập tức.
                </p>
            </div>

            <UnitConverterClient />
        </div>
    );
}
