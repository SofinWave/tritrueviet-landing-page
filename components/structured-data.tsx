import { getTranslations } from "next-intl/server";
import {
  courseListSchema,
  educationalOrganizationSchema,
  faqSchema,
  toJsonLdScript,
  webPageSchema,
  websiteSchema,
} from "@/lib/structured-data";

export async function StructuredData({ locale }: { locale: string }) {
  const meta = await getTranslations({ locale, namespace: "metadata" });
  const courses = await getTranslations({ locale, namespace: "courses" });
  const faq = await getTranslations({ locale, namespace: "faq" });
  const formats = await getTranslations({ locale, namespace: "formats" });
  const teachers = await getTranslations({ locale, namespace: "teachers" });

  const courseItems =
    (courses.raw("items") as
      | Array<{ name: string; description: string; grades?: string }>
      | undefined) ?? [];
  const faqItems =
    (faq.raw("items") as Array<{ question: string; answer: string }> | undefined) ?? [];
  const formatItems =
    (formats.raw("items") as Array<{ name: string; description: string }> | undefined) ?? [];
  const teacherItems =
    (teachers.raw("items") as
      | Array<{ name: string; subject: string; credential: string }>
      | undefined) ?? [];

  const nodes = [
    educationalOrganizationSchema({
      locale,
      description: meta("description"),
      formats: formatItems,
      teachers: teacherItems,
    }),
    websiteSchema(locale),
    webPageSchema({ locale, name: meta("title"), description: meta("description") }),
    courseListSchema(courseItems, locale),
    faqSchema(faqItems, locale),
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
