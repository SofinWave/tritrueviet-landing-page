import { defineRouting } from "next-intl/routing";
import { LocaleSupport } from "@/enums";

export const routing = defineRouting({
  locales: [LocaleSupport.VI, LocaleSupport.EN],
  defaultLocale: LocaleSupport.VI,
  localePrefix: "always",
  /**
   * Off on purpose. `defaultLocale` alone does **not** make a visitor land on
   * Vietnamese: next-intl's detection is on by default, so a bare `/` was
   * resolved from the visitor's `Accept-Language` header and `NEXT_LOCALE`
   * cookie first, and only fell back to `defaultLocale` when neither matched.
   * A browser set to English therefore got `/en` — the centre's own site
   * opening in its secondary language.
   *
   * With detection off, `/` always redirects to `/vi`. The switcher is
   * unaffected: it navigates to explicit `/en/...` URLs, and every route
   * carries a locale prefix (`localePrefix: "always"`), so nothing depends on
   * the header or the cookie to be reachable.
   *
   * This also makes the redirect deterministic for crawlers. Google warns that
   * `Accept-Language`-based redirects can stop a crawler seeing every version;
   * Googlebot generally requests with an English or absent header, so under
   * detection it was being sent to `/en` while `x-default` and the sitemap's
   * top-priority entry both point at `/vi`.
   */
  localeDetection: false,
});
