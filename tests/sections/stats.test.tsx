import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Stats } from "@/app/[locale]/(public)/home/_components/stats";

describe("Stats", () => {
  it("renders all four trust figures", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Stats />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Học viên đã đồng hành")).toBeInTheDocument();
    expect(screen.getByText("Năm kinh nghiệm")).toBeInTheDocument();
    expect(screen.getByText("Tỉ lệ đỗ nguyện vọng 1")).toBeInTheDocument();
    expect(screen.getByText("Giáo viên cơ hữu")).toBeInTheDocument();
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
