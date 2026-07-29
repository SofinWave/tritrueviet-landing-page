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
import { Achievements } from "@/app/[locale]/(public)/home/_components/achievements";
import { Contact } from "@/app/[locale]/(public)/home/_components/contact";

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
