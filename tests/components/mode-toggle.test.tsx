import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { ModeToggle } from "@/components/mode-toggle";

function renderToggle() {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <ModeToggle />
    </NextIntlClientProvider>,
  );
}

describe("ModeToggle", () => {
  it("renders a labelled trigger", () => {
    renderToggle();
    expect(screen.getByLabelText("Đổi giao diện sáng/tối")).toBeInTheDocument();
  });

  it("styles its trigger for the ink header so it stays legible on a dark surface", () => {
    renderToggle();
    const trigger = screen.getByLabelText("Đổi giao diện sáng/tối");
    expect(trigger.className).toContain("text-surface-ink-foreground");
  });
});
