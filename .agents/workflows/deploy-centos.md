---
description: Quy trình triển khai hệ thống eztool.pro lên hạ tầng CentOS VM (Giai đoạn 1)
---

# Lộ trình Deploy lên CentOS VM

Quy trình Deploy tiêu chuẩn hiện tại của dự án thực hiện qua Containerization.

### Bước 1: Build Image
- Build ứng dụng lấy image base Docker.
```bash
docker build -t eztool-web .
```

### Bước 2: Khởi chạy Service
- Chạy container ứng dụng (thông thường qua docker-compose mapping cổng, ví dụ `8080`), hoặc dùng `pm2` nếu triển khai trực tiếp.

### Bước 3: Cấu hình Web Server (Reverse Proxy)
- Mở **Nginx** trên CentOS để cấu hình làm Reverse Proxy.
- Trỏ domain `eztool.pro` vào `localhost:8080`.
- Xử lý SSL Let's Encrypt, Gzip/Brotli trên lớp Nginx.

### Bước 4: Tự động hoá qua CDN (Cloudflare)
- Trỏ NameServer của tên miền `eztool.pro` vào hệ thống DNS của Cloudflare.
- Bật chế độ "Proxied" (đám mây màu cam) trên DNS record của domain.
- Cloudflare sẽ giúp cache toàn bộ tài nguyên (SSG html, images, JS, CSS) để tránh ăn mòn server gốc.

> **Ghi chú mở rộng (Giai đoạn lên Cloud - Tương lai):** Khi đổi kiến trúc lên sử dụng Vercel, tiến trình này sẽ chuyển đổi sang Push to Github -> Vercel auto-build/deploy kèm Global CDN + SSL.
