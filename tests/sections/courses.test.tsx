import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Courses } from "@/app/[locale]/(public)/home/_components/courses";

function renderCourses() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Courses />
    </NextIntlClientProvider>,
  );
}

describe("Courses", () => {
  it("renders one card per catalogue entry", () => {
    renderCourses();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.courses.items.length);
  });

  it("shows each subject name and its grade range", () => {
    renderCourses();
    expect(screen.getByText("Toán")).toBeInTheDocument();
    expect(screen.getByText("Luyện thi chuyển cấp")).toBeInTheDocument();
    expect(screen.getByText("Lớp 9 và lớp 12")).toBeInTheDocument();
  });

  it("carries the anchor the header links to", () => {
    const { container } = renderCourses();
    expect(container.querySelector("section#khoa-hoc")).not.toBeNull();
  });
});
