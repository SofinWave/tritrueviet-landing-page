import { describe, expect, it } from "vitest";
import vi from "@/messages/vi.json";
import { buildLlmsTxt } from "@/lib/llms-txt";
import { SITE_NAME, SITE_PHONE_E164, SITE_URL, localeUrl } from "@/lib/site";

const output = buildLlmsTxt();

describe("llms.txt", () => {
  it("opens with an H1 of the brand name and a blockquote summary, per llmstxt.org", () => {
    const [first, , third] = output.split("\n");
    expect(first).toBe(`# ${SITE_NAME}`);
    expect(third).toBe(`> ${vi.metadata.description}`);
  });

  it("ends with exactly one trailing newline", () => {
    expect(output.endsWith("\n")).toBe(true);
    expect(output.endsWith("\n\n")).toBe(false);
  });

  it("never stacks more than one blank line between blocks", () => {
    expect(output).not.toMatch(/\n{3,}/);
  });

  it("gives an answer engine the dialable number, not just the display form", () => {
    expect(output).toContain(SITE_PHONE_E164);
  });

  it("links the canonical page and the sitemap", () => {
    expect(output).toContain(localeUrl("vi"));
    expect(output).toContain(`${SITE_URL}/sitemap.xml`);
  });

  it("carries every course with the grade range that says who it is for", () => {
    for (const course of vi.courses.items) {
      expect(output).toContain(course.name);
      expect(output).toContain(course.grades);
    }
  });

  it("carries every teaching format", () => {
    for (const format of vi.formats.items) expect(output).toContain(format.name);
  });

  it("keeps the 'Chỉ từ' prefix on every price — these are floors, not flat rates", () => {
    for (const plan of vi.pricing.plans) {
      expect(output).toContain(`${vi.pricing.from} ${plan.price}`);
    }
  });

  it("carries every tutor with their credential", () => {
    for (const teacher of vi.teachers.items) {
      expect(output).toContain(teacher.name);
      expect(output).toContain(teacher.credential);
    }
  });

  it("reproduces parent testimonials verbatim rather than paraphrased", () => {
    for (const t of vi.testimonials.items) expect(output).toContain(t.quote);
  });

  it("carries every FAQ question and its full answer", () => {
    for (const item of vi.faq.items) {
      expect(output).toContain(`### ${item.question}`);
      expect(output).toContain(item.answer);
    }
  });

  it("points at the other locale so an English answer can cite an English page", () => {
    expect(output).toContain(localeUrl("en"));
  });

  it("carries no unfilled placeholder", () => {
    expect(output).not.toContain("[TODO:");
  });

  it("builds for the secondary locale too, in that locale's own copy", () => {
    const en = buildLlmsTxt("en");
    expect(en).toContain("Tri Tue Viet");
    expect(en).toContain(localeUrl("vi"));
  });

  it("falls back to the default locale rather than throwing on an unknown one", () => {
    expect(buildLlmsTxt("de")).toBe(output);
  });
});
