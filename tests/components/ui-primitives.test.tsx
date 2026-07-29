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

  it("keeps the ink-ghost hover text override that cancels the ghost accent", () => {
    // `hover:text-accent-foreground` của variant ghost là slate-900 — gần như
    // đen trên nền ink gần như đen. `hover:text-surface-ink-foreground` là
    // thứ huỷ nó qua twMerge; xoá đi là chữ biến mất khi hover.
    render(<Button variant="ink-ghost">Đổi giao diện</Button>);
    const classes = screen.getByRole("button").className;
    expect(classes).toContain("hover:text-surface-ink-foreground");
    expect(classes).not.toContain("hover:text-accent-foreground");
  });

  it("gives ink-ghost a focus ring that reads on the ink surface", () => {
    // `ring-ring/50` mặc định chỉ đạt 1.54:1 trên --surface-ink ở light mode,
    // dưới ngưỡng 3:1 của SC 1.4.11.
    render(<Button variant="ink-ghost">Gọi hotline</Button>);
    const classes = screen.getByRole("button").className;
    expect(classes).toContain("focus-visible:ring-surface-ink-foreground/60");
    expect(classes).not.toContain("focus-visible:ring-ring/50");
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
