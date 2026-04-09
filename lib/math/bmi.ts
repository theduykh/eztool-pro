/**
 * BMI Calculation logic and health classification
 */

export type BMICategory =
    | "Underweight"
    | "Normal"
    | "Overweight"
    | "Obesity Class I"
    | "Obesity Class II"
    | "Obesity Class III";

export interface BMIResult {
    bmi: number;
    category: BMICategory;
    label: string;
    advice: string;
    color: string;
}

export type BMIStandard = "global" | "asian";

/**
 * Calculates BMI and classifies it based on the chosen standard.
 * Formula: weight (kg) / (height(m)^2)
 */
export function calculateBMI(weightKg: number, heightCm: number, standard: BMIStandard = "global"): BMIResult {
    if (weightKg <= 0 || heightCm <= 0) {
        throw new Error("Cân nặng và chiều cao phải là số dương.");
    }

    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const roundedBmi = Math.round(bmi * 10) / 10;

    if (standard === "asian") {
        return classifyAsian(roundedBmi);
    } else {
        return classifyGlobal(roundedBmi);
    }
}

function classifyGlobal(bmi: number): BMIResult {
    if (bmi < 18.5) {
        return {
            bmi,
            category: "Underweight",
            label: "Gầy (Thiếu cân)",
            advice: "Bạn nên chú ý bổ sung thêm dinh dưỡng và tập luyện thể thao.",
            color: "text-blue-500",
        };
    } else if (bmi < 25) {
        return {
            bmi,
            category: "Normal",
            label: "Bình thường (Lý tưởng)",
            advice: "Tuyệt vời! Hãy duy trì lối sống lành mạnh và chế độ ăn uống hiện tại.",
            color: "text-green-500",
        };
    } else if (bmi < 30) {
        return {
            bmi,
            category: "Overweight",
            label: "Thừa cân",
            advice: "Bạn nên kiểm soát lại chế độ ăn uống và tăng cường vận động.",
            color: "text-yellow-500",
        };
    } else if (bmi < 35) {
        return {
            bmi,
            category: "Obesity Class I",
            label: "Béo phì độ I",
            advice: "Bạn cần bắt đầu một chương trình giảm cân và tư vấn dinh dưỡng.",
            color: "text-orange-500",
        };
    } else if (bmi < 40) {
        return {
            bmi,
            category: "Obesity Class II",
            label: "Béo phì độ II",
            advice: "Nguy cơ bệnh tật cao. Bạn nên tham khảo ý kiến bác sĩ chuyên khoa.",
            color: "text-red-500",
        };
    } else {
        return {
            bmi,
            category: "Obesity Class III",
            label: "Béo phì độ III (Cực kỳ nguy hiểm)",
            advice: "Tình trạng sức khỏe báo động. Cần sự can thiệp y tế ngay lập tức.",
            color: "text-red-700",
        };
    }
}

function classifyAsian(bmi: number): BMIResult {
    if (bmi < 18.5) {
        return {
            bmi,
            category: "Underweight",
            label: "Gầy (Thiếu cân)",
            advice: "Bạn nên chú ý bổ sung thêm dinh dưỡng và tập luyện thể thao.",
            color: "text-blue-500",
        };
    } else if (bmi < 23) {
        return {
            bmi,
            category: "Normal",
            label: "Bình thường (Lý tưởng)",
            advice: "Tuyệt vời! Hãy duy trì lối sống lành mạnh và chế độ ăn uống hiện tại.",
            color: "text-green-500",
        };
    } else if (bmi < 25) {
        return {
            bmi,
            category: "Overweight",
            label: "Thừa cân (Tiền béo phì)",
            advice: "Cơ thể bắt đầu có dấu hiệu tích mỡ thừa. Nên điều chỉnh chế độ ăn giảm tinh bột.",
            color: "text-yellow-500",
        };
    } else if (bmi < 30) {
        return {
            bmi,
            category: "Obesity Class I",
            label: "Béo phì độ I",
            advice: "Nguy cơ mắc các bệnh tim mạch và tiểu đường tăng cao. Hãy vận động nhiều hơn.",
            color: "text-orange-500",
        };
    } else {
        return {
            bmi,
            category: "Obesity Class II",
            label: "Béo phì độ II",
            advice: "Tình trạng béo phì nghiêm trọng. Bạn cần tư vấn từ bác sĩ và chế độ giảm cân gắt gao.",
            color: "text-red-600",
        };
    }
}

export function getBMICategories(standard: BMIStandard = "global") {
    if (standard === "asian") {
        return [
            { range: "< 18.5", label: "Gầy", color: "bg-blue-500", min: 15, max: 18.5 },
            { range: "18.5 – 22.9", label: "Bình thường", color: "bg-green-500", min: 18.5, max: 23 },
            { range: "23.0 – 24.9", label: "Tiền béo phì", color: "bg-yellow-500", min: 23, max: 25 },
            { range: "25.0 – 29.9", label: "Béo phì độ I", color: "bg-orange-500", min: 25, max: 30 },
            { range: "≥ 30.0", label: "Béo phì độ II", color: "bg-red-600", min: 30, max: 45 },
        ];
    }
    return [
        { range: "< 18.5", label: "Gầy", color: "bg-blue-500", min: 15, max: 18.5 },
        { range: "18.5 – 24.9", label: "Bình thường", color: "bg-green-500", min: 18.5, max: 25 },
        { range: "25.0 – 29.9", label: "Thừa cân", color: "bg-yellow-500", min: 25, max: 30 },
        { range: "30.0 – 34.9", label: "Béo phì độ I", color: "bg-orange-500", min: 30, max: 35 },
        { range: "35.0 – 39.9", label: "Béo phì độ II", color: "bg-red-500", min: 35, max: 40 },
        { range: "≥ 40.0", label: "Béo phì độ III", color: "bg-red-700", min: 40, max: 45 },
    ];
}
