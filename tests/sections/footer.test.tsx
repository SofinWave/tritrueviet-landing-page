import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { SiteFooter } from "@/app/[locale]/(public)/home/_components/footer";

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <SiteFooter />
    </NextIntlClientProvider>,
  );
}

describe("SiteFooter", () => {
  it("renders a contentinfo landmark", () => {
    renderFooter();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("repeats the in-page navigation anchors", () => {
    const { container } = renderFooter();
    for (const anchor of ["#khoa-hoc", "#hinh-thuc", "#giao-vien", "#hoc-phi", "#dang-ky"]) {
      expect(container.querySelector(`a[href="${anchor}"]`)).not.toBeNull();
    }
  });

  it("shows the brand name and the rights line", () => {
    renderFooter();
    expect(screen.getByText(/Bảo lưu mọi quyền/)).toBeInTheDocument();
  });
});
