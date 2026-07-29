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

  it("renders both the headline and the detail of every entry", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Achievements />
      </NextIntlClientProvider>,
    );
    // This used to assert the "[TODO: ...]" placeholders were still on screen
    // rather than hidden. The centre has since supplied real student results,
    // so the guarantee worth keeping is that nothing silently drops out.
    for (const item of vi.achievements.items) {
      expect(screen.getByText(item.title)).toBeInTheDocument();
      expect(screen.getByText(item.detail)).toBeInTheDocument();
    }
  });
});
