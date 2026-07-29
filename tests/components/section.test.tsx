import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "@/components/section";

describe("Section", () => {
  it("renders its id so anchor navigation works", () => {
    const { container } = render(
      <Section id="khoa-hoc">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector("section#khoa-hoc")).not.toBeNull();
  });

  it("renders the title as an h2 and the eyebrow above it", () => {
    render(
      <Section title="Khoá học" eyebrow="Chương trình">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Khoá học");
    expect(screen.getByText("Chương trình")).toBeInTheDocument();
  });

  it("omits the heading block when no title is given", () => {
    render(
      <Section>
        <p>content</p>
      </Section>,
    );
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });

  it("defaults to the light tone and centred alignment", () => {
    const { container } = render(
      <Section title="Khoá học">
        <p>content</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-tone", "light");
    expect(section?.className).toContain("bg-background");
    expect(container.querySelector(".text-center")).not.toBeNull();
  });

  it("paints the ink tone with the ink surface tokens", () => {
    const { container } = render(
      <Section tone="ink" title="Thành tích">
        <p>content</p>
      </Section>,
    );
    const section = container.querySelector("section");
    expect(section).toHaveAttribute("data-tone", "ink");
    expect(section?.className).toContain("bg-surface-ink");
    expect(section?.className).toContain("text-surface-ink-foreground");
  });

  it("paints the muted tone with the muted surface", () => {
    const { container } = render(
      <Section tone="muted" title="Hình thức học">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector("section")?.className).toContain("bg-muted");
  });

  it("switches the eyebrow to the highlight colour on the ink tone", () => {
    // Cam trên nền tối đạt 9.4:1 (light) / 4.1:1 (dark, đủ cho chữ đậm).
    // Trên nền sáng cam chỉ đạt 2.1:1 nên eyebrow phải là primary.
    const { rerender } = render(
      <Section tone="ink" title="Thành tích" eyebrow="Kết quả">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByText("Kết quả").className).toContain("text-highlight");

    rerender(
      <Section tone="light" title="Khoá học" eyebrow="Chương trình">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByText("Chương trình").className).toContain("text-primary");
  });

  it("drops the centring classes when aligned to the start", () => {
    const { container } = render(
      <Section align="start" title="Câu hỏi thường gặp">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector(".text-center")).toBeNull();
  });

  it("keeps the layout container inside the section element", () => {
    // Các section truyền className để chỉnh nền; container phải là con của
    // section thì nền mới phủ tràn viewport thay vì chỉ phủ bề rộng container.
    const { container } = render(
      <Section title="Khoá học">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector("section > .container")).not.toBeNull();
  });
});
