import { Metadata } from "next";
import { ImageToBase64Client } from "./ImageToBase64Client";

export const metadata: Metadata = {
    title: "Chuyển ảnh sang Base64 - Nhúng ảnh vào code dễ dàng",
    description:
        "Công cụ chuyển đổi hình ảnh sang chuỗi Base64 trực tuyến. Hỗ trợ tạo Data URI cho HTML img, CSS background-image cực kỳ nhanh chóng và an toàn.",
};

export default function ImageToBase64Page() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Ảnh sang Base64</h1>
                <p className="text-muted-foreground">
                    Chuyển đổi các tệp hình ảnh thành chuỗi Base64 để nhúng trực tiếp vào mã nguồn mà không cần lưu trữ tệp riêng biệt.
                </p>
            </div>

            <ImageToBase64Client />
        </div>
    );
}
