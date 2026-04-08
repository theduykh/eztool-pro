---
name: eztool-coding-standard
description: Tiêu chuẩn lập trình và quy định về code của eztool.pro. Đọc skill này trước khi viết code cho dự án.
---

# Tiêu chuẩn lập trình eztool.pro

Dự án "eztool.pro" là một nền tảng công cụ chuẩn SEO với Next.js 16 (App Router) và TypeScript. Khi làm việc với codebase này, bạn bắt buộc phải tuân thủ nghiêm ngặt các quy tắc dưới đây:

## 1. Tách biệt Logic và UI (Pure Functions)
- Mọi logic tính toán, chuyển đổi dữ liệu không được nằm trong React Component.
- Tách riêng thành các hàm thuần túy (Pure Functions) và đặt trong thư mục `lib/`.
- Logic không phụ thuộc vào React, Window object (ngoại trừ khi thật sự cần thiết) để bảo đảm 100% testable.

## 2. TypeScript Strict Mode
- Không bao giờ dùng `any`. Định nghĩa `interface` hoặc `type` rõ ràng cho mọi input/output.
- Bắt buộc phải xử lý triệt để các rủi ro `undefined`, `null`, và lỗi parsing.

## 3. Next.js App Router & Rendering
- Các trang (`page.tsx`) mặc định phải là **Server Component** để thân thiện với SEO.
- Hạn chế sử dụng `"use client"`. Chỉ đặt chỉ thị này ở component cấp nhỏ nhất có chứa tương tác của người dùng (nút bấm, form input). KHÔNG đặt `"use client"` ở root page.
- Luôn tạo thẻ `<title>` và `<meta>` động cho từng trang công cụ bằng cách export `metadata` từ file `page.tsx`.
- **QUAN TRỌNG:** Đây là Next.js 16, `params` trong layout/page là Promise. Đọc docs tại `node_modules/next/dist/docs/` trước khi dùng API mới.

## 4. Giao diện & Trải nghiệm (UI/UX)
- Sử dụng **Tailwind CSS** kết hợp với **Shadcn UI** (nằm trong thư mục `components/ui/`).
- Phong cách thiết kế ưu tiên: "Clean, Minimal, Professional". Đảm bảo tuyệt đối Responsive.
- Luôn kiểm soát toàn bộ các trạng thái trải nghiệm: Loading, Error, và Empty state.
- Hỗ trợ **Dark/Light mode** — sử dụng Shadcn CSS variables (bg-background, text-foreground, bg-card, border-border...), KHÔNG hardcode màu sắc.

## 5. Mindset QA Automation (Kiểm thử)
- Bất cứ khi nào tạo ra một file logic mới trong thư mục `lib/`, BẮT BUỘC bạn phải tạo ra một file `.test.ts` tương ứng bên cạnh.
- Viết Unit Tests bằng **Vitest**. Các test case phải bao quát được 2 mảng chính:
  - Happy Path (Đường dẫn lý tưởng, input đúng).
  - Edge Cases (Các trường hợp dị biệt, lỗi, biên).

## 6. Cấu trúc dự án hiện tại

```
eztool-pro/
├── app/
│   ├── layout.tsx              # Root layout (Server Component) — Inter + Fira Code font, ThemeProvider, AppShell
│   ├── globals.css             # Tailwind v4 + Shadcn CSS vars (dark/light)
│   ├── page.tsx                # Homepage
│   └── (tools)/                # Route group cho tất cả công cụ
│       └── [category]/[tool]/  # Routing theo category/tool-name
│           └── page.tsx        # Server Component, export metadata
├── components/
│   ├── ui/                     # Shadcn UI components (button, input, textarea...)
│   └── shared/                 # Components dùng chung
│       ├── AppShell.tsx        # Client — layout shell (sidebar + header + content)
│       ├── Sidebar.tsx         # Client — sidebar navigation, tool grouping
│       ├── Header.tsx          # Client — breadcrumb, search, theme toggle
│       ├── ThemeProvider.tsx   # Client — next-themes wrapper
│       └── ThemeToggle.tsx     # Client — sun/moon toggle button
├── lib/                        # Pure logic functions (KHÔNG chứa React)
│   ├── utils.ts                # cn() helper
│   ├── formatters/             # Logic xử lý format (json, xml...)
│   ├── math/                   # Hàm tính toán
│   └── string/                 # Xử lý chuỗi
├── config/
│   └── tools.ts                # Registry tất cả tools + categories
└── __tests__/                  # Hoặc đặt .test.ts ngay cạnh file logic trong lib/
```

## 7. Routing Convention
- URL pattern: `/{category}/{tool-id}` — ví dụ `/dev/json-formatter`, `/text/word-counter`
- Folder structure: `app/(tools)/[tương ứng path trong config/tools.ts]/page.tsx`
- Mỗi page export `metadata` object cho SEO.
- Client-interactive component tách riêng file, chỉ `"use client"` ở component đó.
