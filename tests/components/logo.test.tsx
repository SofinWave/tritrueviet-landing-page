import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/logo";

describe("Logo", () => {
  it("renders the wordmark as accessible text", () => {
    render(<Logo />);
    expect(screen.getByText(/Trí Tuệ Việt/)).toBeInTheDocument();
  });

  it("renders the artwork mark, not the full lockup with its baked-in wordmark", () => {
    const { container } = render(<Logo />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    // logo.png carries the wordmark and tagline as pixels; at the header's 36px those
    // bands render 4px, 4px and 1px tall. Only the cropped mark belongs here.
    expect(img?.getAttribute("src")).toContain("logo-mark");
    expect(img?.getAttribute("src")).not.toMatch(/\/logo\.png/);
  });

  it("leaves the mark decorative so the name is announced once", () => {
    const { container } = render(<Logo />);
    // The wordmark beside it is real text; a non-empty alt would make a screen
    // reader say "Trí Tuệ Việt" twice.
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
  });

  it("backs the mark with a light chip so it survives the red and ink surfaces", () => {
    const { container } = render(<Logo />);
    const img = container.querySelector("img");
    const chip = img?.parentElement;
    // The artwork is brand red on transparency: 1.00:1 on the red header, 1.40:1 on
    // the dark ink band. Without this chip the logo is literally invisible there.
    expect(chip?.className).toContain("bg-white");
    expect(chip?.contains(img as Node)).toBe(true);
  });
});
