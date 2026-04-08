# PROJECT ARCHITECTURE & MASTER PLAN: eztool.pro

## 1. Tổng quan dự án (Project Overview)
**Tên dự án:** eztool.pro  
**Mô tả:** Nền tảng web cung cấp bộ công cụ/tiện ích hàng ngày (Utility Tools) và công cụ dành cho nhà phát triển (Dev Tools).  
**Định vị:** Nhanh chóng, chính xác tuyệt đối, giao diện tối giản (Clean UI) và không quảng cáo rác.

### Mục đích tối thượng (Ultimate Goals)
1. **Performance (Hiệu năng):** Thời gian phản hồi (TTFB) siêu thấp. Tốc độ tải trang đạt điểm tuyệt đối 100/100 trên Google PageSpeed Insights.
2. **SEO Mastery:** Index cực nhanh. Mỗi công cụ là một landing page chuẩn SEO, cấu trúc Semantic HTML rõ ràng.
3. **Accuracy (Độ chính xác):** 100% logic tính toán, chuyển đổi phải chính xác, được bảo vệ bởi Unit Tests. (Phát huy tối đa mindset của QA Automation).
4. **Maintainability (Khả năng bảo trì):** Kiến trúc module hóa, thêm một công cụ mới chỉ mất vài phút mà không ảnh hưởng đến hệ thống cũ.
5. **Zero-cost Scaling:** Tận dụng CDN để giảm tải 99% cho server gốc.

---

## 2. Tech Stack (Công nghệ sử dụng)

### Frontend & Core
* **Framework:** Next.js (App Router) - Tối ưu hóa cho SSG (Static Site Generation).
* **Ngôn ngữ:** TypeScript (Strict mode) - Bắt buộc để tránh lỗi runtime.
* **Styling:** Tailwind CSS + Shadcn UI (Các component UI có thể copy/paste, siêu nhẹ, không phụ thuộc thư viện đồ sộ).
* **State Management:** Zustand (Nếu cần state global nhẹ) hoặc React Context.

### Testing (QA Standard)
* **Unit Test (Logic):** Vitest (Nhanh hơn Jest, tích hợp tốt với TS).

### Deployment & Infrastructure (Current: CentOS VM)
* **Container:** Docker & Docker Compose.
* **Web Server/Proxy:** Nginx (Xử lý SSL Let's Encrypt, Gzip/Brotli, chặn spam request).
* **CDN & DNS:** Cloudflare (Cache tĩnh toàn cầu, ẩn IP thật của VM).

---

## 3. Kiến trúc Rendering & Caching

* **Default:** Sử dụng **SSG (Static Site Generation)**. Các công cụ tính toán tĩnh sẽ được build sẵn thành file `.html`.
* **Dynamic:** Sử dụng **ISR (Incremental Static Regeneration)** cho các dữ liệu cần cập nhật định kỳ (tỷ giá, giá vàng) mà vẫn giữ tốc độ trang tĩnh.
* **Logic Execution:** 100% logic công cụ chạy ở **Client-Side** sau khi trang đã load để tiết kiệm tài nguyên server.

---

## 4. Cấu trúc thư mục dự án (Folder Structure)

```text
eztool-pro/
├── app/                      # Next.js App Router (Routing & Pages)
│   ├── (tools)/              # Group routes cho các công cụ
│   │   ├── qr-generator/     
│   │   │   ├── page.tsx      # Entry point (Server Component cho SEO)
│   │   │   └── layout.tsx    
│   ├── layout.tsx            # Global Layout
│   └── page.tsx              # Homepage
├── components/               # React Components
│   ├── ui/                   # Shadcn UI components
│   └── shared/               # Components dùng chung (ToolCard, SEOHead...)
├── lib/                      # Core Logic & Utilities (Trái tim dự án)
│   ├── math/                 # Các hàm toán học thuần túy
│   │   ├── geometry.ts       
│   │   └── geometry.test.ts  # Unit tests đi kèm
│   ├── string/               # Xử lý chuỗi
│   └── formatters/           # Format dữ liệu
├── config/                   # Cấu hình dự án
│   └── tools-directory.ts    # Khai báo danh sách công cụ
├── public/                   # Static assets (Images, Icons)
├── Dockerfile                # Cấu hình build cho CentOS
└── docker-compose.yml
```

## 5. Lộ trình triển khai (Deployment Pipeline)

### Giai đoạn 1: Triển khai trên VM CentOS (Hiện tại)

1. Build app thành Docker Image: docker build -t eztool-web .
2. Chạy container với pm2 (nếu chạy node trực tiếp) hoặc qua docker-compose mapping port (vd: 8080).
3. Cấu hình Nginx trên CentOS làm Reverse Proxy trỏ domain eztool.pro vào localhost:8080.
4. Trỏ NameServer của domain về Cloudflare. Bật chế độ "Proxied" (Đám mây màu cam) để Cloudflare cache toàn bộ trang tĩnh.

### Giai đoạn 2: Lên Cloud (Tương lai)

Khi dự án đã có traffic hoặc cần scale:

1. Đẩy code lên GitHub.
2. Kết nối Vercel với GitHub repo.
3. Vercel sẽ tự động lo toàn bộ khâu Build, Deploy, Global CDN, SSL (Bỏ qua hoàn toàn CentOS VM).

## 6. AI AGENT RULES (Quy tắc hệ thống cho AI)

Ghi chú: Khi sử dụng Cursor, GitHub Copilot, hoặc prompt AI mới, hãy dán nội dung dưới đây vào System Prompt hoặc file .cursorrules để AI tuân thủ tuyệt đối.

```
Bạn là một Senior Full-Stack Engineer và QA Automation Expert đang làm việc trên dự án "eztool.pro" - một trang web cung cấp các công cụ tiện ích siêu tốc, chuẩn SEO bằng Next.js (App Router) và TypeScript.

KHI VIẾT CODE, BẠN PHẢI TUÂN THỦ NGHIÊM NGẶT CÁC QUY TẮC SAU:

1. TÁCH BIỆT LOGIC VÀ UI (PURE FUNCTIONS):
- Mọi logic tính toán, chuyển đổi dữ liệu KHÔNG được viết trực tiếp bên trong React Component.
- Phải tách logic ra thành các hàm thuần túy (Pure Functions) đặt trong thư mục `/lib`.
- Các hàm trong `/lib` không được phụ thuộc vào React, Window object (trừ phi cần thiết), để đảm bảo 100% có thể viết Unit Test.

2. TYPESCRIPT STRICT MODE:
- Không bao giờ sử dụng `any`. Bám sát việc định nghĩa `interface` hoặc `type` cho mọi input/output.
- Xử lý triệt để các trường hợp `undefined`, `null` hoặc lỗi parsing (vd: JSON parsing).

3. NEXT.JS APP ROUTER & RENDERING:
- Mặc định các trang (`page.tsx`) phải là Server Components để tối ưu SEO.
- Chỉ sử dụng `"use client"` ở cấp độ Component nhỏ nhất có chứa tương tác của người dùng (nút bấm, form input). KHÔNG đặt `"use client"` ở root page.
- Luôn tạo thẻ `<title>` và `<meta>` động cho từng trang công cụ bằng cách export `metadata` trong file `page.tsx`.

4. GIAO DIỆN VÀ TRẢI NGHIỆM (UI/UX):
- Sử dụng Tailwind CSS. Hướng tới phong cách "Clean, Minimal, Professional".
- Luôn xử lý các trạng thái: Loading, Error (ví dụ: người dùng nhập sai format JSON), và Empty state.
- Hỗ trợ Responsive 100% (Mobile-first).

5. BẢO VỆ CHẤT LƯỢNG (QA MINDSET):
- Bất cứ khi nào bạn tạo ra một file logic mới trong thư mục `/lib`, BẠN PHẢI TẠO RA một file `.test.ts` tương ứng kèm theo các test case bao phủ cả trường hợp Happy Path và Edge Cases (Trường hợp dị biệt).
```

## 7. Chiến lược Prompt (Micro-prompting)
Với nền tảng là một QA Automation, bạn hãy áp dụng mindset viết test vào việc prompt AI. Đừng bảo AI "Làm cho tôi cái trang JSON Formatter". Hãy chia nhỏ ra:

1. Bước 1 (Logic): "Tạo file lib/formatters/json.ts. Viết hàm formatJson và minifyJson. Sau đó viết Unit test cho 2 hàm này bằng Vitest."
2. Bước 2 (Giao diện): "Bây giờ tạo app/(tools)/json-formatter/page.tsx. Thiết kế UI gồm 2 cột Input và Output sử dụng Shadcn UI."
3. Bước 3 (Ghép nối): "Sử dụng hàm trong file lib để gắn vào sự kiện onClick của nút Format trên UI."