import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Pricing } from "@/app/[locale]/(public)/home/_components/pricing";

function renderPricing() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Pricing />
    </NextIntlClientProvider>,
  );
}

describe("Pricing", () => {
  it("renders one plan per format under the #hoc-phi anchor", () => {
    const { container } = renderPricing();
    expect(container.querySelector("section#hoc-phi")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.pricing.plans.length);
  });

  it("lists every feature of a plan", () => {
    renderPricing();
    expect(screen.getByText("Giáo viên riêng theo môn")).toBeInTheDocument();
    expect(screen.getByText("Sĩ số tối đa 6 học sinh")).toBeInTheDocument();
  });

  it("routes every plan CTA to the registration form", () => {
    const { container } = renderPricing();
    expect(container.querySelectorAll('a[href="#dang-ky"]')).toHaveLength(vi.pricing.plans.length);
  });
});
