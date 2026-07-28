import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Process } from "@/app/[locale]/(public)/home/_components/process";

describe("Process", () => {
  it("renders the four steps in order with visible numbering", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Process />
      </NextIntlClientProvider>,
    );
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(4);
    expect(headings[0]).toHaveTextContent("Tư vấn miễn phí");
    expect(headings[3]).toHaveTextContent("Học thử và theo dõi");
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
  });
});
