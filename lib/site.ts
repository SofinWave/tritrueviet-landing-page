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
    "gia sư Toán Lý Hoá Anh",
  ],
  [LocaleSupport.EN]: [
    "tutoring centre",
    "private tutor",
    "one-on-one tutoring",
    "small group classes",
    "online tutoring",
    "exam preparation",
    "maths tutor",
    "english tutor",
  ],
};

/** Absolute URL for a locale's home page. */
export function localeUrl(locale: string): string {
  return `${SITE_URL}/${locale}`;
}

/** hreflang alternates map (locale -> absolute URL). */
export function languageAlternates(locales: readonly string[]): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, localeUrl(l)]));
}
