import { Metadata } from "next";
import { PercentageCalculatorClient } from "./PercentageCalculatorClient";

export const metadata: Metadata = {
    title: "Tính Phần Trăm (%) Online - Công cụ nhanh & chính xác",
    description:
        "Công cụ tính phần trăm trực tuyến đa năng: tính phần trăm của một số, tính tỷ lệ phần trăm, tính tăng giảm phần trăm, tính giá sau giảm giá và thuế VAT.",
};

export default function PercentageCalculatorPage() {
    return (
        <div className="flex h-full flex-col">
            <div className="mb-6 flex-shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Tính Phần Trăm (%)</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Bộ công cụ giúp bạn giải quyết mọi phép tính liên quan đến phần trăm trong cuộc sống và công việc một cách nhanh nhất.
                </p>
            </div>

            <PercentageCalculatorClient />
        </div>
    );
}
