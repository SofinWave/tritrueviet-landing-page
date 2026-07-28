// Every other section test renders only the vi.json catalog. That proves the
// two catalogs are structurally identical (tests/messages/parity.test.ts) but
// never proves the en.json *values* actually render without error — a stray
// unresolved interpolation, a missing nested key one level down that parity
// can't see, or JSX assuming a shape that only vi.json happens to have would
// pass every other test and still break for every English visitor. This
// suite renders a representative set of sections under both catalogs and
// checks each shows its own translated heading.

import { describe, it, expect, vi as vitestVi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import { Hero } from "@/app/[locale]/(public)/home/_components/hero";
import { Formats } from "@/app/[locale]/(public)/home/_components/formats";
import { Process } from "@/app/[locale]/(public)/home/_components/process";
import { Faq } from "@/app/[locale]/(public)/home/_components/faq";
import { Contact } from "@/app/[locale]/(public)/home/_components/contact";

vitestVi.mock("@/app/actions/consultation", () => ({ submitConsultation: vitestVi.fn() }));

// vi.json and en.json are structurally identical (enforced by
// tests/messages/parity.test.ts), so it's safe to type en against vi's shape
// here rather than duplicating a type.
const CATALOGS = [
  { locale: "vi", messages: vi },
  { locale: "en", messages: en as typeof vi },
] as const;

function renderWithLocale(locale: string, messages: typeof vi, ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe.each(CATALOGS)("sections render without error under $locale.json", ({
  locale,
  messages,
}) => {
  it("Hero shows the catalog's own h1 headline", () => {
    renderWithLocale(locale, messages, <Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(messages.hero.title);
  });

  it("Formats shows the catalog's own heading", () => {
    renderWithLocale(locale, messages, <Formats />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(messages.formats.title);
  });

  it("Process shows the catalog's own heading", () => {
    renderWithLocale(locale, messages, <Process />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(messages.process.title);
  });

  it("Faq shows the catalog's own heading", () => {
    renderWithLocale(locale, messages, <Faq />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(messages.faq.title);
  });

  it("Contact shows the catalog's own heading and the registration form", () => {
    renderWithLocale(locale, messages, <Contact />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(messages.contact.title);
    expect(screen.getByRole("button", { name: messages.contact.form.submit })).toBeInTheDocument();
  });
});
