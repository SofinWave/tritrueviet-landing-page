import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";
import { LocaleSupport } from "@/enums";

describe("routing", () => {
  it("defaults to Vietnamese", () => {
    expect(routing.defaultLocale).toBe(LocaleSupport.VI);
  });

  it("supports exactly vi and en", () => {
    expect([...routing.locales].sort()).toEqual(["en", "vi"]);
  });

  it("always prefixes the locale", () => {
    expect(routing.localePrefix).toBe("always");
  });

  /**
   * `defaultLocale` on its own does not decide where a visitor lands — with
   * next-intl's detection on (its default), `Accept-Language` and the
   * `NEXT_LOCALE` cookie win first, and an English browser was being sent to
   * `/en`. This is the assertion that keeps `/` on Vietnamese.
   */
  it("does not let the browser's language override the Vietnamese default", () => {
    expect(routing.localeDetection).toBe(false);
  });
});
