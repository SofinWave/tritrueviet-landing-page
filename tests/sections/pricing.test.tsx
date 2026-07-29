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

  it("lists every feature of every plan", () => {
    renderPricing();
    for (const plan of vi.pricing.plans) {
      for (const feature of plan.features) {
        expect(screen.getByText(feature)).toBeInTheDocument();
      }
    }
  });

  it("prefixes every price with the 'from' qualifier", () => {
    renderPricing();
    // Each `plans[].price` is the centre's floor, not a flat rate. Without this
    // prefix the card advertises the cheapest possible session as the price of
    // every session — a claim the centre never made.
    expect(screen.getAllByText(vi.pricing.from)).toHaveLength(vi.pricing.plans.length);
    for (const plan of vi.pricing.plans) {
      expect(screen.getByText(plan.price)).toBeInTheDocument();
    }
  });

  it("routes every plan CTA to the registration form", () => {
    const { container } = renderPricing();
    expect(container.querySelectorAll('a[href="#dang-ky"]')).toHaveLength(vi.pricing.plans.length);
  });
});
