import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { LanguageSwitcher } from "@/components/language-switcher";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace: () => {} }),
}));

describe("LanguageSwitcher", () => {
  it("renders a labelled trigger", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );
    expect(screen.getByLabelText("Đổi ngôn ngữ")).toBeInTheDocument();
  });
});
