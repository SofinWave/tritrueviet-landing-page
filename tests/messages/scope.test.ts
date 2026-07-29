import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { URL as NodeURL, fileURLToPath } from "node:url";
import vi from "@/messages/vi.json";
import en from "@/messages/en.json";
import { SITE_KEYWORDS } from "@/lib/site";
import { LocaleSupport } from "@/enums/locale.enum";

/**
 * The centre's intake widened from grades 6–12 to 1–12, and picked up
 * programming. That range was not held in one place — it was spelled out in the
 * SEO description, the footer tagline, the web manifest, the keyword list and
 * every course card. Four of those five are invisible on screen, which is
 * exactly why they went stale unnoticed. This file is the net.
 */

const read = (relative: string) =>
  readFileSync(fileURLToPath(new NodeURL(relative, import.meta.url)), "utf8");

const STALE_RANGE = [
  /lớp 6 đến lớp 12/i,
  /THCS và THPT/i,
  /grade 6 to 12/i,
  /secondary and high school/i,
];

describe("advertised scope", () => {
  it("never claims the old grades 6–12 intake in visitor-facing copy", () => {
    const copy = [
      vi.metadata.description,
      en.metadata.description,
      vi.footer.tagline,
      en.footer.tagline,
      vi.courses.description,
      en.courses.description,
    ].join("\n");

    for (const stale of STALE_RANGE) {
      expect(copy, `stale intake range ${stale} still in the catalogues`).not.toMatch(stale);
    }
  });

  it("never claims the old intake in the web manifest either", () => {
    // Not rendered on screen, so nothing else would catch it drifting.
    const manifest = read("../../app/manifest.ts");
    for (const stale of STALE_RANGE) {
      expect(manifest, `stale intake range ${stale} in manifest.ts`).not.toMatch(stale);
    }
  });

  it("keeps both catalogues on the same number of course cards", () => {
    // The parity test compares key paths; this pins the count itself, since a
    // locale silently offering fewer courses than the other is a service claim
    // mismatch rather than a structural one.
    expect(vi.courses.items).toHaveLength(en.courses.items.length);
    expect(vi.courses.items.length).toBeGreaterThanOrEqual(6);
  });

  it("never promises an entry test the centre does not run", () => {
    // The centre assesses level by asking during the consultation; there is no
    // test. That claim had spread to three places — the hero strapline, process
    // step two and an FAQ answer — so fixing only the step someone happens to be
    // looking at leaves the promise standing elsewhere on the same page.
    const copy = [
      vi.hero.subtitle,
      en.hero.subtitle,
      ...vi.process.steps.flatMap((s) => [s.title, s.description]),
      ...en.process.steps.flatMap((s) => [s.title, s.description]),
      ...vi.faq.items.map((i) => i.answer),
      ...en.faq.items.map((i) => i.answer),
    ]
      .join("\n")
      // The copy states the absence positively ("a conversation, not an exam")
      // rather than denying a test outright, so these strips are usually no-ops.
      // They stay because a flat denial is a reasonable thing for someone to
      // write later, and it should not trip the guard that protects the fix.
      .replace(/không có bài kiểm tra đầu vào/gi, "")
      .replace(/there is no entry test/gi, "");

    for (const promise of [
      /bài (kiểm tra|test)/i,
      /kiểm tra đầu vào/i,
      /entry (test|assessment)/i,
    ]) {
      expect(copy, `${promise} promises an assessment that does not happen`).not.toMatch(promise);
    }
  });

  it("offers Zalo and the hotline as a route in, not just the form", () => {
    // Most enquiries arrive by chat or phone; a process that only describes the
    // form under-sells the two channels the centre actually answers fastest.
    expect(vi.process.steps[0].description).toMatch(/zalo/i);
    expect(vi.process.steps[0].description).toMatch(/hotline/i);
    expect(en.process.steps[0].description).toMatch(/zalo/i);
    expect(en.process.steps[0].description).toMatch(/hotline/i);
  });

  it("carries every teaching pillar into the search keywords", () => {
    // Primary pupils and programming are new revenue lines; if they are absent
    // from the keyword list the pages never surface for those searches.
    const joined = SITE_KEYWORDS[LocaleSupport.VI].join(" ").toLowerCase();
    expect(joined).toContain("tiểu học");
    expect(joined).toContain("lập trình");

    const joinedEn = SITE_KEYWORDS[LocaleSupport.EN].join(" ").toLowerCase();
    expect(joinedEn).toContain("primary");
    expect(joinedEn).toContain("programming");
  });
});
