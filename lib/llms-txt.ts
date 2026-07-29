import { LocaleSupport } from "@/enums";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import {
  localeUrl,
  SITE_ADDRESS,
  SITE_FACEBOOK_URL,
  SITE_NAME,
  SITE_OPENING_HOURS,
  SITE_PHONE,
  SITE_PHONE_E164,
  SITE_URL,
  SITE_ZALO_URL,
} from "@/lib/site";

const CATALOGS = { [LocaleSupport.VI]: vi, [LocaleSupport.EN]: en } as const;

/**
 * `/llms.txt` — the convention (llmstxt.org) for handing an answer engine a
 * clean, prose summary of a site instead of making it reconstruct one from
 * rendered HTML, nav chrome and Tailwind classes.
 *
 * It is generated from the same message catalogs the page renders from, so it
 * cannot drift the way a hand-written copy would: change a price or add a
 * tutor in `messages/vi.json` and this file changes with it. Nothing here is
 * authored — every figure, quote and credential is read out of the catalog or
 * out of `lib/site.ts`.
 *
 * Written in the default locale, because that is the language the centre
 * operates in and the language the claims were supplied in; the English page is
 * linked at the end for engines answering in English.
 */
export function buildLlmsTxt(requested: string = LocaleSupport.VI): string {
  // Normalise *before* anything reads it. Falling back only on the catalog
  // lookup would emit the requested locale in every URL, so an unknown tag
  // would hand the crawler links like `/de/home` — routes that do not exist.
  const locale = requested in CATALOGS ? (requested as keyof typeof CATALOGS) : LocaleSupport.VI;
  const m = CATALOGS[locale];
  const other = locale === LocaleSupport.VI ? LocaleSupport.EN : LocaleSupport.VI;

  const lines: string[] = [
    `# ${SITE_NAME}`,
    "",
    `> ${m.metadata.description}`,
    "",
    m.hero.subtitle,
    "",
    `Trang chủ: ${localeUrl(locale)}`,
    "",
  ];

  const section = (heading: string, body: string[]) => {
    lines.push(`## ${heading}`, "", ...body, "");
  };

  section("Thông tin liên hệ", [
    `- Hotline: ${SITE_PHONE} (${SITE_PHONE_E164})`,
    `- Zalo: ${SITE_ZALO_URL}`,
    `- Facebook: ${SITE_FACEBOOK_URL}`,
    `- Địa chỉ: ${SITE_ADDRESS.street}, ${SITE_ADDRESS.district}, ${SITE_ADDRESS.city}`,
    `- Giờ mở cửa: ${SITE_OPENING_HOURS.join("; ")}`,
  ]);

  section(
    "Quy mô",
    Object.values(m.stats).map((stat) => `- ${stat.label}: ${stat.value}`),
  );

  section(m.courses.title, [
    m.courses.description,
    "",
    ...m.courses.items.map(
      (course) => `- **${course.name}** (${course.grades}): ${course.description}`,
    ),
  ]);

  section(m.formats.title, [
    m.formats.description,
    "",
    ...m.formats.items.map((f) => `- **${f.name}**: ${f.description}`),
  ]);

  section(m.pricing.title, [
    m.pricing.description,
    "",
    ...m.pricing.plans.map(
      // The catalogue publishes floors, not flat rates — `pricing.from` ("Chỉ
      // từ") has to travel with the figure or a starting price reads as a quote.
      (plan) => `- **${plan.name}**: ${m.pricing.from} ${plan.price} ${m.pricing.perSession}`,
    ),
    "",
    m.pricing.note,
  ]);

  section(m.teachers.title, [
    m.teachers.description,
    "",
    ...m.teachers.items.map((t) => `- **${t.name}** — ${t.subject}. ${t.credential}`),
  ]);

  section(
    m.achievements.title,
    m.achievements.items.map((a) => `- **${a.title}**: ${a.detail}`),
  );

  // Verbatim parent quotes, reproduced exactly as the page shows them. These
  // are real people's words — never paraphrase or summarise them here.
  section(
    m.testimonials.title,
    m.testimonials.items.map((t) => `- “${t.quote}” — ${t.author}, ${t.role}`),
  );

  section(
    m.faq.title,
    m.faq.items.flatMap((f) => [`### ${f.question}`, "", f.answer, ""]),
  );

  section("Ngôn ngữ khác", [
    `- ${other === LocaleSupport.EN ? "English" : "Tiếng Việt"}: ${localeUrl(other)}`,
    `- Sitemap: ${SITE_URL}/sitemap.xml`,
  ]);

  // The FAQ entries end on their own blank line, which would otherwise stack
  // with the blank line `section` appends and leave a gap mid-document.
  return `${lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()}\n`;
}
