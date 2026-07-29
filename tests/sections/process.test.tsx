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
    expect(headings[0]).toHaveTextContent("Liên hệ và nghe tư vấn");
    expect(headings[3]).toHaveTextContent("Học thử và theo dõi");
    // The centre's real differentiator at this step: the parent may name the
    // tutor rather than be assigned one.
    expect(headings[2]).toHaveTextContent("Xếp lớp và chọn gia sư");
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
  });
});
