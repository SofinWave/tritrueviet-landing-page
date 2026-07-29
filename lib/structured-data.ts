import { LocaleSupport } from "@/enums";
import {
  absoluteUrl,
  localeUrl,
  SITE_ADDRESS,
  SITE_LOGO,
  SITE_NAME,
  SITE_OG_IMAGE,
  SITE_OPENING_HOURS,
  SITE_PHONE_E164,
  SITE_SAME_AS,
  SITE_SHORT_NAME,
  SITE_URL,
} from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** Stable per-locale `@id` for the page node, so nodes can cross-reference. */
const webPageId = (locale: string) => `${localeUrl(locale)}#webpage`;

/**
 * Languages the centre actually operates in, as BCP-47 tags. Used for both
 * `knowsLanguage` and the contact point's `availableLanguage` — an answer
 * engine asked "do they teach in English?" reads these.
 */
const SITE_LANGUAGES = [LocaleSupport.VI, LocaleSupport.EN];

/** The brand mark, as an ImageObject Google can resolve for a knowledge panel. */
const logoNode = {
  "@type": "ImageObject",
  "@id": `${SITE_URL}/#logo`,
  url: absoluteUrl(SITE_LOGO.path),
  contentUrl: absoluteUrl(SITE_LOGO.path),
  width: SITE_LOGO.width,
  height: SITE_LOGO.height,
  caption: SITE_NAME,
};

/**
 * Primary entity. Dual-typed because the centre is both a school and a
 * physical business with an address and opening hours — search engines use
 * the LocalBusiness half for map results.
 *
 * `formats` and `teachers` are passed in from the message catalog rather than
 * restated here: the catalog is the copy of record, and a second hand-kept list
 * would silently drift the day the centre adds a fifth tutor.
 *
 * Deliberately absent: `priceRange`, `aggregateRating` and `review`. Every
 * published figure in `pricing.plans[]` is a *floor* ("Chỉ từ"), so a
 * `priceRange` string would turn a starting price into a promised cap, and
 * Google's review guidelines forbid a business marking up testimonials it
 * collected about itself. See CLAUDE.md's "Unfilled content" notes.
 */
export function educationalOrganizationSchema({
  locale,
  description,
  formats = [],
  teachers = [],
}: {
  locale: string;
  description: string;
  formats?: Array<{ name: string; description: string }>;
  teachers?: Array<{ name: string; subject: string; credential: string }>;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORG_ID,
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    url: localeUrl(locale),
    description,
    inLanguage: locale,
    knowsLanguage: SITE_LANGUAGES,
    telephone: SITE_PHONE_E164,
    sameAs: SITE_SAME_AS,
    openingHours: SITE_OPENING_HOURS,
    logo: logoNode,
    image: absoluteUrl(SITE_OG_IMAGE.path),
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_ADDRESS.street,
      addressLocality: SITE_ADDRESS.district,
      addressRegion: SITE_ADDRESS.city,
      addressCountry: SITE_ADDRESS.country,
    },
    areaServed: { "@type": "Country", name: "Vietnam" },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      telephone: SITE_PHONE_E164,
      availableLanguage: SITE_LANGUAGES,
      areaServed: SITE_ADDRESS.country,
    },
    // The four teaching formats as a service catalogue — this is what answers
    // "do they teach online?" or "do they come to your house?".
    ...(formats.length > 0
      ? {
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: SITE_NAME,
            itemListElement: formats.map((format, index) => ({
              "@type": "Offer",
              position: index + 1,
              itemOffered: {
                "@type": "Service",
                name: format.name,
                description: format.description,
                serviceType: format.name,
                provider: { "@id": ORG_ID },
              },
            })),
          },
        }
      : {}),
    // Named tutors with their real credentials. This is the page's E-E-A-T
    // evidence; the credential strings are the centre's own, never inferred.
    ...(teachers.length > 0
      ? {
          employee: teachers.map((teacher) => ({
            "@type": "Person",
            name: teacher.name,
            jobTitle: teacher.subject,
            description: teacher.credential,
            worksFor: { "@id": ORG_ID },
          })),
        }
      : {}),
  };
}

export function websiteSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: localeUrl(locale),
    name: SITE_NAME,
    alternateName: SITE_SHORT_NAME,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };
}

/**
 * The page itself. Without this node the FAQ and course lists float free of any
 * document — this is what ties them to a URL, an image and a language, which is
 * the join an answer engine needs to cite the page rather than the bare claim.
 */
export function webPageSchema({
  locale,
  name,
  description,
}: {
  locale: string;
  name: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": webPageId(locale),
    url: localeUrl(locale),
    name,
    description,
    inLanguage: locale,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(SITE_OG_IMAGE.path),
      width: SITE_OG_IMAGE.width,
      height: SITE_OG_IMAGE.height,
    },
  };
}

export function courseListSchema(
  courses: Array<{ name: string; description: string; grades?: string }>,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.name,
        description: course.description,
        // Google's course list needs a URL per item; the section is anchored.
        url: `${localeUrl(locale)}#khoa-hoc`,
        inLanguage: locale,
        // The catalog's `grades` string ("Lớp 1 – 12", "Người đi làm") is the
        // only statement of who a course is for — dropping it here loses the
        // single most-asked question about a tutoring course.
        ...(course.grades ? { educationalLevel: course.grades } : {}),
        provider: { "@id": ORG_ID },
        isPartOf: { "@id": webPageId(locale) },
      },
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>, locale?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    ...(locale
      ? { "@id": `${localeUrl(locale)}#faq`, isPartOf: { "@id": webPageId(locale) } }
      : {}),
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

/**
 * Serializes a JSON-LD node for injection into a `<script>` tag. Catalog
 * content (testimonials, address, opening hours) is maintained by
 * non-developers — a "<" or "</script>" in that copy would otherwise close
 * the script tag early and break the page, so "<" is escaped to its unicode
 * form, which is inert inside a JSON string but round-trips identically once
 * parsed.
 */
export function toJsonLdScript(node: unknown): string {
  return JSON.stringify(node).replace(/</g, "\\u003c");
}
