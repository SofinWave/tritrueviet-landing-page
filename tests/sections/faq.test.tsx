import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Faq } from "@/app/[locale]/(public)/home/_components/faq";

function renderFaq() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Faq />
    </NextIntlClientProvider>,
  );
}

describe("Faq", () => {
  it("renders one trigger per question", () => {
    renderFaq();
    expect(screen.getAllByRole("button")).toHaveLength(vi.faq.items.length);
  });

  it("reveals the answer when a question is opened", async () => {
    const user = userEvent.setup();
    renderFaq();
    await user.click(screen.getByText("Buổi học thử có mất phí không?"));
    expect(await screen.findByText(/hoàn toàn miễn phí/)).toBeInTheDocument();
  });
});
