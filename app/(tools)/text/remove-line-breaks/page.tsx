import { Metadata } from "next";
import { RemoveLineBreaksClient } from "./RemoveLineBreaksClient";

export const metadata: Metadata = {
    title: "Xóa dòng trống & Khoảng trắng - Dọn dẹp văn bản",
    description:
        "Công cụ trực tuyến giúp dọn dẹp văn bản: xóa các dòng trống, thu gọn khoảng trắng thừa, xóa dấu xuống dòng và chuẩn hóa định dạng văn bản nhanh chóng.",
};

export default function RemoveLineBreaksPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Xóa dòng trống & Khoảng trắng</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Làm sạch văn bản của bạn bằng cách loại bỏ các ký tự thừa, dòng trống và chuẩn hóa khoảng cách giữa các từ.
                </p>
            </div>

            <RemoveLineBreaksClient />
        </div>
    );
}
