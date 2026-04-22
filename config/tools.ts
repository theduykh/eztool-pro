export type ToolCategory = "dev" | "text" | "math" | "image";

export interface ToolItem {
    id: string;
    name: string;
    description: string;
    path: string;
    category: ToolCategory;
    isNew?: boolean;
    isHot?: boolean;
    /**
     * Controls the max-width of the tool's content wrapper in AppShell.
     * - "full":    no max-width — use for split-pane editors, wheels, canvases, anything wide
     * - "fixed":   max-w-3xl centered — use for narrow calculators / single-field forms
     * - undefined: max-w-6xl centered (default) — use for the rest
     */
    layout?: "full" | "fixed";
}

export const TOOLS_DIRECTORY: ToolItem[] = [
    // ==========================================
    // 💻 DEV TOOLS (Công cụ cho Lập trình viên)
    // ==========================================
    {
        id: "json-formatter",
        name: "JSON Formatter",
        description: "Làm đẹp, xác thực và nén dữ liệu JSON.",
        path: "/dev/json-formatter",
        category: "dev",
        isHot: true,
        layout: "full",
    },
    {
        id: "base64-encode-decode",
        name: "Base64 Encode/Decode",
        description: "Mã hóa hoặc giải mã chuỗi văn bản sang định dạng Base64.",
        path: "/dev/base64-encode-decode",
        category: "dev",
        layout: "full",
    },
    {
        id: "url-encode-decode",
        name: "URL Encode/Decode",
        description: "Mã hóa URL an toàn hoặc giải mã URL về dạng dễ đọc.",
        path: "/dev/url-encode-decode",
        category: "dev",
        layout: "full",
    },
    {
        id: "jwt-decoder",
        name: "JWT Decoder",
        description: "Giải mã JSON Web Token (JWT) để xem payload và header.",
        path: "/dev/jwt-decoder",
        category: "dev",
        layout: "full",
    },
    {
        id: "hash-generator",
        name: "Hash Generator",
        description: "Tạo mã băm MD5, SHA-1, SHA-256 từ chuỗi văn bản.",
        path: "/dev/hash-generator",
        category: "dev",
        layout: "full",
    },

    // ==========================================
    // 🔤 TEXT TOOLS (Công cụ xử lý Văn bản)
    // ==========================================
    {
        id: "word-counter",
        name: "Đếm từ & Ký tự",
        description: "Đếm số từ, số ký tự, số câu và đoạn văn chi tiết.",
        path: "/text/word-counter",
        category: "text",
        layout: "full",
    },
    {
        id: "case-converter",
        name: "Chuyển đổi chữ hoa/thường",
        description: "Chuyển đổi UPPERCASE, lowercase, Capitalized Case, camelCase.",
        path: "/text/case-converter",
        category: "text",
    },
    {
        id: "text-to-slug",
        name: "Tạo URL Slug",
        description: "Loại bỏ dấu tiếng Việt và tạo URL thân thiện cho SEO.",
        path: "/text/text-to-slug",
        category: "text",
        layout: "fixed",
    },
    {
        id: "lorem-ipsum",
        name: "Tạo chữ giả (Lorem Ipsum)",
        description: "Tạo nhanh các đoạn văn bản mẫu cho thiết kế UI/UX.",
        path: "/text/lorem-ipsum",
        category: "text",
    },
    {
        id: "remove-line-breaks",
        name: "Xóa dòng trống & Khoảng trắng",
        description: "Dọn dẹp văn bản, xóa các dòng trống và khoảng cách thừa.",
        path: "/text/remove-line-breaks",
        category: "text",
        layout: "full",
    },

    // ==========================================
    // 🧮 MATH & CALC (Công cụ Toán & Tính toán)
    // ==========================================
    {
        id: "percentage-calculator",
        name: "Tính Phần Trăm (%)",
        description: "Tính % của một số, sự tăng/giảm phần trăm nhanh chóng.",
        path: "/math/percentage-calculator",
        category: "math",
    },
    {
        id: "bmi-calculator",
        name: "Tính chỉ số BMI",
        description: "Kiểm tra chỉ số khối cơ thể (BMI) để biết tình trạng sức khỏe.",
        path: "/math/bmi-calculator",
        category: "math",
        layout: "fixed",
    },
    {
        id: "random-number",
        name: "Quay số ngẫu nhiên",
        description: "Tạo một hoặc nhiều số ngẫu nhiên trong khoảng chỉ định.",
        path: "/math/random-number",
        category: "math",
    },
    {
        id: "unit-converter",
        name: "Đổi Đơn Vị đo lường",
        description: "Chuyển đổi chiều dài, khối lượng, nhiệt độ, diện tích.",
        path: "/math/unit-converter",
        category: "math",
    },
    {
        id: "rule-of-three",
        name: "Tính Tam Suất",
        description: "Tính nhanh quy tắc tam suất (Nếu A=B, C=D thì tìm ẩn số).",
        path: "/math/rule-of-three",
        category: "math",
    },
    {
        id: "lucky-wheel",
        name: "Vòng quay may mắn",
        description: "Tạo vòng quay ngẫu nhiên với hiệu ứng đẹp mắt. Chọn người, phân việc, quyết định nhanh.",
        path: "/math/lucky-wheel",
        category: "math",
        isNew: true,
    },

    // ==========================================
    // 🖼️ IMAGE TOOLS (Công cụ Hình ảnh/Màu sắc)
    // ==========================================
    {
        id: "qr-generator",
        name: "Tạo mã QR Code",
        description: "Tạo mã QR cho link, văn bản, wifi, có thể tùy chỉnh màu.",
        path: "/image/qr-generator",
        category: "image",
        isHot: true,
    },
    {
        id: "color-converter",
        name: "Chuyển đổi HEX / RGB",
        description: "Chuyển đổi mã màu giữa HEX, RGB, HSL nhanh chóng.",
        path: "/image/color-converter",
        category: "image",
    },
    {
        id: "image-to-base64",
        name: "Ảnh sang Base64",
        description: "Chuyển đổi file ảnh sang chuỗi Base64 để nhúng vào HTML/CSS.",
        path: "/image/image-to-base64",
        category: "image",
        layout: "full",
    },
    {
        id: "svg-placeholder",
        name: "Tạo ảnh Placeholder",
        description: "Tạo nhanh các ảnh kích thước chuẩn để test giao diện.",
        path: "/image/svg-placeholder",
        category: "image",
    },
    {
        id: "image-resizer",
        name: "Đổi kích thước ảnh",
        description: "Crop và thay đổi kích thước ảnh ngay trên trình duyệt.",
        path: "/image/image-resizer",
        category: "image",
        layout: "full",
    }
];

// Hàm hỗ trợ để lấy danh mục (Dùng cho Sidebar)
export const getCategories = () => {
    return [
        { id: "dev", label: "Dev Tools", icon: "terminal" },
        { id: "text", label: "Văn Bản", icon: "type" },
        { id: "math", label: "Toán Học", icon: "calculator" },
        { id: "image", label: "Hình Ảnh", icon: "image" },
    ];
};