import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { PHOTOS, Teachers } from "@/app/[locale]/(public)/home/_components/teachers";

describe("Teachers", () => {
  it("renders one card per teacher under the #giao-vien anchor", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Teachers />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("section#giao-vien")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.teachers.items.length);
  });

  it("pairs each teacher with the portrait named in its catalog entry, independent of order", () => {
    const items = vi.teachers.items;
    const reordered = {
      ...vi,
      teachers: { ...vi.teachers, items: [...items].reverse() },
    };

    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={reordered}>
        <Teachers />
      </NextIntlClientProvider>,
    );

    const cards = container.querySelectorAll('[data-slot="card"]');
    expect(cards).toHaveLength(items.length);

    reordered.teachers.items.forEach((item, index) => {
      const card = cards[index];
      expect(card?.querySelector("h3")).toHaveTextContent(item.name);
      // vitest resolves the image imports to plain URL strings, so the rendered
      // src still carries the file name the identifier maps to.
      expect(card?.querySelector("img")?.getAttribute("src")).toContain(item.photo);
    });
  });

  it("leaves the portraits decorative so each name is announced once", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Teachers />
      </NextIntlClientProvider>,
    );
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(vi.teachers.items.length);
    for (const img of images) {
      expect(img.getAttribute("alt")).toBe("");
    }
  });

  it.each([
    ["vi", vi],
    ["en", en],
  ])("pins every teachers.items[].photo value in %s.json to a real PHOTOS key, so a typo can't silently drop a portrait", (_locale, messages) => {
    const items = messages.teachers.items;
    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(Object.keys(PHOTOS)).toContain(item.photo);
    }
  });
});
