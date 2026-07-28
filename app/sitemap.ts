import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, localeUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...languageAlternates(routing.locales),
    "x-default": localeUrl(routing.defaultLocale),
  };

  return routing.locales.map((locale) => ({
    url: localeUrl(locale),
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: { languages },
  }));
}
