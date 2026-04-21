import { Metadata } from "next";
import { CaseConverterClient } from "./CaseConverterClient";

export const metadata: Metadata = {
    title: "Chuyển đổi chữ hoa/thường - Case Converter",
    description:
        "Công cụ chuyển đổi kiểu chữ trực tuyến. Hỗ trợ UPPERCASE, lowercase, Sentence case, Title Case, camelCase, snake_case và nhiều định dạng khác.",
};

export default function CaseConverterPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Chuyển đổi chữ hoa/thường</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Nhanh chóng chuyển đổi văn bản giữa các định dạng UPPERCASE, lowercase, camelCase, snake_case và nhiều kiểu khác chỉ với một cú nhấp chuột.
                </p>
            </div>

            <CaseConverterClient />
        </div>
    );
}
