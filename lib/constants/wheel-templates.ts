export interface WheelTemplate {
    id: string;
    name: string;
    items: string[];
}

export const WHEEL_TEMPLATES: WheelTemplate[] = [
    {
        id: "beer-picker",
        name: "🍺 Chọn người uống bia",
        items: [
            "Nam",
            "Hùng",
            "Linh",
            "Tuấn",
            "Minh",
            "Đức",
            "Hoàng",
            "Phong",
        ],
    },
    {
        id: "drinking-penalty",
        name: "🥂 Hình thức phạt nhậu",
        items: [
            "100%",
            "50%",
            "Nhấp môi",
            "Chỉ định người khác uống",
            "Qua lượt",
            "Uống đôi",
            "200%",
            "Tự chọn đồ uống",
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
