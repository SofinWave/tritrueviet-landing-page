import { LocaleSupport } from "@/enums";

/**
 * Canonical site URL. Override per environment with NEXT_PUBLIC_SITE_URL
 * (no trailing slash) — a staging deploy must set it, or it will advertise the
 * production domain as its own canonical and hand search engines duplicate
 * pages. The default is the real domain, no longer a placeholder.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tritueviet.org").replace(
  /\/$/,
  "",
);

export const SITE_NAME = "Trung tâm Gia sư Trí Tuệ Việt";
export const SITE_SHORT_NAME = "Trí Tuệ Việt";

/**
 * Hotline as it is *shown* to a reader — grouped for legibility. Never put this
 * in an `href`: a `tel:` URI may not contain raw spaces (RFC 3966 allows `-`
 * and `.` as visual separators, nothing else), so linking it depends on the
 * browser silently repairing the URI. Use `SITE_PHONE_E164` for that.
 */
export const SITE_PHONE = "0965 492 153";

/**
 * The same number in E.164. This is what every `tel:` link and schema.org's
 * `telephone` must carry — the national `0` prefix only resolves for a caller
 * already inside Vietnam, and Google reads `telephone` literally.
 */
export const SITE_PHONE_E164 = "+84965492153";

/**
 * The centre has no Zalo Official Account yet, so this points at the personal
 * Zalo profile behind the same hotline number rather than an `oa.zalo.me` link.
 * Swap it the day an OA exists — the deep link shape differs.
 *
 * Derived from `SITE_PHONE_E164` minus the `+` (i.e. `84…`, not `0…`) so the
 * hotline only has to be corrected in one place if it ever changes.
 */
export const SITE_ZALO_URL = `https://zalo.me/${SITE_PHONE_E164.slice(1)}`;

export const SITE_FACEBOOK_URL = "https://www.facebook.com/tritueviet.official";

/**
 * The handle shown to readers next to the mark — the URL's last path segment,
 * derived rather than restated so the two cannot drift apart.
 */
export const SITE_FACEBOOK_HANDLE = SITE_FACEBOOK_URL.replace(/\/+$/, "").split("/").pop() ?? "";

/**
 * No published email yet. The centre asked to drop it rather than show a
 * placeholder, so `mailto:` links were removed from the footer and the contact
 * list instead of being left pointing at nothing. Re-adding one means restoring
 * those two call sites and the `email` field in `organizationSchema`.
 */

export const SITE_ADDRESS = {
  street: "Số 68, ngõ 66B Triều Khúc",
  district: "Thanh Liệt",
  city: "Hà Nội",
  country: "VN",
};

/**
 * Master switch for the consultation form. While this is `false` every field
 * and the submit button render disabled, so no lead can be entered — worth
 * knowing that `app/actions/consultation.ts` still only logs submissions, so
 * nothing downstream is listening for them yet either.
 *
 * The form's own behaviour is untouched and still fully covered: the tests in
 * `tests/sections/consultation-form.test.tsx` render it with `disabled={false}`
 * so that coverage stays live, and one test pins that the *default* is off.
 * Flipping this back to `true` is the whole re-enable.
 */
export const CONSULTATION_FORM_ENABLED = false;

/**
 * schema.org openingHours strings. 08:30–23:00 every day of the week — the
 * `Mo-Su` span and the 24-hour clock are the format's requirement, not a style
 * choice, so do not rewrite this as "8h30 - 23h" for readability.
 */
export const SITE_OPENING_HOURS: string[] = ["Mo-Su 08:30-23:00"];

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = [SITE_FACEBOOK_URL];

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
