# Nhận diện thị giác cho landing page Trí Tuệ Việt — Design

Ngày: 2026-07-29
Repo: `tritueviet-landing-page` (branch tích hợp: `develop`)
Branch thực thi: `feature/brand-visual-identity`

## Vấn đề

Trang đã chạy đúng chức năng nhưng chưa có nhận diện. Cụ thể:

- `app/globals.css` vẫn là bảng màu shadcn mặc định. `--primary` là
  `oklch(0.208 0.042 265.755)` — slate-900, tức gần như đen. Không có một màu
  thương hiệu nào trong toàn bộ file.
- Cả 11 section dùng chung một khuôn `components/section.tsx`: cùng nền
  `background`, cùng `py-16 md:py-24`, cùng tiêu đề căn giữa. Cuộn hết trang là
  11 khối giống hệt nhau.
- Không có chuyển động, không có hoạ tiết nền, không có phân cấp thị giác nào
  ngoài cỡ chữ.

Kết quả: trang đọc như một template, không như một trung tâm giáo dục cụ thể.

## Đối tượng và tông giọng

Người ra quyết định là **phụ huynh**; **học sinh** là người ảnh hưởng. Trang cần
nền tảng uy tín cho phụ huynh, cộng điểm nhấn năng lượng để học sinh cấp 3 không
thấy trang "già".

Hướng thị giác đã chọn: **sắc bén, quyết đoán** — hero nền navy đậm phủ lưới kẻ
mờ, chữ tiêu đề rất đậm và bám sát nhau, cam dùng mạnh tay cho CTA và con số,
các section sáng/tối xen kẽ tạo nhịp rõ rệt khi cuộn.

**Ràng buộc bắt buộc:** ngôn ngữ thị giác sắc bén, nhưng **copy giữ nguyên**.
Nội dung hiện tại trong `messages/*.json` phủ lớp 6–12 với giọng đồng hành,
minh bạch, báo cáo tiến độ cho phụ huynh ("Học đúng lộ trình, tiến bộ thấy rõ
từng tháng"). Đây không phải trung tâm luyện thi cường độ cao. Hình sắc bén +
lời ấm là cặp đôi có chủ đích: tránh tông áp lực mà vẫn không bị nhạt.

Không sửa `messages/vi.json` và `messages/en.json` trong phạm vi công việc này.

## Ràng buộc asset

Repo không có bất kỳ asset ảnh nào. `components/logo.tsx` là SVG tạm,
`app/icon.tsx` sinh favicon runtime bằng `ImageResponse`.

Toàn bộ thiết kế phải dựng **thuần CSS**: typography, màu, gradient, hoạ tiết
nền bằng `linear-gradient`, và icon `lucide-react` đã có sẵn. Không chừa ô ảnh
trống, không dùng ảnh stock. Hệ quả: trang không bao giờ ở trạng thái dở dang vì
thiếu ảnh, và có thể deploy ngay.

## Hệ token màu

### Giá trị

Dùng thẳng giá trị OKLCH trong bảng màu mặc định của Tailwind v4. Các giá trị
slate dưới đây đã có sẵn trong `globals.css` hiện tại nên đối chiếu được trực
tiếp; giá trị blue và amber phải **kiểm chứng lại với bảng màu Tailwind v4 khi
implement**, không chép từ trí nhớ.

| Token | Vai trò | Light | Dark |
| --- | --- | --- | --- |
| `--primary` | Xanh tri thức: link, eyebrow, nút phụ | blue-700 `oklch(0.488 0.243 264.376)` | blue-500 `oklch(0.623 0.214 259.815)` |
| `--highlight` | Cam hồ phách: CTA chính, con số | amber-500 `oklch(0.769 0.188 70.08)` | amber-500 |
| `--highlight-foreground` | Chữ trên nền cam | amber-950 `oklch(0.279 0.077 45.635)` | amber-950 |
| `--surface-ink` | Nền dải tối | slate-950 `oklch(0.129 0.042 264.695)` | **blue-800** `oklch(0.424 0.199 265.638)` |
| `--surface-ink-foreground` | Chữ trên dải tối | slate-50 `oklch(0.984 0.003 247.858)` | slate-50 |
| `--background` | Nền trang | trắng `oklch(1 0 0)` | `oklch(0.10 0.03 264)` — sâu hơn `--surface-ink` |
| `--radius` | Bo góc | `0.375rem` (giảm từ `0.625rem`) | như light |

`--surface-ink` **đảo vai trò trong dark mode**: ở light nó là dải navy tối nổi
trên nền trắng; ở dark nền trang tối hơn nó, nên nó phải sáng lên thành dải xanh.
Nếu giữ navy ở cả hai chế độ thì bật dark mode là hero chìm hoàn toàn vào nền —
đây là lỗi cụ thể mà quyết định này tồn tại để ngăn.

`--background` ở dark phải **tối hơn** `--surface-ink` ở dark. Đây là bất biến
của thiết kế, không phải sở thích: vi phạm nó là mất toàn bộ nhịp điệu.

### Cái bẫy `--accent`

shadcn dùng `--accent` làm **nền trạng thái hover** (`dropdown-menu`,
`accordion`, `button variant="ghost"`), không phải màu nhấn thương hiệu. Gán cam
vào `--accent` sẽ khiến mọi hover trong trang loé cam.

Cam đi vào token **mới** `--highlight` / `--highlight-foreground`.
`--accent`, `--secondary`, `--muted` giữ nguyên ngữ nghĩa shadcn, chỉ chỉnh sắc
độ cho hợp tông xanh.

Mỗi token mới phải khai báo ở cả ba chỗ trong `globals.css`: block
`@theme inline` (để sinh ra utility class), `:root`, và `.dark`.

### Quy tắc tương phản — bắt buộc

Cam `#F59E0B` trên nền sáng chỉ đạt khoảng **2.1:1**, trượt WCAG AA cho chữ.

- **Cam không bao giờ là màu chữ trên nền sáng.** Trên nền sáng, cam chỉ được
  làm nền nút, đường kẻ, chấm, viền.
- Trên `--surface-ink`, cam đạt khoảng **7.5:1** → làm chữ thoải mái. Đây chính
  là lý do các con số thống kê màu cam phải nằm trong dải tối, không nằm trên nền
  trắng.
- Chữ trên nền cam dùng `--highlight-foreground` (amber-950), không dùng trắng.

## Chữ

`Be_Vietnam_Pro` trong `app/[locale]/layout.tsx` hiện nạp `400, 500, 600, 700`.
Thêm **`800`**.

- Tiêu đề lớn (h1, h2 của section): `font-weight: 800`,
  `letter-spacing: -0.03em`, `line-height: 1.1`.
- Chữ thân: giữ 400/500.
- Eyebrow: giữ nguyên kiểu hiện tại (`uppercase`, `tracking-[0.2em]`,
  `text-xs font-semibold`), đổi sang `--highlight` khi nằm trên `--surface-ink`,
  giữ `--primary` khi nằm trên nền sáng.

## Nhịp điệu section

`components/section.tsx` nhận thêm hai prop, cả hai đều optional và có mặc định
giữ nguyên hành vi hiện tại:

- `tone?: "light" | "muted" | "ink"` — mặc định `"light"`
- `align?: "center" | "start"` — mặc định `"center"`

Section `tone="ink"` tự đặt nền `--surface-ink`, chữ `--surface-ink-foreground`,
và đổi màu eyebrow sang `--highlight`.

Bản đồ nhịp — 11 section chia thành **3 chương**, mỗi chương mở bằng một dải tối:

| # | Section | tone | align | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | hero | ink | start | Navy + lưới kẻ mờ |
| 2 | stats | ink | center | Dính liền hero thành một khối, không có đường chia |
| 3 | courses | light | start | |
| 4 | formats | muted | center | |
| 5 | process | light | center | |
| 6 | teachers | muted | center | |
| 7 | achievements | **ink** | center | Breakpoint giữa trang |
| 8 | pricing | light | center | |
| 9 | testimonials | muted | center | |
| 10 | faq | light | start | |
| 11 | contact | **ink** | center | Form nền trắng nổi trên navy |

Hero và stats phải trông như **một khối liền** — không kẻ `border-b` giữa hai
section, không đổi padding dọc giữa chúng.

Đây là phần tạo ra khác biệt lớn nhất so với hiện trạng và là quyết định khó đảo
ngược nhất, đã được xác nhận.

## Hoạ tiết nền và chuyển động

### Lưới kẻ

Một utility class `.bg-grid` trong `globals.css`: hai `linear-gradient` chồng
nhau, `background-size: 32px 32px`, opacity thấp, phủ thêm `mask-image` dạng
`radial-gradient` để lưới mờ dần ra rìa. Không tạo component, không tạo file
SVG.

Chỉ dùng trên section `tone="ink"`.

### Scroll-reveal

Dùng **CSS thuần** qua `animation-timeline: view()` — không thêm thư viện, không
`IntersectionObserver`, không thêm `"use client"` vào section nào.

Lý do không phải là tiết kiệm KB. 13 file test hiện chạy trên jsdom và render mỗi
section như client component dưới `NextIntlClientProvider`; thêm JS animation là
phải polyfill browser API trong `vitest.setup.ts` và làm toàn bộ test giòn thêm.
CSS-only thì test không cần biết gì về animation.

Yêu cầu về khả năng suy giảm:

- Trình duyệt không hỗ trợ `animation-timeline` (Firefox tại thời điểm này) phải
  hiển thị nội dung **ngay lập tức ở trạng thái cuối**. Bọc phần đặt trạng thái
  đầu (`opacity: 0`) trong `@supports (animation-timeline: view())` để trình
  duyệt không hỗ trợ không bao giờ chạm tới nó. Nội dung không bao giờ được vô
  hình.
- Bọc trong `@media (prefers-reduced-motion: reduce)` để tắt hoàn toàn.

### Hover

Card nâng nhẹ (`translateY`) và viền chuyển sang `--highlight` khi hover, có
`transition`. Tắt theo `prefers-reduced-motion`.

## Header

`components/site-header.tsx` dùng nền `--surface-ink` **đặc, luôn luôn**.

Không làm kiểu trong suốt trên hero rồi đặc dần khi cuộn: cần scroll listener
client-side và một biến state, không đáng cho lợi ích thu được. Vì header dùng
chính token `--surface-ink` nên nó tự đảo theo dark mode và luôn tách khỏi nền.

Nav item, hotline button, language switcher và mode toggle phải đọc được trên
nền tối ở cả hai chế độ.

## Phạm vi file

Sửa:

- `app/globals.css` — token, utility `.bg-grid`, keyframes scroll-reveal
- `app/[locale]/layout.tsx` — thêm font weight `800`
- `components/section.tsx` — prop `tone` và `align`
- `components/site-header.tsx` — nền ink
- `components/logo.tsx` — hợp tông màu mới, đọc được trên nền tối
- `components/ui/button.tsx` — thêm variant `highlight` (nền cam)
- `components/ui/card.tsx` — bo góc sắc hơn, hover state
- 11 file trong `app/[locale]/(public)/home/_components/` + `footer.tsx`

Không đụng:

- `messages/vi.json`, `messages/en.json` — copy giữ nguyên
- `app/actions/consultation.ts`, `consultation.schema.ts`
- `lib/site.ts`, `lib/structured-data.ts`, `app/sitemap.ts`, `app/robots.ts`,
  `app/manifest.ts`, `components/structured-data.tsx` — SEO không đổi
- `i18n/`, `proxy.ts`, `enums/`

## Kiểm chứng

Chạy theo thứ tự, tất cả phải xanh trước khi coi là xong:

1. `pnpm test` — 13 file test hiện có. Chỗ dễ gãy nhất là `tests/sections/*`:
   `Section` đổi props có thể làm đổ assertion về cấu trúc DOM. Cả hai prop mới
   đều optional có mặc định giữ nguyên hành vi cũ, chính là để giảm rủi ro này.
2. `pnpm lint`
3. `pnpm format:check`
4. `pnpm build` — bước duy nhất thật sự chứng minh Server Component render được.

Test thêm:

- `tests/components/section.test.tsx` — mỗi giá trị `tone` render đúng class nền
  tương ứng; mặc định (không truyền prop) giữ nguyên hành vi hiện tại.

Kiểm tra tay, không thể tự động hoá trong phạm vi này:

- Light mode và dark mode, mobile và desktop.
- Xác nhận bất biến: ở dark mode, nền trang tối hơn dải `--surface-ink`.
- Xác nhận không có chữ màu cam nào nằm trên nền sáng.
- Xác nhận với `prefers-reduced-motion: reduce` toàn bộ nội dung vẫn hiện đầy đủ.

## Ngoài phạm vi

- Điền dữ liệu thật (`[TODO: ...]` trong `messages/*.json`, `SITE_PHONE`,
  `SITE_ZALO_URL`, `SITE_EMAIL`, `SITE_ADDRESS`, `SITE_URL`, `SITE_SAME_AS`).
  Đây là launch blocker riêng, đã ghi trong `CLAUDE.md`, không thuộc việc này.
- Logo/artwork thật. `logo.tsx` vẫn là SVG tạm, chỉ chỉnh cho hợp bảng màu mới.
- Ảnh chụp thật của trung tâm, giáo viên, lớp học.
- Chuyển đổi form sang webhook / Google Sheet / email.
