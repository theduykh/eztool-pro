---
description: Hướng dẫn tạo công cụ tiện ích (Tool) mới trên nền tảng eztool.pro
---

# Quy trình tạo tool mới (Micro-prompting)

Áp dụng tư duy QA Automation để xây dựng công cụ bằng cách chia nhỏ quá trình. Thực hiện theo trình tự các bước sau, TUYỆT ĐỐI không làm ngược lại:

## Bước 0: Đọc Coding Standard
- Đọc file `.agents/skills/eztool-coding-standard/SKILL.md` để nắm rõ cấu trúc dự án và quy tắc.
- Kiểm tra `config/tools.ts` để xem tool đã được khai báo chưa (id, path, category).

## Bước 1: Xây dựng Logic Core (Pure Functions)
- Không chạm vào UI. Chỉ tạo logic cốt lõi.
- Tạo file `.ts` trong `lib/[domain]/` — ví dụ `lib/formatters/json.ts`, `lib/math/percentage.ts`.
- Viết các hàm logic thuần túy (pure functions).
- Áp dụng TypeScript nghiêm ngặt, định nghĩa `interface`/`type` rõ ràng. Không dùng `any`.
- Hàm phải trả về kết quả hoặc error message, KHÔNG throw exception không kiểm soát.

## Bước 2: Viết Unit Tests (QA Standard)
- Tạo file `.test.ts` ngay bên cạnh file logic vừa tạo (ví dụ `lib/formatters/json.test.ts`).
- Viết test bằng **Vitest**.
- Phải cover:
  - ✅ Happy Path (input hợp lệ, kết quả đúng).
  - ✅ Edge Cases (input rỗng, null, undefined, quá dài, ký tự đặc biệt).
  - ✅ Error Cases (input sai format, dữ liệu không parse được).
// turbo
- Chạy test: `npx vitest run lib/[domain]/[file].test.ts`

## Bước 3: Thiết kế Giao diện (UI)
- Tạo route folder tương ứng path trong `config/tools.ts`.
  - Ví dụ tool có `path: "/dev/json-formatter"` → tạo `app/(tools)/dev/json-formatter/page.tsx`
- File `page.tsx` là **Server Component**:
  - Export `metadata` object (title, description lấy từ `config/tools.ts`).
  - Render tiêu đề + mô tả công cụ.
  - Import và render Client Component chứa logic tương tác.
- Tạo Client Component riêng trong cùng folder (ví dụ `JsonFormatterClient.tsx`):
  - Đặt `"use client"` ở đầu file.
  - Sử dụng các components từ `components/ui/` (Button, Textarea...).
  - Sử dụng Shadcn CSS variables cho màu sắc (KHÔNG hardcode) để hỗ trợ dark mode.
  - Thiết kế phù hợp với layout đã có (content nằm trong vùng workspace của AppShell).

## Bước 4: Ghép nối & Kiểm tra (Integration)
- Import hàm logic từ `lib/` vào Client Component.
- Xử lý hiển thị các trạng thái: Thành công, Loading, Lỗi, và Empty state.
- Mở browser tại `http://localhost:3000/{category}/{tool-id}` để verify:
  - ✅ UI render đúng trên cả Light & Dark mode.
  - ✅ Sidebar highlight đúng tool đang active.
  - ✅ Breadcrumb hiển thị chính xác.
  - ✅ Responsive (mobile view).
  - ✅ Logic hoạt động: nhập input → nhận output đúng.

## Bước 5: Đăng ký Tool (nếu chưa có)
- Nếu tool chưa tồn tại trong `config/tools.ts`, thêm entry mới vào `TOOLS_DIRECTORY`.
- Đảm bảo các trường: `id`, `name`, `description`, `path`, `category`, và `isNew` (nếu là tool mới).
