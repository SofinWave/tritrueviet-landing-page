import { LocaleSupport } from "@/enums";

/**
 * Canonical site URL. Override per environment with NEXT_PUBLIC_SITE_URL
 * (no trailing slash). The default is a placeholder until the real domain
 * is registered.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tritueviet.example.com"
).replace(/\/$/, "");

export const SITE_NAME = "Trung tâm Gia sư Trí Tuệ Việt";
export const SITE_SHORT_NAME = "Trí Tuệ Việt";

/** Contact details — fill these in before launch. */
export const SITE_PHONE = "[TODO: hotline]";
export const SITE_ZALO_URL = "[TODO: link Zalo OA]";
export const SITE_EMAIL = "[TODO: email trung tâm]";

export const SITE_ADDRESS = {
  street: "[TODO: số nhà, tên đường]",
  district: "[TODO: quận/huyện]",
  city: "[TODO: tỉnh/thành phố]",
  country: "VN",
};

/** schema.org openingHours strings, e.g. "Mo-Fr 08:00-20:00". */
export const SITE_OPENING_HOURS: string[] = ["[TODO: giờ mở cửa]"];

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = [];

/** BCP-47 tags used for Open Graph locale + hreflang. */
export const OG_LOCALE: Record<string, string> = {
  [LocaleSupport.VI]: "vi_VN",
  [LocaleSupport.EN]: "en_US",
};

export const SITE_KEYWORDS: Record<string, string[]> = {
  [LocaleSupport.VI]: [
    "trung tâm gia sư",
    "gia sư tại nhà",
    "học kèm 1 kèm 1",
    "luyện thi vào 10",
    "luyện thi THPT quốc gia",
    "gia sư online",
    "dạy kèm nhóm nhỏ",
    "gia sư tiểu học",
    "gia sư Toán Lý Hoá Anh",
    "dạy lập trình cho trẻ",
    "luyện thi học sinh giỏi Tin học",
    "học lập trình chuyển nghề",
  ],
  [LocaleSupport.EN]: [
    "tutoring centre",
    "private tutor",
    "one-on-one tutoring",
    "small group classes",
    "online tutoring",
    "exam preparation",
    "primary school tutor",
    "maths tutor",
    "english tutor",
    "programming for kids",
    "competitive programming coaching",
    "learn to code career change",
  ],
};

/**
 * Absolute URL for a locale's home page. Points at `/home`, not the bare
 * `/${locale}` prefix — the latter 307-redirects (see `app/[locale]/page.tsx`
 * and `i18n/routing.ts`'s `localePrefix: "always"`), so using it here would
 * make canonical, hreflang, og:url, the sitemap and JSON-LD all declare a
 * URL that never resolves with a 200.
 */
export function localeUrl(locale: string): string {
  return `${SITE_URL}/${locale}/home`;
}

/** hreflang alternates map (locale -> absolute URL). */
export function languageAlternates(locales: readonly string[]): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, localeUrl(l)]));
}
