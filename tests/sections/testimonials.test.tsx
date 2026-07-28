import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Testimonials } from "@/app/[locale]/(public)/home/_components/testimonials";

describe("Testimonials", () => {
  it("renders each quote inside a blockquote with its attribution", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Testimonials />
      </NextIntlClientProvider>,
    );
    expect(container.querySelectorAll("blockquote")).toHaveLength(vi.testimonials.items.length);
    expect(screen.getByText("[TODO: tên phụ huynh 1]")).toBeInTheDocument();
  });
});
