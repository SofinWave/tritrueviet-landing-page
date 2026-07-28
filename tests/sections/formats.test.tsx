import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Formats } from "@/app/[locale]/(public)/home/_components/formats";

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
});
