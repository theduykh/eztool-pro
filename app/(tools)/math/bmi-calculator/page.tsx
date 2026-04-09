import { Metadata } from "next";
import { BMICalculatorClient } from "./BMICalculatorClient";

export const metadata: Metadata = {
    title: "Tính chỉ số BMI - Kiểm tra sức khỏe trực tuyến",
    description:
        "Công cụ tính chỉ số khối cơ thể (BMI) trực tuyến. Biết ngay tình trạng sức khỏe của bạn (gầy, bình thường, thừa cân hay béo phì) chỉ trong vài giây.",
};

export default function BMICalculatorPage() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Tính chỉ số BMI</h1>
                <p className="text-muted-foreground">
                    Kiểm tra chỉ số khối cơ thể (Body Mass Index) để đánh giá tình trạng cân nặng và sức khỏe của bạn so với chiều cao.
                </p>
            </div>

            <BMICalculatorClient />
        </div>
    );
}
