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

  it("covers every subject group the centre teaches", () => {
    renderCourses();
    for (const name of [
      "Khoa học tự nhiên",
      "Khoa học xã hội",
      "Ngoại ngữ",
      "Lập trình căn bản",
      "Lập trình thi đấu",
      "Lập trình hướng nghiệp",
    ]) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }
  });

  it("advertises the full grade 1–12 range, not just secondary school", () => {
    // The centre took on primary pupils; several places in the site still said
    // "lớp 6 đến lớp 12" and this is the one a visitor actually reads.
    renderCourses();
    expect(screen.getAllByText("Lớp 1 – 12").length).toBeGreaterThanOrEqual(3);
  });

  it("labels the two tracks that are not tied to a school grade", () => {
    // Competitive programming is grouped by level, and the career track is for
    // adults — neither has a "Lớp N" and must not pretend to.
    renderCourses();
    expect(screen.getByText("Theo trình độ")).toBeInTheDocument();
    expect(screen.getByText("Người đi làm")).toBeInTheDocument();
  });

  it("carries the anchor the header links to", () => {
    const { container } = renderCourses();
    expect(container.querySelector("section#khoa-hoc")).not.toBeNull();
  });
});
