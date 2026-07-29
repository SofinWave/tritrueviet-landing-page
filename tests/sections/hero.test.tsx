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

  it("sits on the ink surface with the grid pattern", () => {
    const { container } = renderHero();
    const root = container.querySelector("#top");
    expect(root?.className).toContain("bg-surface-ink");
    expect(container.querySelector(".bg-grid")).not.toBeNull();
  });

  it("makes the registration CTA the amber highlight button", () => {
    const { container } = renderHero();
    const cta = container.querySelector('a[href="#dang-ky"]');
    expect(cta?.className).toContain("bg-highlight");
  });

  it("does not close the hero with a border so stats reads as the same block", () => {
    const { container } = renderHero();
    expect(container.querySelector("#top")?.className).not.toContain("border-b");
  });

  it("gives the h1 the tightened leading for large headings", () => {
    renderHero();
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("leading-[1.1]");
  });
});
