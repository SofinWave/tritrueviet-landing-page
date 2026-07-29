import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { Contact } from "@/app/[locale]/(public)/home/_components/contact";

vi.mock("@/app/actions/consultation", () => ({ submitConsultation: vi.fn() }));

describe("Contact", () => {
  it("renders the registration anchor the CTAs point at", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <Contact />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("section#dang-ky")).not.toBeNull();
  });

  it("shows the hotline, email and address alongside the form", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <Contact />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Hotline")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Địa chỉ")).toBeInTheDocument();
  });

  it("floats the form on a light card panel inside the ink band", () => {
    // Đo trên --surface-ink, thông báo thành công (text-primary) chỉ đạt
    // 2.96:1 / 2.35:1, thông báo lỗi (text-destructive) 4.23:1 / 3.06:1,
    // placeholder 4.23:1 / 3.36:1 và nút gửi 2.96:1 / 2.35:1 — cả bốn trượt
    // AA. Tấm bg-card là thứ khôi phục bề mặt sáng dưới form. Nếu ai đó gỡ
    // wrapper, test này phải đỏ.
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <Contact />
      </NextIntlClientProvider>,
    );
    const section = container.querySelector("section#dang-ky");
    expect(section).toHaveAttribute("data-tone", "ink");

    const form = section?.querySelector("form");
    expect(form, "không tìm thấy form tư vấn trong section").not.toBeNull();

    const panel = form!.closest(".bg-card");
    expect(panel, "form đang nằm trần trên dải ink, thiếu tấm nền bg-card").not.toBeNull();
    expect(panel!.className).toContain("text-card-foreground");
    // Tấm nền phải nằm TRONG section ink, không phải bọc cả section.
    expect(section!.contains(panel!)).toBe(true);
  });
});
