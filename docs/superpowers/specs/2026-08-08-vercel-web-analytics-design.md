# Vercel Web Analytics cơ bản — Design

## Mục tiêu

Tích hợp Vercel Web Analytics để ghi nhận page view, visitor và referrer cho toàn bộ
landing page theo locale (`/vi` và `/en`).

## Thiết kế

- Cài dependency production `@vercel/analytics` bằng pnpm.
- Import `Analytics` từ `@vercel/analytics/next` trong `app/[locale]/layout.tsx`.
- Render `<Analytics />` đúng một lần trong `<body>`, ngoài `ThemeProvider`, để bao phủ
  mọi trang locale mà không phụ thuộc theme hoặc nội dung trang.
- Không tạo root layout mới và không chèn script thủ công.

## Dữ liệu và quyền riêng tư

Chỉ dùng Web Analytics cơ bản. Không thêm custom event, Speed Insights, cookie định
danh hoặc consent UI trong phạm vi thay đổi này.

## Kiểm thử

- Thêm test xác nhận locale layout gắn Analytics đúng một lần.
- Chạy format check, lint, test và production build.

## Ngoài phạm vi

- Custom events cho điện thoại, Zalo hoặc form đăng ký.
- Vercel Speed Insights.
- Dashboard hoặc cấu hình project trên Vercel; chủ dự án bật Web Analytics trong
  Vercel Dashboard nếu chưa bật.
