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
});
