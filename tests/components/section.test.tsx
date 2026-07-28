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
});
