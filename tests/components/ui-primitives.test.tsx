import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

describe("Button", () => {
  it("paints the highlight variant with the amber CTA tokens", () => {
    render(<Button variant="highlight">Đăng ký học thử</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-highlight");
    expect(button.className).toContain("text-highlight-foreground");
  });

  it("uses amber as a background, never as the button's own text colour", () => {
    // Cam trên nền sáng chỉ đạt 2.1:1. Variant highlight phải là NỀN cam với
    // chữ amber-950, không bao giờ là chữ cam.
    render(<Button variant="highlight">Đăng ký</Button>);
    const classes = screen.getByRole("button").className.split(/\s+/);
    expect(classes).toContain("bg-highlight");
    expect(classes).toContain("text-highlight-foreground");
    expect(classes).not.toContain("text-highlight");
  });

  it("still exposes the variant through the data attribute", () => {
    render(<Button variant="highlight">Đăng ký</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "highlight");
  });

  it("leaves the default variant on the primary tokens", () => {
    render(<Button>Xem khoá học</Button>);
    expect(screen.getByRole("button").className).toContain("bg-primary");
  });
});

describe("Card", () => {
  it("suppresses the hover lift under reduced motion", () => {
    const { container } = render(<Card>nội dung</Card>);
    const card = container.querySelector('[data-slot="card"]');
    expect(card?.className).toContain("hover:border-highlight");
    expect(card?.className).toContain("motion-reduce:hover:translate-y-0");
  });
});
