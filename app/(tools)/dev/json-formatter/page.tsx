import type { Metadata } from "next";
import { JsonFormatterClient } from "./JsonFormatterClient";

export const metadata: Metadata = {
    title: "JSON Formatter & Validator",
    description:
        "Làm đẹp, xác thực và nén dữ liệu JSON của bạn ngay lập tức. Công cụ JSON formatter trực tuyến miễn phí, nhanh chóng và chính xác.",
};

export default function JsonFormatterPage() {
    return (
        <div className="flex h-full flex-col">
            {/* SEO heading */}
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    JSON Formatter &amp; Validator
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Làm đẹp, xác thực và nén dữ liệu JSON của bạn ngay lập tức.
                </p>
            </div>

            {/* Client interactive component */}
            <JsonFormatterClient />
        </div>
    );
}
