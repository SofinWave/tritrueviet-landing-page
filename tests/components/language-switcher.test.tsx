import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { LanguageSwitcher } from "@/components/language-switcher";

const { mockReplace } = vi.hoisted(() => ({ mockReplace: vi.fn() }));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace: mockReplace }),
}));

function renderSwitcher() {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <LanguageSwitcher />
    </NextIntlClientProvider>,
  );
}

describe("LanguageSwitcher", () => {
  it("renders a labelled trigger", () => {
    renderSwitcher();
    expect(screen.getByLabelText("Đổi ngôn ngữ")).toBeInTheDocument();
  });

  it("switches locale through the router when a language is selected", async () => {
    const user = userEvent.setup();
    renderSwitcher();

    await user.click(screen.getByLabelText("Đổi ngôn ngữ"));
    await user.click(screen.getByText("English"));

    expect(mockReplace).toHaveBeenCalledWith("/home", { locale: "en" });
  });
});
