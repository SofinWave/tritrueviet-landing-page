import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { readFileSync } from "node:fs";
// Xem chú thích trong tokens.test.ts: bí danh NodeURL tránh việc Vite viết lại
// literal `new URL(str, import.meta.url)` thành URL asset của dev server.
import { URL as NodeURL, fileURLToPath } from "node:url";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { INK_SURFACE } from "@/components/section";
import { SiteHeader } from "@/components/site-header";
import { Achievements } from "@/app/[locale]/(public)/home/_components/achievements";
import { Contact } from "@/app/[locale]/(public)/home/_components/contact";
import { Courses } from "@/app/[locale]/(public)/home/_components/courses";
import { Faq } from "@/app/[locale]/(public)/home/_components/faq";
import { SiteFooter } from "@/app/[locale]/(public)/home/_components/footer";
import { Formats } from "@/app/[locale]/(public)/home/_components/formats";
import { Hero } from "@/app/[locale]/(public)/home/_components/hero";
import { Pricing } from "@/app/[locale]/(public)/home/_components/pricing";
import { Process } from "@/app/[locale]/(public)/home/_components/process";
import { Stats } from "@/app/[locale]/(public)/home/_components/stats";
import { Teachers } from "@/app/[locale]/(public)/home/_components/teachers";
import { Testimonials } from "@/app/[locale]/(public)/home/_components/testimonials";

/**
 * `page.tsx` là Server Component async và KHÔNG render sạch dưới jsdom:
 * `setRequestLocale` ném ngay vì next-intl phân giải "next-intl/server" sang
 * bản react-client, và `<StructuredData>` là component async nên treo cả cây
 * ở trạng thái suspend. Vá cả hai bằng mock là dựng một môi trường RSC giả —
 * mong manh và không chứng minh thêm được gì.
 *
 * Thay vào đó: ĐỌC thứ tự component từ chính source của page.tsx, rồi render
 * từng component để lấy tone thật. Cách này vẫn bắt đúng hai kiểu hỏng quan
 * trọng — đảo thứ tự trong page.tsx, và đổi giá trị `tone=` của một section.
 */
const PAGE_SOURCE = readFileSync(
  fileURLToPath(new NodeURL("../../app/[locale]/(public)/home/page.tsx", import.meta.url)),
  "utf8",
);

const REGISTRY = {
  Hero,
  Stats,
  Courses,
  Formats,
  Process,
  Teachers,
  Achievements,
  Pricing,
  Testimonials,
  Faq,
  Contact,
} as const;

/**
 * Nhịp sáng tối thật của trang, theo đúng thứ tự trong page.tsx.
 *
 * Ba "chương", mỗi chương mở bằng một dải ink:
 *   1. hero + stats (ink) → courses, formats, process, teachers
 *   2. achievements (ink) → pricing, testimonials, faq
 *   3. contact (ink)
 *
 * Đây là sản phẩm trung tâm của cả nhánh thiết kế. Fixture cũ trong
 * rhythm.test.tsx chỉ có bảy phần tử và BỎ QUA achievements, nên nó khẳng
 * định một quan hệ kề nhau (teachers → pricing) không hề tồn tại trên trang.
 */
const PAGE_RHYTHM = [
  { name: "Hero", tone: "ink" },
  { name: "Stats", tone: "ink" },
  { name: "Courses", tone: "light" },
  { name: "Formats", tone: "muted" },
  { name: "Process", tone: "light" },
  { name: "Teachers", tone: "muted" },
  { name: "Achievements", tone: "ink" },
  { name: "Pricing", tone: "light" },
  { name: "Testimonials", tone: "muted" },
  { name: "Faq", tone: "light" },
  { name: "Contact", tone: "ink" },
] as const;

/** Thứ tự component tự-đóng nằm giữa <main> và </main> của page.tsx. */
function mainChildren(): string[] {
  const open = PAGE_SOURCE.indexOf("<main");
  const close = PAGE_SOURCE.indexOf("</main>", open);
  expect(open, "không tìm thấy <main> trong page.tsx").toBeGreaterThan(-1);
  expect(close, "không tìm thấy </main> trong page.tsx").toBeGreaterThan(open);
  return [...PAGE_SOURCE.slice(open, close).matchAll(/<([A-Z]\w*)\s*\/>/g)].map((m) => m[1]);
}

/**
 * Hero và Stats KHÔNG phải `Section` — chúng là container thường dùng thẳng
 * `INK_SURFACE`, nên không có `data-tone`. Đọc tone của chúng qua lớp nền.
 */
function renderedTone(name: keyof typeof REGISTRY): string {
  const Component = REGISTRY[name];
  const { container } = render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <Component />
    </NextIntlClientProvider>,
  );
  const section = container.querySelector("section");
  if (section) return section.getAttribute("data-tone") ?? "unknown";

  const root = container.firstElementChild;
  return root?.className.split(/\s+/).includes("bg-surface-ink") ? "ink" : "unknown";
}

describe("home page rhythm", () => {
  it("keeps page.tsx composing exactly the eleven bands, in order", () => {
    expect(mainChildren()).toEqual(PAGE_RHYTHM.map((band) => band.name));
  });

  it("renders every band on the tone the rhythm calls for", () => {
    const actual = PAGE_RHYTHM.map(({ name }) => ({ name, tone: renderedTone(name) }));
    expect(actual).toEqual(PAGE_RHYTHM.map(({ name, tone }) => ({ name, tone })));
  });

  it("never puts two neighbouring bands on the same tone except the hero block", () => {
    // Ngoại lệ duy nhất là Hero + Stats: chúng cố tình liền một khối ink.
    const tones = PAGE_RHYTHM.map(({ name }) => renderedTone(name));
    for (let i = 2; i < tones.length; i++) {
      expect(tones[i], `${PAGE_RHYTHM[i].name} trùng tone với ${PAGE_RHYTHM[i - 1].name}`).not.toBe(
        tones[i - 1],
      );
    }
  });

  it("opens each of the three chapters with an ink band", () => {
    const tones = PAGE_RHYTHM.map(({ name }) => renderedTone(name));
    expect(tones.flatMap((tone, index) => (tone === "ink" ? [index] : []))).toEqual([0, 1, 6, 10]);
  });

  it("leaves no band in page.tsx unaccounted for by this test", () => {
    // Thêm một section vào page.tsx mà quên khai báo tone của nó ở đây thì
    // test phải đỏ, chứ không im lặng bỏ qua.
    for (const name of mainChildren()) {
      expect(
        Object.keys(REGISTRY),
        `page.tsx render <${name} /> nhưng test chưa biết nó`,
      ).toContain(name);
    }
  });

  it("wraps the page in a header and footer painted from the shared ink recipe", () => {
    // header và footer nằm NGOÀI <main>, không đi qua prop `tone`. Nếu chúng
    // lệch khỏi INK_SURFACE thì dải ink vỡ làm hai sắc độ khác nhau.
    for (const [label, Component, selector] of [
      ["header", SiteHeader, "header"],
      ["footer", SiteFooter, "footer"],
    ] as const) {
      const { container } = render(
        <NextIntlClientProvider locale="vi" messages={viMessages}>
          <Component />
        </NextIntlClientProvider>,
      );
      const element = container.querySelector(selector);
      expect(element, `không tìm thấy ${label}`).not.toBeNull();
      for (const token of INK_SURFACE.split(/\s+/)) {
        expect(element!.className.split(/\s+/), `${label} thiếu "${token}"`).toContain(token);
      }
    }
  });

  it("paints the two non-Section ink bands from the shared ink recipe too", () => {
    for (const [label, Component] of [
      ["hero", Hero],
      ["stats", Stats],
    ] as const) {
      const { container } = render(
        <NextIntlClientProvider locale="vi" messages={viMessages}>
          <Component />
        </NextIntlClientProvider>,
      );
      const classes = container.firstElementChild?.className.split(/\s+/) ?? [];
      for (const token of INK_SURFACE.split(/\s+/)) {
        expect(classes, `${label} thiếu "${token}"`).toContain(token);
      }
    }
  });
});
