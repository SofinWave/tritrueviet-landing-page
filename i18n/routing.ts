import { defineRouting } from "next-intl/routing";
import { LocaleSupport } from "@/enums";

export const routing = defineRouting({
  locales: [LocaleSupport.VI, LocaleSupport.EN],
  defaultLocale: LocaleSupport.VI,
  localePrefix: "always",
});
