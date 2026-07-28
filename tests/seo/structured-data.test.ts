import { describe, expect, it } from "vitest";
import { SITE_URL } from "@/lib/site";
import {
  courseListSchema,
  educationalOrganizationSchema,
  faqSchema,
  toJsonLdScript,
  websiteSchema,
} from "@/lib/structured-data";

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
});

describe("websiteSchema", () => {
  it("links back to the organization node as publisher", () => {
    expect(websiteSchema("vi").publisher["@id"]).toBe(`${SITE_URL}/#organization`);
  });
});

describe("courseListSchema", () => {
  const schema = courseListSchema([{ name: "Toán", description: "Đại số và hình học" }], "vi");

  it("wraps courses in an ItemList", () => {
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.itemListElement).toHaveLength(1);
  });

  it("marks each item as a Course provided by the organization", () => {
    const first = schema.itemListElement[0];
    expect(first.item["@type"]).toBe("Course");
    expect(first.item.provider["@id"]).toBe(`${SITE_URL}/#organization`);
  });
});

describe("faqSchema", () => {
  it("maps items to Question/acceptedAnswer pairs", () => {
    const schema = faqSchema([{ question: "Q?", answer: "A." }]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("A.");
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
