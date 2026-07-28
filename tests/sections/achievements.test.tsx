import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Achievements } from "@/app/[locale]/(public)/home/_components/achievements";

describe("Achievements", () => {
  it("renders one entry per achievement", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Achievements />
      </NextIntlClientProvider>,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.achievements.items.length);
  });

  it("still shows unfilled placeholders rather than hiding them", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Achievements />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("[TODO: thành tích 1]")).toBeInTheDocument();
  });
});
