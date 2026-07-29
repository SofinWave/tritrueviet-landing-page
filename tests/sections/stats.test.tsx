import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Stats } from "@/app/[locale]/(public)/home/_components/stats";

describe("Stats", () => {
  it("renders all four trust figures with their real values", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Stats />
      </NextIntlClientProvider>,
    );
    for (const [value, label] of [
      ["3.000+", "Học viên đã đồng hành"],
      ["2+", "Năm kinh nghiệm"],
      ["500+", "Gia sư trong mạng lưới"],
      ["5+", "Giáo viên dạy thường xuyên"],
    ]) {
      expect(screen.getByText(label)).toBeInTheDocument();
      expect(screen.getByText(value)).toBeInTheDocument();
    }
  });

  it("shows no unfilled placeholder now that the figures are real", () => {
    // These are advertising claims. A "[TODO: …]" reaching production here would
    // be visible to every visitor, and placeholders.test.ts no longer guards
    // stats.* because those entries were deliberately retired.
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Stats />
      </NextIntlClientProvider>,
    );
    expect(container.textContent).not.toContain("[TODO");
  });

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
});
