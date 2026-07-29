# Brand Visual Identity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay bảng màu shadcn mặc định bằng nhận diện xanh tri thức + cam hồ phách, và phá thế đơn điệu của 11 section bằng nhịp sáng/tối chia trang thành 3 chương.

**Architecture:** Toàn bộ nhận diện nằm trong design token ở `app/globals.css`. Hai token family mới (`--highlight`, `--surface-ink`) được thêm vào bên cạnh token shadcn có sẵn thay vì ghi đè chúng. `components/section.tsx` nhận thêm prop `tone` và `align`; mỗi section chỉ khai báo tone của mình chứ không tự đặt màu. Hoạ tiết lưới và scroll-reveal là hai class CSS thuần, không thêm thư viện và không thêm `"use client"` vào bất kỳ section nào.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind v4, shadcn/ui, next-intl, Vitest + jsdom + @testing-library/react, Biome (format) + ESLint (lint), pnpm 11.9.0.

**Spec:** `docs/superpowers/specs/2026-07-29-brand-visual-identity-design.md`

## Global Constraints

- Package manager là **pnpm**. Không dùng `npm` hay `yarn`.
- **Không sửa `messages/vi.json` và `messages/en.json`.** Copy giữ nguyên. Đây là ràng buộc có chủ đích: hình sắc bén + lời ấm.
- Không sửa `lib/site.ts`, `lib/structured-data.ts`, `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`, `components/structured-data.tsx`, `app/actions/consultation.ts`, `consultation.schema.ts`, `i18n/`, `proxy.ts`, `enums/`.
- **Không thêm dependency nào.** Không framer-motion, không thư viện animation.
- **Không thêm `"use client"`** vào bất kỳ section component nào. Tất cả vẫn là Server Component.
- **Cam không bao giờ là màu chữ trên nền sáng** (chỉ đạt 2.1:1). Trên nền sáng cam chỉ làm nền nút, viền, đường kẻ.
- **Cam trên `--surface-ink` ở dark mode chỉ đạt 4.1:1** → chỉ dùng cho large text (≥24px, hoặc ≥18.66px in đậm). Chữ thân trên dải ink dùng `--surface-ink-foreground`.
- **Bất biến dark mode:** `--background` ở dark phải tối hơn `--surface-ink` ở dark. Vi phạm là mất toàn bộ nhịp điệu.
- Mỗi token mới phải khai báo ở **cả ba** chỗ trong `globals.css`: `@theme inline`, `:root`, `.dark`. Thiếu block đầu thì Tailwind không sinh ra utility class và lỗi này im lặng.
- Format bằng Biome (2 space, 100 cột, double quote, semicolon, trailing comma). Husky pre-commit tự chạy `lint-staged`.
- Conventional Commits, tiếng Việt cho phần mô tả. **Không** thêm dòng `Co-Authored-By` hay `Generated with`.
- Branch: `feature/brand-visual-identity`. Không commit thẳng vào `develop`.

### Giá trị OKLCH đã đối chiếu

Từ `node_modules/.pnpm/tailwindcss@4.3.3/node_modules/tailwindcss/theme.css` — dùng nguyên văn, không làm tròn:

```
--color-blue-500:  oklch(62.3% 0.214 259.815)
--color-blue-700:  oklch(48.8% 0.243 264.376)
--color-blue-800:  oklch(42.4% 0.199 265.638)
--color-amber-500: oklch(76.9% 0.188 70.08)
--color-amber-950: oklch(27.9% 0.077 45.635)
```

Các giá trị slate đã có sẵn trong `globals.css` hiện tại: slate-950 `oklch(0.129 0.042 264.695)`, slate-900 `oklch(0.208 0.042 265.755)`, slate-50 `oklch(0.984 0.003 247.858)`.

---

### Task 1: Design token foundation

**Files:**
- Modify: `app/globals.css`
- Modify: `app/[locale]/layout.tsx:18-22`
- Test: `tests/styles/tokens.test.ts` (create)

**Interfaces:**
- Consumes: nothing (first task)
- Produces: các utility class Tailwind sinh ra từ token mới, dùng ở mọi task sau: `bg-surface-ink`, `text-surface-ink-foreground`, `bg-highlight`, `text-highlight`, `text-highlight-foreground`, `border-surface-ink-foreground/15`. Font weight `800` khả dụng qua class `font-extrabold`.

- [ ] **Step 1: Write the failing test**

Tạo `tests/styles/tokens.test.ts`. Test này đọc `globals.css` dạng text vì token CSS không quan sát được từ jsdom — jsdom không chạy Tailwind. Mục tiêu là bắt cái bẫy "khai báo thiếu một trong ba block", lỗi không làm build đổ mà chỉ làm class không tồn tại trong im lặng.

```ts
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const css = readFileSync(fileURLToPath(new URL("../../app/globals.css", import.meta.url)), "utf8");

/**
 * Cắt ra thân của một block CSS top-level, cân bằng ngoặc nhọn.
 * Selector phải kèm dấu `{` — nếu tìm `.dark` trần thì nó khớp nhầm vào
 * `@custom-variant dark (&:is(.dark *))` ở đầu file và trả về block sai.
 */
function block(selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `không tìm thấy block "${selector}" trong globals.css`).toBeGreaterThan(-1);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`block "${selector}" không đóng ngoặc`);
}

const NEW_TOKENS = ["highlight", "highlight-foreground", "surface-ink", "surface-ink-foreground"];

describe("design tokens", () => {
  it("maps every new token in @theme inline so Tailwind emits the utility class", () => {
    const theme = block("@theme inline {");
    for (const token of NEW_TOKENS) {
      expect(theme, `thiếu --color-${token} trong @theme inline`).toContain(
        `--color-${token}: var(--${token});`,
      );
    }
  });

  it("defines every new token in :root", () => {
    const root = block(":root {");
    for (const token of NEW_TOKENS) {
      expect(root, `thiếu --${token} trong :root`).toMatch(new RegExp(`--${token}:`));
    }
  });

  it("defines every new token in .dark", () => {
    const dark = block(".dark {");
    for (const token of NEW_TOKENS) {
      expect(dark, `thiếu --${token} trong .dark`).toMatch(new RegExp(`--${token}:`));
    }
  });

  it("keeps the dark page background darker than the dark ink surface", () => {
    // Bất biến của thiết kế: ở dark mode dải ink phải NỔI trên nền, không chìm.
    const dark = block(".dark {");
    const lightness = (token: string) => {
      const match = dark.match(new RegExp(`--${token}:\\s*oklch\\(\\s*([\\d.]+)(%?)`));
      expect(match, `không đọc được độ sáng của --${token} trong .dark`).not.toBeNull();
      const value = Number(match![1]);
      return match![2] === "%" ? value / 100 : value;
    };
    expect(lightness("background")).toBeLessThan(lightness("surface-ink"));
  });

  it("sharpens the corner radius", () => {
    expect(block(":root {")).toContain("--radius: 0.375rem;");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run tests/styles/tokens.test.ts
```

Expected: FAIL — 5 test đổ, thông báo dạng `thiếu --color-highlight trong @theme inline` và `--radius: 0.375rem` không tìm thấy.

- [ ] **Step 3: Rewrite `app/globals.css` tokens**

Thay toàn bộ ba block `@theme inline`, `:root`, `.dark` bằng nội dung dưới đây. Giữ nguyên các dòng `@import` ở đầu file, `@custom-variant`, và `@layer base` ở cuối file.

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-highlight: var(--highlight);
  --color-highlight-foreground: var(--highlight-foreground);
  --color-surface-ink: var(--surface-ink);
  --color-surface-ink-foreground: var(--surface-ink-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 2px);
  --radius-md: var(--radius);
  --radius-lg: calc(var(--radius) + 2px);
  --radius-xl: calc(var(--radius) + 6px);
}

:root {
  --radius: 0.375rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.129 0.042 264.695);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.129 0.042 264.695);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.129 0.042 264.695);
  --primary: oklch(48.8% 0.243 264.376);
  --primary-foreground: oklch(0.984 0.003 247.858);
  --secondary: oklch(0.968 0.007 247.896);
  --secondary-foreground: oklch(0.208 0.042 265.755);
  --muted: oklch(0.968 0.007 247.896);
  --muted-foreground: oklch(0.554 0.046 257.417);
  --accent: oklch(0.968 0.007 247.896);
  --accent-foreground: oklch(0.208 0.042 265.755);
  --destructive: oklch(0.577 0.245 27.325);
  --highlight: oklch(76.9% 0.188 70.08);
  --highlight-foreground: oklch(27.9% 0.077 45.635);
  --surface-ink: oklch(0.129 0.042 264.695);
  --surface-ink-foreground: oklch(0.984 0.003 247.858);
  --border: oklch(0.929 0.013 255.508);
  --input: oklch(0.929 0.013 255.508);
  --ring: oklch(48.8% 0.243 264.376);
}

.dark {
  --background: oklch(0.1 0.03 264);
  --foreground: oklch(0.984 0.003 247.858);
  --card: oklch(0.208 0.042 265.755);
  --card-foreground: oklch(0.984 0.003 247.858);
  --popover: oklch(0.208 0.042 265.755);
  --popover-foreground: oklch(0.984 0.003 247.858);
  --primary: oklch(62.3% 0.214 259.815);
  --primary-foreground: oklch(0.129 0.042 264.695);
  --secondary: oklch(0.279 0.041 260.031);
  --secondary-foreground: oklch(0.984 0.003 247.858);
  --muted: oklch(0.279 0.041 260.031);
  --muted-foreground: oklch(0.704 0.04 256.788);
  --accent: oklch(0.279 0.041 260.031);
  --accent-foreground: oklch(0.984 0.003 247.858);
  --destructive: oklch(0.704 0.191 22.216);
  --highlight: oklch(76.9% 0.188 70.08);
  --highlight-foreground: oklch(27.9% 0.077 45.635);
  --surface-ink: oklch(42.4% 0.199 265.638);
  --surface-ink-foreground: oklch(0.984 0.003 247.858);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(62.3% 0.214 259.815);
}
```

Ba điểm dễ làm sai, đừng "sửa lại cho hợp lý":

1. `.dark` có `--primary-foreground` **tối** (slate-950) trong khi `:root` có nó **sáng**. Cố ý. Chữ trắng trên blue-500 chỉ đạt 3.7:1, trượt AA; chữ slate-950 đạt 5.7:1.
2. `--surface-ink` ở `.dark` là blue-800 chứ không phải slate-950. Nền dark đã tối hơn nó rồi, giữ slate-950 là hero chìm mất.
3. Thang `--radius-*` đổi công thức. Với `--radius` mới là 6px, công thức cũ (`calc(var(--radius) - 4px)`) cho `--radius-sm` = 2px, quá nhỏ.

- [ ] **Step 4: Thêm font weight 800**

Trong `app/[locale]/layout.tsx`, sửa mảng `weight` của `Be_Vietnam_Pro`:

```tsx
const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
});
```

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm exec vitest run tests/styles/tokens.test.ts
```

Expected: PASS — 5 test xanh.

- [ ] **Step 6: Verify nothing else broke and the app still compiles**

```bash
pnpm test && pnpm build
```

Expected: toàn bộ test xanh, build thành công. `pnpm build` là bước duy nhất chứng minh Tailwind parse được `globals.css` — vitest không chạy Tailwind nên một lỗi cú pháp CSS sẽ lọt qua Step 5.

- [ ] **Step 7: Commit**

```bash
git add app/globals.css app/[locale]/layout.tsx tests/styles/tokens.test.ts
git commit -m "feat(theme): thêm token thương hiệu xanh tri thức và cam hồ phách

Cam đi vào token mới --highlight thay vì --accent, vì shadcn dùng
--accent làm nền hover cho dropdown, accordion và button ghost — gán cam
vào đó sẽ khiến mọi hover trong trang loé cam.

--surface-ink đảo vai trò ở dark mode: light là dải navy tối nổi trên nền
trắng, dark là dải xanh sáng nổi trên nền tối hơn."
```

---

### Task 2: Prop `tone` và `align` cho Section

**Files:**
- Modify: `components/section.tsx`
- Test: `tests/components/section.test.tsx` (file **đã tồn tại** với 3 test — mở rộng, không tạo mới)

**Interfaces:**
- Consumes: class `bg-surface-ink`, `text-surface-ink-foreground`, `text-highlight` từ Task 1.
- Produces:
  ```tsx
  export type SectionTone = "light" | "muted" | "ink";
  export function Section(props: {
    id?: string;
    className?: string;
    eyebrow?: string;
    title?: string;
    description?: string;
    tone?: SectionTone;      // mặc định "light"
    align?: "center" | "start"; // mặc định "center"
    children: React.ReactNode;
  }): React.JSX.Element;
  ```
  Section render `<section data-tone={tone}>` bọc một `<div className="container ...">`. Task 5–8 dựa vào `data-tone` và vào việc `container` đã nằm **bên trong** Section.

- [ ] **Step 1: Write the failing tests**

Thêm vào cuối khối `describe("Section", ...)` trong `tests/components/section.test.tsx`, giữ nguyên 3 test có sẵn:

```tsx
  it("defaults to the light tone and centred alignment", () => {
    const { container } = render(
      <Section title="Khoá học">
        <p>content</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-tone", "light");
    expect(section?.className).toContain("bg-background");
    expect(container.querySelector(".text-center")).not.toBeNull();
  });

  it("paints the ink tone with the ink surface tokens", () => {
    const { container } = render(
      <Section tone="ink" title="Thành tích">
        <p>content</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-tone", "ink");
    expect(section?.className).toContain("bg-surface-ink");
    expect(section?.className).toContain("text-surface-ink-foreground");
  });

  it("paints the muted tone with the muted surface", () => {
    const { container } = render(
      <Section tone="muted" title="Hình thức học">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector("section")?.className).toContain("bg-muted");
  });

  it("switches the eyebrow to the highlight colour on the ink tone", () => {
    // Cam trên nền tối đạt 9.4:1 (light) / 4.1:1 (dark, đủ cho chữ đậm).
    // Trên nền sáng cam chỉ đạt 2.1:1 nên eyebrow phải là primary.
    const { rerender } = render(
      <Section tone="ink" title="Thành tích" eyebrow="Kết quả">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByText("Kết quả").className).toContain("text-highlight");

    rerender(
      <Section tone="light" title="Khoá học" eyebrow="Chương trình">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByText("Chương trình").className).toContain("text-primary");
  });

  it("drops the centring classes when aligned to the start", () => {
    const { container } = render(
      <Section align="start" title="Câu hỏi thường gặp">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector(".text-center")).toBeNull();
  });

  it("keeps the layout container inside the section element", () => {
    // Các section truyền className để chỉnh nền; container phải là con của
    // section thì nền mới phủ tràn viewport thay vì chỉ phủ bề rộng container.
    const { container } = render(
      <Section title="Khoá học">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector("section > .container")).not.toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm exec vitest run tests/components/section.test.tsx
```

Expected: 3 test cũ PASS, 6 test mới FAIL (không có `data-tone`, không có `section > .container`).

- [ ] **Step 3: Rewrite `components/section.tsx`**

```tsx
import { cn } from "@/lib/utils";

const TONES = {
  light: "bg-background text-foreground",
  muted: "bg-muted/40 text-foreground",
  ink: "bg-surface-ink text-surface-ink-foreground",
} as const;

export type SectionTone = keyof typeof TONES;

export function Section({
  id,
  className,
  eyebrow,
  title,
  description,
  tone = "light",
  align = "center",
  children,
}: {
  id?: string;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: SectionTone;
  align?: "center" | "start";
  children: React.ReactNode;
}) {
  const isInk = tone === "ink";

  return (
    <section id={id} data-tone={tone} className={cn(TONES[tone], className)}>
      <div className="container mx-auto px-4 py-16 md:py-24">
        {title ? (
          <div className={cn("mb-12 max-w-2xl", align === "center" && "mx-auto text-center")}>
            {eyebrow ? (
              <p
                className={cn(
                  "mb-3 text-xs font-semibold uppercase tracking-[0.2em]",
                  isInk ? "text-highlight" : "text-primary",
                )}
              >
                {eyebrow}
              </p>
            ) : null}
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] md:text-4xl">{title}</h2>
            {description ? (
              <p className={cn("mt-4", isInk ? "text-surface-ink-foreground/75" : "text-muted-foreground")}>
                {description}
              </p>
            ) : null}
          </div>
        ) : null}
        {children}
      </div>
    </section>
  );
}
```

Thay đổi cấu trúc quan trọng: `container mx-auto px-4 py-16` chuyển từ chính `<section>` xuống một `<div>` con. Bắt buộc phải vậy — nền tone cần phủ tràn chiều ngang viewport, mà `container` thì giới hạn bề rộng. `className` mà caller truyền vào vẫn nằm trên `<section>` như trước.

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm exec vitest run tests/components/section.test.tsx
```

Expected: PASS — cả 9 test.

- [ ] **Step 5: Check the section tests that consume Section**

```bash
pnpm test
```

Expected: toàn bộ xanh. Nếu `tests/sections/*.test.tsx` đổ, nguyên nhân gần như chắc chắn là assertion bám vào cấu trúc DOM cũ (`section.container`); sửa test cho khớp cấu trúc mới, đừng hoàn nguyên component.

- [ ] **Step 6: Commit**

```bash
git add components/section.tsx tests/components/section.test.tsx
git commit -m "feat(section): thêm prop tone và align

Nền tone phải phủ tràn chiều ngang viewport nên lớp container chuyển từ
chính thẻ section xuống một div con. Cả hai prop đều optional với mặc
định giữ nguyên hành vi cũ."
```

---

### Task 3: Variant `highlight` cho Button và bo góc sắc cho Card

**Files:**
- Modify: `components/ui/button.tsx:8-40`
- Modify: `components/ui/card.tsx:5-17`
- Test: `tests/components/ui-primitives.test.tsx` (create)

**Interfaces:**
- Consumes: `bg-highlight`, `text-highlight-foreground` từ Task 1.
- Produces: `<Button variant="highlight">` — CTA chính, dùng ở Task 5 (hero) và Task 7 (pricing). `Card` mặc định có hover lift + viền cam, dùng ở Task 7–9.

- [ ] **Step 1: Write the failing test**

Tạo `tests/components/ui-primitives.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

describe("Button", () => {
  it("paints the highlight variant with the amber CTA tokens", () => {
    render(<Button variant="highlight">Đăng ký học thử</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-highlight");
    expect(button.className).toContain("text-highlight-foreground");
  });

  it("uses amber as a background, never as the button's own text colour", () => {
    // Cam trên nền sáng chỉ đạt 2.1:1. Variant highlight phải là NỀN cam với
    // chữ amber-950, không bao giờ là chữ cam.
    render(<Button variant="highlight">Đăng ký</Button>);
    const classes = screen.getByRole("button").className.split(/\s+/);
    expect(classes).toContain("bg-highlight");
    expect(classes).toContain("text-highlight-foreground");
    expect(classes).not.toContain("text-highlight");
  });

  it("still exposes the variant through the data attribute", () => {
    render(<Button variant="highlight">Đăng ký</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "highlight");
  });

  it("leaves the default variant on the primary tokens", () => {
    render(<Button>Xem khoá học</Button>);
    expect(screen.getByRole("button").className).toContain("bg-primary");
  });
});

describe("Card", () => {
  it("suppresses the hover lift under reduced motion", () => {
    const { container } = render(<Card>nội dung</Card>);
    const card = container.querySelector('[data-slot="card"]');
    expect(card?.className).toContain("hover:border-highlight");
    expect(card?.className).toContain("motion-reduce:hover:translate-y-0");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run tests/components/ui-primitives.test.tsx
```

Expected: FAIL — variant `highlight` chưa tồn tại nên cva rơi về chuỗi rỗng, `bg-highlight` không có trong className.

- [ ] **Step 3: Thêm variant vào `components/ui/button.tsx`**

Trong object `variants.variant`, thêm một dòng ngay sau `default`:

```tsx
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        highlight: "bg-highlight text-highlight-foreground hover:bg-highlight/90",
```

Không đụng các variant còn lại, không đụng `size`.

- [ ] **Step 4: Chỉnh `components/ui/card.tsx`**

Thay class của `Card` (chỉ hàm `Card`, các hàm con giữ nguyên):

```tsx
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-6 rounded-lg border bg-card py-6 text-card-foreground shadow-sm",
        "transition-[transform,border-color] duration-200",
        "hover:-translate-y-0.5 hover:border-highlight motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
      {...props}
    />
  );
}
```

`rounded-xl` → `rounded-lg` để bám thang radius mới (Task 1 đặt `--radius-lg: calc(var(--radius) + 2px)` = 8px).

- [ ] **Step 5: Run test to verify it passes**

```bash
pnpm exec vitest run tests/components/ui-primitives.test.tsx
```

Expected: PASS — 5 test.

- [ ] **Step 6: Commit**

```bash
git add components/ui/button.tsx components/ui/card.tsx tests/components/ui-primitives.test.tsx
git commit -m "feat(ui): thêm variant highlight cho Button và hover lift cho Card"
```

---

### Task 4: Hoạ tiết lưới và scroll-reveal

**Files:**
- Modify: `app/globals.css` (thêm vào cuối file, sau `@layer base`)
- Test: `tests/styles/tokens.test.ts` (mở rộng file tạo ở Task 1)

**Interfaces:**
- Consumes: `--surface-ink-foreground` từ Task 1.
- Produces: hai class CSS thuần dùng ở Task 5–9:
  - `.bg-grid` — lưới kẻ mờ dần ra rìa. **Chỉ dùng trên nền `tone="ink"`.**
  - `.reveal` — fade + trượt lên khi cuộn vào tầm nhìn. An toàn ở mọi trình duyệt.

- [ ] **Step 1: Write the failing test**

Thêm vào cuối `tests/styles/tokens.test.ts`, sau khối `describe("design tokens", ...)`:

```ts
describe("motion and pattern utilities", () => {
  it("keeps the .reveal rule inside the @supports guard", () => {
    // Nếu .reveal lọt ra ngoài @supports, Firefox (chưa hỗ trợ
    // animation-timeline) sẽ giữ nội dung ở trạng thái đầu của keyframe và
    // ẩn chữ vĩnh viễn. Đây là chế độ hỏng tệ nhất của cả thiết kế.
    const guard = css.indexOf("@supports (animation-timeline: view())");
    expect(guard, "thiếu block @supports cho animation-timeline").toBeGreaterThan(-1);

    const open = css.indexOf("{", guard);
    let depth = 0;
    let close = -1;
    for (let i = open; i < css.length; i++) {
      if (css[i] === "{") depth++;
      else if (css[i] === "}") {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    expect(close).toBeGreaterThan(open);

    const revealRule = css.indexOf(".reveal {");
    expect(revealRule, "không tìm thấy rule .reveal").toBeGreaterThan(-1);
    expect(revealRule).toBeGreaterThan(open);
    expect(revealRule).toBeLessThan(close);
  });

  it("honours prefers-reduced-motion", () => {
    expect(css).toContain("prefers-reduced-motion: no-preference");
  });

  it("defines the grid pattern utility", () => {
    expect(css).toContain(".bg-grid {");
    expect(css).toContain("mask-image:");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run tests/styles/tokens.test.ts
```

Expected: 5 test của Task 1 PASS, 3 test mới FAIL với `thiếu block @supports cho animation-timeline`.

- [ ] **Step 3: Thêm CSS vào cuối `app/globals.css`**

Nối vào **sau** khối `@layer base { ... }`:

```css
/* Lưới kẻ mờ dần ra rìa. Chỉ dùng trên nền tone="ink" — trên nền sáng nó
   gần như vô hình và chỉ làm bẩn ảnh render. */
.bg-grid {
  background-image:
    linear-gradient(
      to right,
      color-mix(in oklab, var(--surface-ink-foreground) 8%, transparent) 1px,
      transparent 1px
    ),
    linear-gradient(
      to bottom,
      color-mix(in oklab, var(--surface-ink-foreground) 8%, transparent) 1px,
      transparent 1px
    );
  background-size: 2rem 2rem;
  mask-image: radial-gradient(ellipse 80% 70% at 50% 0%, #000 30%, transparent 100%);
}

@keyframes reveal-in {
  from {
    opacity: 0;
    transform: translateY(1rem);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

/* Hai lớp bảo vệ, cả hai đều bắt buộc:
   - @supports  → trình duyệt chưa có animation-timeline (Firefox) không bao
     giờ chạm tới rule này, nên không bao giờ nhận opacity: 0 từ keyframe.
   - no-preference → người tắt hiệu ứng chuyển động cũng không chạm tới.
   Trạng thái mặc định của .reveal là "hiện đầy đủ, không animation". */
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) {
    .reveal {
      animation: reveal-in linear both;
      animation-timeline: view();
      animation-range: entry 0% entry 60%;
    }
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm exec vitest run tests/styles/tokens.test.ts
```

Expected: PASS — 8 test.

- [ ] **Step 5: Verify Tailwind still parses the stylesheet**

```bash
pnpm build
```

Expected: build thành công. `color-mix`, `mask-image` và `animation-timeline` đều phải qua được Lightning CSS — vitest không kiểm được điều này.

- [ ] **Step 6: Commit**

```bash
git add app/globals.css tests/styles/tokens.test.ts
git commit -m "feat(theme): thêm hoạ tiết lưới và scroll-reveal thuần CSS

Scroll-reveal nằm trong @supports lồng @media(no-preference) nên trạng
thái mặc định là hiện đầy đủ không animation. Trình duyệt chưa hỗ trợ
animation-timeline không bao giờ chạm tới opacity: 0 của keyframe."
```

---

### Task 5: Hero và Stats thành một khối ink liền

**Files:**
- Modify: `app/[locale]/(public)/home/_components/hero.tsx`
- Modify: `app/[locale]/(public)/home/_components/stats.tsx`
- Test: `tests/sections/hero.test.tsx` (mở rộng), `tests/sections/stats.test.tsx` (mở rộng)

**Interfaces:**
- Consumes: `bg-surface-ink`, `text-surface-ink-foreground`, `text-highlight` (Task 1); `<Button variant="highlight">` (Task 3); `.bg-grid`, `.reveal` (Task 4).
- Produces: chương 1 của trang. Task 6 (header) dựa vào việc hero đã là nền ink để chọn màu header.

Hero và Stats **không** dùng `Section` — cả hai là container riêng, giữ nguyên như hiện tại.

- [ ] **Step 1: Write the failing tests**

Thêm vào `tests/sections/hero.test.tsx`, trong khối `describe("Hero", ...)`:

```tsx
  it("sits on the ink surface with the grid pattern", () => {
    const { container } = renderHero();
    const root = container.querySelector("#top");
    expect(root?.className).toContain("bg-surface-ink");
    expect(container.querySelector(".bg-grid")).not.toBeNull();
  });

  it("makes the registration CTA the amber highlight button", () => {
    const { container } = renderHero();
    const cta = container.querySelector('a[href="#dang-ky"]');
    expect(cta?.className).toContain("bg-highlight");
  });

  it("does not close the hero with a border so stats reads as the same block", () => {
    const { container } = renderHero();
    expect(container.querySelector("#top")?.className).not.toContain("border-b");
  });
```

Thêm vào `tests/sections/stats.test.tsx`, trong khối `describe("Stats", ...)`:

```tsx
  it("continues the ink block and paints the figures amber", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Stats />
      </NextIntlClientProvider>,
    );
    const root = container.firstElementChild;
    expect(root?.className).toContain("bg-surface-ink");
    expect(root?.className).not.toContain("border-b");
    // Con số là large text (>=30px, font-extrabold) nên cam đạt ngưỡng AA 3:1
    // ngay cả ở dark mode, nơi cam trên ink chỉ được 4.1:1.
    expect(container.querySelector(".text-highlight")).not.toBeNull();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm exec vitest run tests/sections/hero.test.tsx tests/sections/stats.test.tsx
```

Expected: test cũ PASS, 4 test mới FAIL.

- [ ] **Step 3: Rewrite `hero.tsx`**

```tsx
import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SITE_PHONE, SITE_ZALO_URL } from "@/lib/site";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <div
      id="top"
      className="relative overflow-hidden bg-surface-ink text-surface-ink-foreground"
    >
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-highlight">
          {t("eyebrow")}
        </p>
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-[-0.03em] md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-surface-ink-foreground/75">{t("subtitle")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" variant="highlight">
            <a href="#dang-ky">{t("ctaPrimary")}</a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-surface-ink-foreground/25 bg-transparent text-surface-ink-foreground hover:bg-surface-ink-foreground/10 hover:text-surface-ink-foreground dark:border-surface-ink-foreground/25 dark:bg-transparent dark:hover:bg-surface-ink-foreground/10"
          >
            <a href="#khoa-hoc">{t("ctaSecondary")}</a>
          </Button>
        </div>
        <div className="mt-8 flex flex-col gap-4 text-sm text-surface-ink-foreground/75 sm:flex-row">
          <a
            href={`tel:${SITE_PHONE}`}
            className="inline-flex items-center gap-2 hover:text-surface-ink-foreground hover:underline"
          >
            <Phone className="h-4 w-4" />
            {t("callNow")}
          </a>
          <a
            href={SITE_ZALO_URL}
            className="inline-flex items-center gap-2 hover:text-surface-ink-foreground hover:underline"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            {t("chatZalo")}
          </a>
        </div>
      </div>
    </div>
  );
}
```

Ba thay đổi đáng chú ý: bỏ `text-center` (nội dung căn trái theo hướng đã chọn), bỏ `border-b` và `bg-muted/30`, và variant `outline` phải override cả biến thể `dark:` của nó vì mặc định shadcn đặt `dark:bg-input/30` — trên nền ink thì nó lộ ra thành một mảng xám.

- [ ] **Step 4: Rewrite `stats.tsx`**

```tsx
import { useTranslations } from "next-intl";

const KEYS = ["students", "years", "passRate", "teachers"] as const;

export function Stats() {
  const t = useTranslations("stats");

  return (
    <div className="bg-surface-ink text-surface-ink-foreground">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 pb-16 md:grid-cols-4 md:pb-24">
        {KEYS.map((key) => (
          <div key={key} className="reveal border-t border-surface-ink-foreground/15 pt-4">
            <p className="text-3xl font-extrabold tracking-[-0.03em] text-highlight md:text-4xl">
              {t(`${key}.value`)}
            </p>
            <p className="mt-2 text-sm text-surface-ink-foreground/70">{t(`${key}.label`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

Không có padding trên và không có `border-b`: padding dưới của hero đã lo khoảng cách, và bỏ đường kẻ là điều khiến hero + stats đọc như một khối liền.

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm exec vitest run tests/sections/hero.test.tsx tests/sections/stats.test.tsx
```

Expected: PASS — 7 test hero, 2 test stats.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/(public)/home/_components/hero.tsx" "app/[locale]/(public)/home/_components/stats.tsx" tests/sections/hero.test.tsx tests/sections/stats.test.tsx
git commit -m "feat(hero): dựng hero và stats thành một khối ink liền

Bỏ border-b giữa hai section và bỏ padding trên của stats để hai phần đọc
như một khối. Variant outline phải override cả biến thể dark: của shadcn
vì dark:bg-input/30 lộ thành mảng xám trên nền ink."
```

---

### Task 6: SiteHeader trên nền ink và Logo hợp tông

**Files:**
- Modify: `components/site-header.tsx:24-30` (thẻ `<header>` và nav link)
- Modify: `components/logo.tsx`
- Test: `tests/components/site-header.test.tsx` (mở rộng), `tests/components/logo.test.tsx` (mở rộng)

**Interfaces:**
- Consumes: `bg-surface-ink`, `text-surface-ink-foreground`, `text-highlight` (Task 1); `<Button variant="highlight">` (Task 3).
- Produces: header dùng chung token với hero nên tự đảo theo dark mode.

Cả hai file test đã tồn tại và **không** có assertion nào bám vào class — chúng chỉ kiểm anchor, `aria-hidden` và text. Nên chỉ cần thêm test mới, không phải sửa test cũ. `site-header.test.tsx` đã có sẵn helper `renderHeader()`; `logo.test.tsx` render thẳng `<Logo />`.

- [ ] **Step 1: Write the failing tests**

Thêm vào cuối khối `describe("SiteHeader", ...)` trong `tests/components/site-header.test.tsx`:

```tsx
  it("sits on the ink surface so it reads as part of the hero", () => {
    const { container } = renderHeader();
    const header = container.querySelector("header");
    expect(header?.className).toContain("bg-surface-ink");
    expect(header?.className).toContain("text-surface-ink-foreground");
  });

  it("makes the register button the amber highlight", () => {
    const { container } = renderHeader();
    const register = container.querySelector('a[href="#dang-ky"]');
    expect(register?.className).toContain("bg-highlight");
  });
```

Thêm vào cuối khối `describe("Logo", ...)` trong `tests/components/logo.test.tsx`:

```tsx
  it("uses currentColor for the mark so it inherits the surface it sits on", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("class")).not.toContain("text-primary");
  });
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm exec vitest run tests/components/site-header.test.tsx tests/components/logo.test.tsx
```

Expected: test mới FAIL.

- [ ] **Step 3: Sửa `components/site-header.tsx`**

Thẻ `<header>`:

```tsx
    <header className="sticky top-0 z-50 w-full bg-surface-ink text-surface-ink-foreground">
```

Bỏ `border-b`, `bg-background/80` và `backdrop-blur` — header giờ đặc và liền mạch với hero.

Nav link (trong `NAV_ITEMS.map`):

```tsx
              className="text-sm font-medium text-surface-ink-foreground/70 hover:text-surface-ink-foreground"
```

Nút đăng ký ở cuối:

```tsx
          <Button asChild size="sm" variant="highlight" className="ml-1">
            <a href="#dang-ky">{t("register")}</a>
          </Button>
```

Ba `Button variant="ghost"` (menu, hotline) và `LanguageSwitcher` / `ModeToggle` nằm trên nền tối: thêm class để chúng đọc được. Với mỗi `Button variant="ghost"` trong file, thêm vào `className`:

```tsx
className="text-surface-ink-foreground hover:bg-surface-ink-foreground/10 hover:text-surface-ink-foreground dark:hover:bg-surface-ink-foreground/10"
```

Với nút `md:hidden` thì giữ cả `md:hidden` trong chuỗi class đó.

- [ ] **Step 4: Sửa `components/logo.tsx`**

```tsx
import { cn } from "@/lib/utils";
import { SITE_SHORT_NAME } from "@/lib/site";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-extrabold", className)}>
      <svg viewBox="0 0 32 32" className="h-8 w-8 shrink-0" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        <path d="M4 8h24v4H18v14h-4V12H4V8Z" fill="currentColor" />
        <path d="M18 22h10v3H18z" fill="var(--highlight)" />
      </svg>
      <span className="text-lg tracking-[-0.03em]">{SITE_SHORT_NAME}</span>
    </span>
  );
}
```

Bỏ `text-primary` khỏi svg: logo giờ xuất hiện trên cả nền ink (header) lẫn nền muted (footer), nên nó phải thừa kế màu chữ của chỗ nó đứng. Gạch cam là điểm nhấn thương hiệu duy nhất được hardcode, và nó là hình khối chứ không phải chữ nên không vướng ràng buộc tương phản.

- [ ] **Step 5: Run tests to verify they pass**

```bash
pnpm exec vitest run tests/components/site-header.test.tsx tests/components/logo.test.tsx
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add components/site-header.tsx components/logo.tsx tests/components/site-header.test.tsx tests/components/logo.test.tsx
git commit -m "feat(header): đặt header trên nền ink và cho logo thừa kế màu chữ

Logo xuất hiện trên cả nền ink (header) lẫn nền muted (footer) nên bỏ
text-primary để nó thừa kế currentColor thay vì cố định một màu."
```

---

### Task 7: Áp nhịp cho bảy section thân trang

**Files:**
- Modify: `app/[locale]/(public)/home/_components/courses.tsx`
- Modify: `app/[locale]/(public)/home/_components/formats.tsx`
- Modify: `app/[locale]/(public)/home/_components/process.tsx`
- Modify: `app/[locale]/(public)/home/_components/teachers.tsx`
- Modify: `app/[locale]/(public)/home/_components/pricing.tsx`
- Modify: `app/[locale]/(public)/home/_components/testimonials.tsx`
- Modify: `app/[locale]/(public)/home/_components/faq.tsx`
- Test: `tests/sections/rhythm.test.tsx` (create)

**Interfaces:**
- Consumes: `Section` với `tone`/`align` (Task 2); `Card` hover (Task 3); `.reveal` (Task 4); `<Button variant="highlight">` (Task 3).
- Produces: chương 2 và 3 của trang.

Bảng tone cho task này (trích từ spec):

| Section | tone | align |
| --- | --- | --- |
| courses | light | start |
| formats | muted | center |
| process | light | center |
| teachers | muted | center |
| pricing | light | center |
| testimonials | muted | center |
| faq | light | start |

- [ ] **Step 1: Write the failing test**

Tạo `tests/sections/rhythm.test.tsx`. Test này giữ bản đồ nhịp ở một chỗ duy nhất, nên đổi nhịp về sau là đổi một bảng chứ không đi lục 11 file.

```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Courses } from "@/app/[locale]/(public)/home/_components/courses";
import { Formats } from "@/app/[locale]/(public)/home/_components/formats";
import { Process } from "@/app/[locale]/(public)/home/_components/process";
import { Teachers } from "@/app/[locale]/(public)/home/_components/teachers";
import { Pricing } from "@/app/[locale]/(public)/home/_components/pricing";
import { Testimonials } from "@/app/[locale]/(public)/home/_components/testimonials";
import { Faq } from "@/app/[locale]/(public)/home/_components/faq";

const RHYTHM = [
  { name: "courses", Component: Courses, tone: "light" },
  { name: "formats", Component: Formats, tone: "muted" },
  { name: "process", Component: Process, tone: "light" },
  { name: "teachers", Component: Teachers, tone: "muted" },
  { name: "pricing", Component: Pricing, tone: "light" },
  { name: "testimonials", Component: Testimonials, tone: "muted" },
  { name: "faq", Component: Faq, tone: "light" },
] as const;

describe("section rhythm", () => {
  it.each(RHYTHM)("renders $name on the $tone tone", ({ Component, tone }) => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Component />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("section")).toHaveAttribute("data-tone", tone);
  });

  it("alternates tones so no two neighbouring sections share a background", () => {
    // Đọc tone từ DOM đã render, không đọc từ hằng RHYTHM ở trên — nếu so
    // RHYTHM với chính nó thì test luôn xanh và không chứng minh được gì.
    const rendered = RHYTHM.map(({ name, Component }) => {
      const { container } = render(
        <NextIntlClientProvider locale="vi" messages={vi}>
          <Component />
        </NextIntlClientProvider>,
      );
      return { name, tone: container.querySelector("section")?.getAttribute("data-tone") };
    });

    for (let i = 1; i < rendered.length; i++) {
      expect(
        rendered[i].tone,
        `${rendered[i].name} trùng tone với ${rendered[i - 1].name}`,
      ).not.toBe(rendered[i - 1].tone);
    }
  });

  it("leaves no section painting its own background by hand", () => {
    // Nền là việc của prop tone. Một className="bg-muted/30" sót lại sẽ chèn
    // lên tone và làm gãy nhịp mà không test nào khác bắt được.
    for (const { Component } of RHYTHM) {
      const { container } = render(
        <NextIntlClientProvider locale="vi" messages={vi}>
          <Component />
        </NextIntlClientProvider>,
      );
      expect(container.querySelector("section")?.className).not.toContain("bg-muted/30");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run tests/sections/rhythm.test.tsx
```

Expected: FAIL — chưa section nào có `data-tone` đúng, và `formats`/`teachers`/`pricing`/`faq` vẫn mang `className="bg-muted/30"`.

- [ ] **Step 3: Áp tone cho từng section**

Với mỗi file, sửa phần props của `<Section>`. **Xoá hẳn** `className="bg-muted/30"` ở đâu còn — nền giờ do `tone` quyết định.

`courses.tsx`:

```tsx
    <Section
      id="khoa-hoc"
      tone="light"
      align="start"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
```

Thêm `reveal` vào Card trong cùng file:

```tsx
          <Card key={item.name} className="reveal h-full">
```

`formats.tsx` — bỏ `className="bg-muted/30"`, thêm `tone="muted"`:

```tsx
    <Section
      id="hinh-thuc"
      tone="muted"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
```

và `<Card key={item.name} className="reveal h-full">`.

`process.tsx` — thêm `tone="light"`, và đổi đường kẻ trên mỗi bước sang cam để chương này có điểm nhấn:

```tsx
    <Section
      id="quy-trinh"
      tone="light"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
```

```tsx
          <li key={step.title} className="reveal relative border-t-2 border-highlight pt-6">
            <span className="text-sm font-bold tracking-widest text-primary">
```

Đường kẻ cam là hình khối, không phải chữ, nên hợp lệ trên nền sáng. Số thứ tự giữ `text-primary` — chữ cam trên nền sáng là vi phạm.

`teachers.tsx` — bỏ `className="bg-muted/30"`, thêm `tone="muted"`, và `<Card key={...} className="reveal h-full text-center">`.

`pricing.tsx` — bỏ `className="bg-muted/30"`, thêm `tone="light"`, `<Card key={plan.name} className="reveal flex h-full flex-col">`, và đổi CTA sang cam:

```tsx
              <Button asChild variant="highlight" className="mt-auto w-full">
                <a href="#dang-ky">{t("cta")}</a>
              </Button>
```

`testimonials.tsx` — thêm `tone="muted"`, `<Card key={...} className="reveal h-full">`.

`faq.tsx` — bỏ `className="bg-muted/30"`, thêm `tone="light"` và `align="start"`:

```tsx
    <Section id="cau-hoi" tone="light" align="start" eyebrow={t("eyebrow")} title={t("title")}>
      <Accordion type="single" collapsible className="max-w-3xl">
```

Bỏ `mx-auto` khỏi Accordion để nó theo lề trái cùng tiêu đề.

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm exec vitest run tests/sections/rhythm.test.tsx
```

Expected: PASS — 9 test.

- [ ] **Step 5: Verify the existing section tests still pass**

```bash
pnpm test
```

Expected: toàn bộ xanh.

- [ ] **Step 6: Commit**

```bash
git add "app/[locale]/(public)/home/_components" tests/sections/rhythm.test.tsx
git commit -m "feat(sections): áp nhịp sáng tối cho bảy section thân trang

Nền chuyển hết về prop tone, không section nào tự sơn nền bằng className
nữa. Bản đồ nhịp nằm trong tests/sections/rhythm.test.tsx nên đổi nhịp
về sau là đổi một bảng chứ không lục từng file."
```

---

### Task 8: Hai dải ink còn lại và footer

**Files:**
- Modify: `app/[locale]/(public)/home/_components/achievements.tsx`
- Modify: `app/[locale]/(public)/home/_components/contact.tsx`
- Modify: `app/[locale]/(public)/home/_components/footer.tsx`
- Test: `tests/sections/rhythm.test.tsx` (mở rộng file tạo ở Task 7)

**Interfaces:**
- Consumes: `Section tone="ink"` (Task 2), token ink và highlight (Task 1), `.reveal` (Task 4).
- Produces: breakpoint giữa trang và dải đóng trang — hoàn tất bản đồ nhịp 11 section.

- [ ] **Step 1: Write the failing test**

Thêm vào `tests/sections/rhythm.test.tsx`:

```tsx
import { Achievements } from "@/app/[locale]/(public)/home/_components/achievements";
import { Contact } from "@/app/[locale]/(public)/home/_components/contact";

describe("ink chapters", () => {
  it.each([
    { name: "achievements", Component: Achievements },
    { name: "contact", Component: Contact },
  ])("renders $name on the ink tone", ({ Component }) => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Component />
      </NextIntlClientProvider>,
    );
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-tone", "ink");
    expect(section?.className).toContain("bg-surface-ink");
  });

  it("keeps body copy on the ink tone off amber", () => {
    // Cam trên ink ở dark mode chỉ đạt 4.1:1 — đủ cho chữ đậm cỡ lớn,
    // không đủ cho chữ thân. Chữ thân phải dùng surface-ink-foreground.
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Achievements />
      </NextIntlClientProvider>,
    );
    const body = container.querySelectorAll("p.text-sm");
    expect(body.length, "không tìm thấy chữ thân nào để kiểm").toBeGreaterThan(0);
    for (const p of body) {
      expect(p.className.split(/\s+/)).not.toContain("text-highlight");
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm exec vitest run tests/sections/rhythm.test.tsx
```

Expected: hai test `renders $name on the ink tone` FAIL.

- [ ] **Step 3: Sửa `achievements.tsx`**

Thêm `tone="ink"` vào `<Section>`, và cho Card đọc được trên nền tối:

```tsx
    <Section
      id="thanh-tich"
      tone="ink"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Card
            key={`achievement-${index}`}
            className="reveal h-full border-surface-ink-foreground/15 bg-surface-ink-foreground/5 text-surface-ink-foreground"
          >
            <CardHeader>
              <Trophy className="mb-2 h-6 w-6 text-highlight" aria-hidden="true" />
              <h3 className="text-lg font-semibold leading-none">{item.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-surface-ink-foreground/70">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
```

Icon Trophy màu cam hợp lệ: nó là icon, không phải chữ.

- [ ] **Step 4: Sửa `contact.tsx`**

Thêm `tone="ink"` và cho danh sách liên hệ đọc được trên nền tối. Form (`ConsultationForm`) giữ nguyên `bg-card` mặc định nên nó tự nổi lên như một thẻ sáng trên nền ink — đúng ý đồ, không cần sửa `consultation-form.tsx`.

```tsx
    <Section
      id="dang-ky"
      tone="ink"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <ul className="space-y-6">
          {details.map((detail) => (
            <li key={detail.label} className="flex gap-3">
              <detail.icon className="mt-1 h-5 w-5 shrink-0 text-highlight" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{detail.label}</p>
                {detail.href ? (
                  <a
                    href={detail.href}
                    className="text-sm text-surface-ink-foreground/70 hover:text-surface-ink-foreground hover:underline"
                  >
                    {detail.value}
                  </a>
                ) : (
                  <p className="text-sm text-surface-ink-foreground/70">{detail.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <ConsultationForm />
      </div>
    </Section>
```

- [ ] **Step 5: Sửa `footer.tsx`**

Footer nối tiếp dải ink của contact nên cũng dùng nền ink, tách bằng một đường kẻ mảnh thay vì đổi màu:

```tsx
    <footer className="border-t border-surface-ink-foreground/15 bg-surface-ink text-surface-ink-foreground">
```

Đổi mọi `text-muted-foreground` trong file thành `text-surface-ink-foreground/70`, và mọi `hover:text-foreground` thành `hover:text-surface-ink-foreground`. Dòng bản quyền cuối:

```tsx
      <div className="border-t border-surface-ink-foreground/15 py-6 text-center text-xs text-surface-ink-foreground/60">
```

- [ ] **Step 6: Run test to verify it passes**

```bash
pnpm exec vitest run tests/sections/rhythm.test.tsx tests/sections/footer.test.tsx tests/sections/contact.test.tsx tests/sections/achievements.test.tsx
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add "app/[locale]/(public)/home/_components" tests/sections/rhythm.test.tsx
git commit -m "feat(sections): dựng hai dải ink giữa và cuối trang

Form tư vấn giữ nguyên bg-card nên nó tự nổi thành thẻ sáng trên nền ink.
Footer nối tiếp dải ink của contact, tách bằng đường kẻ mảnh thay vì đổi
màu nền."
```

---

### Task 9: Kiểm chứng toàn bộ

**Files:** không sửa file nào trừ khi phát hiện lỗi.

**Interfaces:**
- Consumes: toàn bộ Task 1–8.
- Produces: xác nhận trang chạy được thật.

- [ ] **Step 1: Chạy full pipeline đúng thứ tự CI**

```bash
pnpm format:check && pnpm lint && pnpm test && pnpm build
```

Expected: cả bốn xanh. Nếu `format:check` đỏ, chạy `pnpm format` rồi commit lại. `pnpm build` là bước duy nhất chứng minh Server Component render được và Tailwind parse được stylesheet.

- [ ] **Step 2: Khởi động dev server**

```bash
pnpm dev
```

Mở http://localhost:3000/vi.

- [ ] **Step 3: Kiểm tra tay theo checklist**

Đây là những thứ không test tự động nào bắt được. Ghi lại kết quả từng dòng.

- [ ] Cuộn hết trang ở **light mode**: thấy đúng ba dải tối — (hero + stats), achievements, (contact + footer). Hero và stats phải đọc như một khối liền, không có đường kẻ chia.
- [ ] Bật **dark mode** bằng nút toggle: ba dải ink phải **sáng hơn** nền trang, không chìm. Nếu chìm là `--surface-ink` trong `.dark` bị đặt sai.
- [ ] Không có chữ màu cam nào nằm trên nền sáng. Kiểm kỹ: số thứ tự trong Process, nhãn cấp lớp trong Courses, giá trong Pricing.
- [ ] Header đọc được ở cả hai chế độ: nav link, nút hotline, language switcher, mode toggle.
- [ ] Mở dropdown menu (nút hamburger ở màn hình hẹp) và accordion FAQ: hover **không** loé cam. Nếu loé là cam đã lọt vào `--accent`.
- [ ] Thu hẹp cửa sổ xuống 375px: không có tràn ngang, các dải ink vẫn phủ hết chiều ngang.
- [ ] Bật `prefers-reduced-motion: reduce` (macOS: System Settings → Accessibility → Display → Reduce motion): toàn bộ nội dung vẫn hiện đầy đủ, không có khối nào vô hình.
- [ ] Mở trang bằng **Firefox**: các khối `.reveal` (bốn ô số liệu, các card) phải hiện ngay lập tức. Nếu có khối nào vô hình thì rule `.reveal` đã lọt ra ngoài `@supports`.
- [ ] Đổi sang `/en`: bố cục không vỡ vì chuỗi tiếng Anh dài hơn.

- [ ] **Step 4: Commit bất kỳ sửa lỗi nào**

```bash
git add -A
git commit -m "fix(theme): <mô tả lỗi cụ thể đã sửa>"
```

Nếu checklist sạch thì không có gì để commit — bỏ qua bước này.

- [ ] **Step 5: Báo cáo trung thực**

Ghi lại: lệnh nào đã chạy, kết quả thật, dòng checklist nào chưa kiểm được và vì sao (ví dụ không có sẵn Firefox). Không tuyên bố xong nếu còn dòng chưa kiểm.

---

## Những gì plan này cố tình không làm

- Không điền dữ liệu thật. `[TODO: ...]` trong `messages/*.json`, `SITE_PHONE`, `SITE_ZALO_URL`, `SITE_EMAIL`, `SITE_ADDRESS`, `SITE_URL`, `SITE_SAME_AS` vẫn là placeholder. `tests/messages/placeholders.test.ts` phải tiếp tục xanh — nếu nó đỏ nghĩa là ai đó đã sửa message catalog, vi phạm Global Constraints.
- Không thay logo/artwork thật.
- Không thêm ảnh chụp.
- Không chuyển form sang webhook / Google Sheet / email.
