import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Teachers } from "@/app/[locale]/(public)/home/_components/teachers";

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
});
