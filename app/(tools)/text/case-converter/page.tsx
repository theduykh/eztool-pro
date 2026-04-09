import { Metadata } from "next";
import { CaseConverterClient } from "./CaseConverterClient";

export const metadata: Metadata = {
    title: "Chuyển đổi chữ hoa/thường - Case Converter",
    description:
        "Công cụ chuyển đổi kiểu chữ trực tuyến. Hỗ trợ UPPERCASE, lowercase, Sentence case, Title Case, camelCase, snake_case và nhiều định dạng khác.",
};

export default function CaseConverterPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Chuyển đổi chữ hoa/thường</h1>
                <p className="text-muted-foreground">
                    Nhanh chóng chuyển đổi văn bản giữa các định dạng UPPERCASE, lowercase, camelCase, snake_case và nhiều kiểu khác chỉ với một cú nhấp chuột.
                </p>
            </div>

            <CaseConverterClient />
        </div>
    );
}
