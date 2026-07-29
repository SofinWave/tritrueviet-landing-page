import { describe, expect, it } from "vitest";
import { SITE_OG_IMAGE, SITE_PHONE_E164, SITE_SHORT_NAME, SITE_URL, localeUrl } from "@/lib/site";
import {
  courseListSchema,
  educationalOrganizationSchema,
  faqSchema,
  toJsonLdScript,
  webPageSchema,
  websiteSchema,
} from "@/lib/structured-data";

const FORMATS = [{ name: "Kèm 1 – 1", description: "Một gia sư, một học sinh." }];
const TEACHERS = [{ name: "Phạm Linh Thư", subject: "Tiếng Anh", credential: "HSK6, B2" }];

describe("educationalOrganizationSchema", () => {
  const schema = educationalOrganizationSchema({ locale: "vi", description: "mô tả" });

  it("is an EducationalOrganization that is also a LocalBusiness", () => {
    expect(schema["@type"]).toEqual(["EducationalOrganization", "LocalBusiness"]);
  });

  it("carries a stable @id other nodes can reference", () => {
    expect(schema["@id"]).toBe(`${SITE_URL}/#organization`);
  });

  it("includes a postal address node", () => {
    expect(schema.address["@type"]).toBe("PostalAddress");
  });

  it("carries the short brand name as an alternateName", () => {
    expect(schema.alternateName).toBe(SITE_SHORT_NAME);
  });

  it("resolves the logo to an absolute ImageObject Google can fetch", () => {
    expect(schema.logo["@type"]).toBe("ImageObject");
    expect(schema.logo.url).toMatch(/^https?:\/\//);
  });

  it("points `image` at the absolute open graph image", () => {
    expect(schema.image).toContain(SITE_OG_IMAGE.path);
    expect(schema.image).toMatch(/^https?:\/\//);
  });

  it("exposes a contact point on the dialable E.164 number, in both site languages", () => {
    expect(schema.contactPoint.telephone).toBe(SITE_PHONE_E164);
    expect(schema.contactPoint.availableLanguage).toEqual(["vi", "en"]);
  });

  it("never asserts a price range — every published figure is a floor, not a cap", () => {
    expect(schema).not.toHaveProperty("priceRange");
  });

  it("never marks up self-collected reviews or a rating", () => {
    expect(schema).not.toHaveProperty("aggregateRating");
    expect(schema).not.toHaveProperty("review");
  });

  it("omits the offer catalog and staff list entirely when no catalog data is passed", () => {
    expect(schema).not.toHaveProperty("hasOfferCatalog");
    expect(schema).not.toHaveProperty("employee");
  });

  describe("with catalog data", () => {
    const full = educationalOrganizationSchema({
      locale: "vi",
      description: "mô tả",
      formats: FORMATS,
      teachers: TEACHERS,
    });

    it("turns each teaching format into an offered Service", () => {
      const offer = full.hasOfferCatalog?.itemListElement[0];
      expect(offer?.itemOffered["@type"]).toBe("Service");
      expect(offer?.itemOffered.name).toBe("Kèm 1 – 1");
      expect(offer?.itemOffered.provider["@id"]).toBe(`${SITE_URL}/#organization`);
    });

    it("lists each tutor as a Person carrying their real credential", () => {
      const person = full.employee?.[0];
      expect(person?.["@type"]).toBe("Person");
      expect(person?.jobTitle).toBe("Tiếng Anh");
      expect(person?.description).toBe("HSK6, B2");
    });
  });
});

describe("websiteSchema", () => {
  it("links back to the organization node as publisher", () => {
    expect(websiteSchema("vi").publisher["@id"]).toBe(`${SITE_URL}/#organization`);
  });
});

describe("webPageSchema", () => {
  const schema = webPageSchema({ locale: "vi", name: "Tiêu đề", description: "mô tả" });

  it("hangs off the website and points back at the organization", () => {
    expect(schema.isPartOf["@id"]).toBe(`${SITE_URL}/#website`);
    expect(schema.about["@id"]).toBe(`${SITE_URL}/#organization`);
  });

  it("declares the open graph image as the page's primary image, with its real size", () => {
    expect(schema.primaryImageOfPage.width).toBe(SITE_OG_IMAGE.width);
    expect(schema.primaryImageOfPage.height).toBe(SITE_OG_IMAGE.height);
  });

  it("uses the locale's own URL so the two locales are distinct nodes", () => {
    expect(webPageSchema({ locale: "en", name: "T", description: "d" })["@id"]).not.toBe(
      schema["@id"],
    );
    expect(schema.url).toBe(localeUrl("vi"));
  });
});

describe("courseListSchema", () => {
  const schema = courseListSchema(
    [{ name: "Toán", description: "Đại số và hình học", grades: "Lớp 1 – 12" }],
    "vi",
  );

  it("wraps courses in an ItemList", () => {
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.itemListElement).toHaveLength(1);
  });

  it("marks each item as a Course provided by the organization", () => {
    const first = schema.itemListElement[0];
    expect(first.item["@type"]).toBe("Course");
    expect(first.item.provider["@id"]).toBe(`${SITE_URL}/#organization`);
  });

  it("gives each course the anchored URL Google's course list requires", () => {
    expect(schema.itemListElement[0].item.url).toBe(`${localeUrl("vi")}#khoa-hoc`);
  });

  it("carries the grade range as educationalLevel", () => {
    expect(schema.itemListElement[0].item.educationalLevel).toBe("Lớp 1 – 12");
  });

  it("omits educationalLevel rather than emitting an empty one when grades are absent", () => {
    const bare = courseListSchema([{ name: "Toán", description: "d" }], "vi");
    expect(bare.itemListElement[0].item).not.toHaveProperty("educationalLevel");
  });
});

describe("faqSchema", () => {
  it("maps items to Question/acceptedAnswer pairs", () => {
    const schema = faqSchema([{ question: "Q?", answer: "A." }]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("A.");
  });

  it("binds itself to the page node when given a locale", () => {
    const schema = faqSchema([{ question: "Q?", answer: "A." }], "vi");
    expect(schema.isPartOf?.["@id"]).toBe(`${localeUrl("vi")}#webpage`);
  });
});

describe("toJsonLdScript", () => {
  it("escapes '<' so catalog content can't close the surrounding <script> tag early", () => {
    const html = toJsonLdScript({ quote: "Con tôi </script><script>alert(1)</script> giỏi hơn" });
    expect(html).not.toContain("<");
    expect(html).toContain("\\u003c/script>");
    expect(html).toContain("\\u003cscript>");
  });

  it("round-trips to the original string once parsed back out of the script tag", () => {
    const original = { note: "a < b and a </script> tag" };
    const parsed = JSON.parse(toJsonLdScript(original));
    expect(parsed).toEqual(original);
  });

  it("leaves content with no '<' unchanged apart from JSON serialization", () => {
    const node = { name: "Trí Tuệ Việt" };
    expect(toJsonLdScript(node)).toBe(JSON.stringify(node));
  });
});
