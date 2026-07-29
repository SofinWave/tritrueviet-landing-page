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
    // Every quote must carry its attribution. An unattributed testimonial reads
    // as the centre praising itself in someone else's voice, which is exactly
    // what these are not.
    for (const item of vi.testimonials.items) {
      expect(screen.getByText(item.quote)).toBeInTheDocument();
      expect(screen.getByText(item.author)).toBeInTheDocument();
      expect(screen.getByText(item.role)).toBeInTheDocument();
    }
  });
});
