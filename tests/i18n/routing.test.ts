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
});
