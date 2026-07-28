import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Hero } from "@/app/[locale]/(public)/home/_components/hero";

function renderHero() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Hero />
    </NextIntlClientProvider>,
  );
}

describe("Hero", () => {
  it("renders exactly one h1 carrying the headline", () => {
    renderHero();
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Học đúng lộ trình");
  });

  it("points the primary CTA at the registration anchor", () => {
    const { container } = renderHero();
    expect(container.querySelector('a[href="#dang-ky"]')).not.toBeNull();
  });

  it("offers a direct phone and Zalo route as a form fallback", () => {
    const { container } = renderHero();
    expect(container.querySelector('a[href^="tel:"]')).not.toBeNull();
    expect(screen.getByText("Nhắn Zalo")).toBeInTheDocument();
  });

  it("has the top anchor the header logo links to", () => {
    const { container } = renderHero();
    expect(container.querySelector("#top")).not.toBeNull();
  });
});
