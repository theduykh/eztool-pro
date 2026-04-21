import { Metadata } from "next";
import { RuleOfThreeClient } from "./RuleOfThreeClient";

export const metadata: Metadata = {
    title: "Tính Tam Suất - Giải nhanh bài toán tỷ lệ",
    description:
        "Công cụ tính tam suất thuận và tam suất nghịch trực tuyến. Giúp bạn giải nhanh các bài toán về tỷ lệ, quy đổi dữ liệu chính xác và dễ dàng.",
};

export default function RuleOfThreePage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tính Tam Suất</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Phương pháp giải bài toán về ba đại lượng đã biết để tìm đại lượng thứ tư. Hỗ trợ cả tỷ lệ thuận và tỷ lệ nghịch.
                </p>
            </div>

            <RuleOfThreeClient />
        </div>
    );
}
