import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { SiteHeader } from "@/components/site-header";

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <SiteHeader />
    </NextIntlClientProvider>,
  );
}

describe("SiteHeader", () => {
  it("links to every in-page section anchor", () => {
    const { container } = renderHeader();
    for (const anchor of ["#khoa-hoc", "#hinh-thuc", "#giao-vien", "#hoc-phi", "#dang-ky"]) {
      expect(container.querySelector(`a[href="${anchor}"]`)).not.toBeNull();
    }
  });

  it("exposes a direct phone link so leads are not lost", () => {
    const { container } = renderHeader();
    expect(container.querySelector('a[href^="tel:"]')).not.toBeNull();
  });

  it("shows the registration CTA", () => {
    renderHeader();
    expect(screen.getByText("Đăng ký tư vấn")).toBeInTheDocument();
  });

  it("exposes a mobile menu with the same section anchors", async () => {
    const user = userEvent.setup();
    renderHeader();

    await user.click(screen.getByLabelText("Mở menu"));

    const menuLinks = screen.getAllByRole("menuitem").map((item) => item.getAttribute("href"));
    for (const anchor of ["#khoa-hoc", "#hinh-thuc", "#giao-vien", "#hoc-phi"]) {
      expect(menuLinks).toContain(anchor);
    }
  });
});
