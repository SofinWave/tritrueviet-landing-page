import {
  localeUrl,
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_NAME,
  SITE_OPENING_HOURS,
  SITE_PHONE,
  SITE_SAME_AS,
  SITE_URL,
} from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;

/**
 * Primary entity. Dual-typed because the centre is both a school and a
 * physical business with an address and opening hours — search engines use
 * the LocalBusiness half for map results.
 */
export function educationalOrganizationSchema({
  locale,
  description,
}: {
  locale: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORG_ID,
    name: SITE_NAME,
    url: localeUrl(locale),
    description,
    inLanguage: locale,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    sameAs: SITE_SAME_AS,
    openingHours: SITE_OPENING_HOURS,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_ADDRESS.street,
      addressLocality: SITE_ADDRESS.district,
      addressRegion: SITE_ADDRESS.city,
      addressCountry: SITE_ADDRESS.country,
    },
    areaServed: { "@type": "Country", name: "Vietnam" },
  };
}

export function websiteSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: localeUrl(locale),
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };
}

export function courseListSchema(
  courses: Array<{ name: string; description: string }>,
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
        inLanguage: locale,
        provider: { "@id": ORG_ID },
      },
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
