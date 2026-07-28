import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Formats } from "@/app/[locale]/(public)/home/_components/formats";

const ICON_CLASS: Record<string, string> = {
  "one-on-one": "lucide-user",
  "small-group": "lucide-users",
  online: "lucide-monitor",
  home: "lucide-house",
};

describe("Formats", () => {
  it("renders all four learning formats under the #hinh-thuc anchor", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Formats />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("section#hinh-thuc")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
    expect(screen.getByText("Kèm 1 – 1")).toBeInTheDocument();
    expect(screen.getByText("Gia sư tại nhà")).toBeInTheDocument();
  });

  it("pairs each format with the icon named in its catalog entry, independent of order", () => {
    const items = vi.formats.items as Array<{ name: string; description: string; icon: string }>;
    const reordered = {
      ...vi,
      formats: { ...vi.formats, items: [...items].reverse() },
    };

    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={reordered}>
        <Formats />
      </NextIntlClientProvider>,
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards).toHaveLength(4);

    reordered.formats.items.forEach((item, index) => {
      const card = cards[index];
      expect(card?.querySelector("h3")).toHaveTextContent(item.name);
      expect(card?.querySelector("svg")?.getAttribute("class")).toContain(ICON_CLASS[item.icon]);
    });
  });
});
