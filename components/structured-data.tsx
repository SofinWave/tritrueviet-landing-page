import { getTranslations } from "next-intl/server";
import {
  courseListSchema,
  educationalOrganizationSchema,
  faqSchema,
  toJsonLdScript,
  websiteSchema,
} from "@/lib/structured-data";

export async function StructuredData({ locale }: { locale: string }) {
  const meta = await getTranslations({ locale, namespace: "metadata" });
  const courses = await getTranslations({ locale, namespace: "courses" });
  const faq = await getTranslations({ locale, namespace: "faq" });

  const courseItems =
    (courses.raw("items") as Array<{ name: string; description: string }> | undefined) ?? [];
  const faqItems =
    (faq.raw("items") as Array<{ question: string; answer: string }> | undefined) ?? [];

  const nodes = [
    educationalOrganizationSchema({ locale, description: meta("description") }),
    websiteSchema(locale),
    courseListSchema(courseItems, locale),
    faqSchema(faqItems),
  ];

  return (
    <>
      {nodes.map((node, i) => (
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw injection
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(node) }}
        />
      ))}
    </>
  );
}
