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

  it("sits on the ink surface so it reads as part of the hero", () => {
    const { container } = renderHeader();
    const header = container.querySelector("header");
    expect(header?.className).toContain("bg-surface-ink");
    expect(header?.className).toContain("text-surface-ink-foreground");
  });

  it("gives every focusable control a focus ring that reads on ink", () => {
    // Header dính trên mọi màn hình và có năm control. `ring-ring/50` mặc
    // định của shadcn chỉ đạt 1.54:1 trên --surface-ink ở light mode.
    const { container } = renderHeader();
    const controls = container.querySelectorAll("a, button");
    expect(controls.length, "không tìm thấy control nào trong header").toBeGreaterThan(0);
    for (const control of controls) {
      expect(
        control.className,
        `control "${control.getAttribute("aria-label") ?? control.textContent}" thiếu vòng focus trên nền ink`,
      ).toContain("focus-visible:ring-surface-ink-foreground/60");
    }
  });

  it("makes the register button the amber highlight", () => {
    const { container } = renderHeader();
    const register = container.querySelector('a[href="#dang-ky"]');
    expect(register?.className).toContain("bg-highlight");
  });
});
