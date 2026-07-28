import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/logo";

describe("Logo", () => {
  it("renders the wordmark as accessible text", () => {
    render(<Logo />);
    expect(screen.getByText(/Trí Tuệ Việt/)).toBeInTheDocument();
  });

  it("renders an svg mark labelled for screen readers", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
