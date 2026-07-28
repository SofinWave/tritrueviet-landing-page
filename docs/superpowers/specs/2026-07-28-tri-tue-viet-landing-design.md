# Landing page trung tâm gia sư Trí Tuệ Việt — Design

Ngày: 2026-07-28
Repo: `frontend-nextjs-app` (branch tích hợp: `develop`)

## Mục tiêu

Biến repo scaffold hiện tại thành landing page marketing cho trung tâm gia sư
**Trí Tuệ Việt**, dùng cùng bộ công cụ và cùng kiến trúc với dự án
`../landing-page` (SofinWave) để hai repo vận hành giống nhau.

Repo giữ nguyên git history và cấu hình Docker override pattern vừa dựng.

## Cách tiếp cận

Lift phần hạ tầng đã được kiểm chứng từ `../landing-page` (file cấu hình, version
pin, thư mục `i18n/`, `enums/`, `components/ui/`, `.docker/`, `mise/tasks/`, CI
workflow), viết mới toàn bộ `app/` và `messages/` cho lĩnh vực gia sư.

Hai phương án bị loại:

- **Nâng cấp tại chỗ từng bước** — chậm và dễ rơi vào tổ hợp version khác với
  repo bên cạnh, đúng thứ cần tránh.
- **`create-next-app` mới rồi merge** — mất git history, mà scaffold mặc định
  vẫn thiếu i18n/vitest/shadcn nên không tiết kiệm được gì.

## Toolchain

| Hạng mục | Quyết định |
| --- | --- |
| Framework | Next.js 16.2.10 App Router, React 19.2, TypeScript strict |
| Package manager | pnpm 11.9.0 (`packageManager` field); xoá `yarn.lock` và `package-lock.json` |
| Styling | Tailwind v4, shadcn/ui style `new-york`, `lucide-react` |
| Format | Biome — **chỉ format**, linter tắt (`"linter": { "enabled": false }`) |
| Lint | ESLint qua `eslint-config-next` — **chỉ lint** |
| Test | Vitest + jsdom + `@testing-library/react`, globals bật |
| i18n | `next-intl` |
| Hooks | Husky pre-commit chạy `lint-staged`; commitlint (Conventional Commits) |
| Container | Docker Compose override pattern, bọc bằng mise file tasks |

Biome và ESLint cố ý tách rời — không gộp.

Middleware đặt ở **`proxy.ts`** (Next 16 đổi tên `middleware.ts` → `proxy.ts`),
áp dụng next-intl middleware.

Path alias `@/*` → repo root, khai báo ở `tsconfig.json` và alias của Vitest.

## i18n

- Locale định nghĩa một lần ở `enums/locale.enum.ts`: `LocaleSupport.VI` (default)
  và `LocaleSupport.EN`.
- `i18n/routing.ts` với `localePrefix: "always"` → `/vi/...`, `/en/...`; root
  redirect về `/vi`.
- `i18n/request.ts` load catalog theo request; `i18n/navigation.ts` export
  `Link`, `redirect`, `useRouter` locale-aware — dùng những cái này cho điều
  hướng nội bộ, không dùng `next/link` / `next/navigation`.
- `messages/vi.json` và `messages/en.json` phải trùng hệt cấu trúc key;
  `tests/messages/parity.test.ts` ép điều đó.
- Server Component đọc bản dịch qua `getTranslations`, Client Component qua
  `useTranslations`. `setRequestLocale(locale)` được gọi trong layout/page để
  bật static rendering.

## Bố cục trang

Một trang duy nhất: `app/[locale]/(public)/home/page.tsx`, compose các section
component trong `_components/` theo thứ tự phễu chuyển đổi:

| # | Component | Nội dung |
| --- | --- | --- |
| 1 | `hero.tsx` | Headline, CTA "Đăng ký học thử miễn phí", nút gọi/Zalo |
| 2 | `stats.tsx` | Dải số liệu tin cậy: số học viên, năm kinh nghiệm, tỉ lệ đỗ |
| 3 | `courses.tsx` | Môn học × cấp lớp |
| 4 | `formats.tsx` | Hình thức học: 1 kèm 1, nhóm nhỏ, online, tại nhà |
| 5 | `process.tsx` | 4 bước: tư vấn → test đầu vào → xếp lớp → học thử |
| 6 | `teachers.tsx` | Đội ngũ giáo viên |
| 7 | `achievements.tsx` | Thành tích học viên |
| 8 | `pricing.tsx` | Bảng học phí theo hình thức × cấp lớp |
| 9 | `testimonials.tsx` | Cảm nhận phụ huynh |
| 10 | `faq.tsx` | Accordion |
| 11 | `contact.tsx` + `contact-form.tsx` | Form đăng ký tư vấn |
| 12 | `footer.tsx` | Footer |

Ngoài ra `components/site-header.tsx` với anchor nav (`#khoa-hoc`, `#hoc-phi`,
`#dang-ky`) và `components/section.tsx` làm shell chung (container + nhịp dọc).

Tất cả là Server Component đọc bản dịch qua `getTranslations`, trừ
`contact-form.tsx` (cần `useActionState`) và các component có animation.

## Form đăng ký tư vấn

Server action `app/actions/consultation.ts` (`"use server"`) validate bằng Zod
schema ở `app/actions/consultation.schema.ts`, rồi **log ra console**. Chưa nối
nhà cung cấp nào — đây là quyết định có chủ đích, để lại như một điểm mở rộng.

Field: tên phụ huynh, số điện thoại (validate đầu số Việt Nam), lớp, môn quan
tâm, hình thức học, ghi chú.

Vì form chưa gửi đi đâu, hero và site header luôn hiển thị nút gọi trực tiếp và
nút Zalo để không mất lead.

## Brand, nội dung và placeholder

Mọi dữ kiện kinh doanh nằm ở đúng hai nơi:

- `lib/site.ts` — domain, tên site, hotline, Zalo, email, địa chỉ, social,
  keywords theo locale.
- `messages/vi.json`, `messages/en.json` — toàn bộ copy.

Chưa có thông tin thật, nên:

- Copy khung (headline, nhãn nút, câu hỏi FAQ, tiêu đề section) viết thật, dùng
  được ngay.
- Mọi **dữ kiện có thể sai sự thật** — số học viên, tỉ lệ đỗ, học phí, tên giáo
  viên, địa chỉ, số điện thoại, lời chứng thực — để dạng `[TODO: ...]` nhìn là
  biết chưa điền. Không bịa số liệu quảng cáo.
- `SITE_URL` mặc định `https://tritueviet.example.com`, override bằng
  `NEXT_PUBLIC_SITE_URL`.

`CLAUDE.md` của repo (viết mới, tương ứng bản của `../landing-page`) liệt kê
chính xác file và key nào cần điền.

## SEO

`lib/site.ts` là nguồn sự thật duy nhất cho URL, tên, keywords, `sameAs`, và
helper hreflang / OG locale.

- `generateMetadata` trong `app/[locale]/layout.tsx`
- `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`
- JSON-LD qua `components/structured-data.tsx` + `lib/structured-data.ts`

Schema.org type khác `../landing-page` vì đây là cơ sở giáo dục có địa điểm
thật: `EducationalOrganization` + `LocalBusiness` (address, giờ mở cửa) +
`Course` cho từng môn.

## Brand assets

Chưa có file logo, nên **không** dựng pipeline sinh ảnh bằng Python như
`../landing-page`:

- `components/logo.tsx` render wordmark bằng SVG/text thuần.
- Favicon sinh runtime qua `app/icon.tsx` (`ImageResponse`).

Khi có logo thật thì thay bằng ảnh, không cần refactor.

## Testing

Test đặt ở `tests/**/*.test.{ts,tsx}`, mirror cấu trúc source:

- `tests/sections/` — một file render test cho mỗi section
- `tests/components/` — shared component
- `tests/seo/` — metadata route và structured data
- `tests/actions/` — validate schema và server action
- `tests/i18n/` — routing
- `tests/messages/parity.test.ts` — hai catalog trùng key

Cấu hình ở `vitest.config.mts`, setup ở `vitest.setup.ts`.

## Docker và mise

Giữ nguyên override pattern hiện có:

- `docker-compose.yaml` — base
- `docker-compose.override.yaml` — dev, tự động load
- `docker-compose.production.yaml` — prod, áp dụng tường minh

`Makefile` **bị xoá**, thay bằng mise file tasks:

- `mise/tasks/local/*` → `local:up`, `local:down`, `local:restart`, `local:start`,
  `local:stop`, `local:rm`, `local:connect`, `local:dev`
- `mise/tasks/prod/*` → `prod:up`, `prod:down`, `prod:restart`, `prod:start`,
  `prod:stop`, `prod:rm`

Mỗi task là bash script `#!/usr/bin/env bash` + `set -euo pipefail`, có dòng
`#MISE description=`. `mise.toml` chứa comment giải thích cách tổ chức.

Không tạo namespace `rpi:*` — repo này chưa deploy Raspberry Pi.

Dockerfile dev cài pnpm; `local:dev` chạy `pnpm dev` trong container.

## CI

`.github/workflows/lint-format.yml` chạy trên push và PR vào `develop`:
`pnpm install --frozen-lockfile` → `pnpm format:check` → `pnpm lint` →
**`pnpm test`**.

Bước test là điểm cố ý khác `../landing-page`, vốn không chạy test trong CI.

## Khác biệt có chủ đích so với `../landing-page`

| Điểm | Ở đây | Lý do |
| --- | --- | --- |
| Default locale | `vi` | Khách hàng là phụ huynh Việt Nam |
| Section | Gia sư (courses, teachers, pricing, achievements…) | Khác ngành |
| Schema.org | `EducationalOrganization` + `LocalBusiness` + `Course` | Cơ sở giáo dục có địa điểm |
| Logo | SVG wordmark trong code | Chưa có file art |
| CI | Có chạy test | Test không chạy trong CI thì gần như vô nghĩa |
| mise namespace | Không có `rpi:*` | Chưa deploy Pi |
| Package manager trong container | pnpm | Nhất quán với host |
| Đuôi compose file | `.yaml` | Đã dựng sẵn ở repo này; không ảnh hưởng hành vi |

## Ngoài phạm vi

- Nối form vào email/webhook/CRM
- CMS hoặc trang blog
- Nhiều trang ngoài landing page
- Deploy lên Raspberry Pi hoặc reverse proxy Caddy
- Analytics và tracking chuyển đổi
