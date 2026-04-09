import { Metadata } from "next";
import { RemoveLineBreaksClient } from "./RemoveLineBreaksClient";

export const metadata: Metadata = {
    title: "Xóa dòng trống & Khoảng trắng - Dọn dẹp văn bản",
    description:
        "Công cụ trực tuyến giúp dọn dẹp văn bản: xóa các dòng trống, thu gọn khoảng trắng thừa, xóa dấu xuống dòng và chuẩn hóa định dạng văn bản nhanh chóng.",
};

export default function RemoveLineBreaksPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Xóa dòng trống & Khoảng trắng</h1>
                <p className="text-muted-foreground">
                    Làm sạch văn bản của bạn bằng cách loại bỏ các ký tự thừa, dòng trống và chuẩn hóa khoảng cách giữa các từ.
                </p>
            </div>

            <RemoveLineBreaksClient />
        </div>
    );
}
