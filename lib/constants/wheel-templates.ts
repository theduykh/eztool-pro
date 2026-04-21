export interface WheelTemplate {
    id: string;
    name: string;
    items: string[];
}

export const WHEEL_TEMPLATES: WheelTemplate[] = [
    {
        id: "drinking-penalty",
        name: "🥂 Hình thức phạt nhậu",
        items: [
            "Uống 100%",
            "Uống 50%",
            "Chỉ định người khác uống 50%",
            "Chỉ định người khác uống 100%",
            "Qua lượt",
            "Người tiếp theo uống 50%",
            "Người phía trước uống 50%",
            "Tất cả uống 50%",
        ],
    },
    {
        id: "beer-picker",
        name: "🍺 Chọn người uống bia",
        items: [
            "Duy",
            "Nghiệm",
            "Hiếu",
            "Tuấn",
            "Phước",
            "Hậu",
            "Hoàng",
            "Phong",
        ],
    },
    {
        id: "food-picker",
        name: "🍜 Hôm nay ăn gì?",
        items: [
            "Cơm tấm",
            "Phở",
            "Bún đậu",
            "Gà rán",
            "Pizza",
            "Nhịn đói",
            "Bún bò",
            "Bánh mì",
        ],
    },
    {
        id: "housework",
        name: "🏠 Phân công việc nhà",
        items: [
            "Rửa bát",
            "Đổ rác",
            "Lau nhà",
            "Đi chợ",
            "Nấu cơm",
            "Giặt đồ",
            "Phơi đồ",
        ],
    },
];
