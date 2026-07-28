// Guard against quietly replacing a "[TODO: ...]" placeholder with an
// invented business fact (a headcount, a pass rate, a phone number, an
// address). This test is expected to go red the day the centre supplies
// real data for one of the fields below — that is correct behaviour, not a
// bug. The fix at that point is to deliberately delete the corresponding
// entry from the relevant list, not to weaken or remove an assertion.

import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";
import * as site from "@/lib/site";

/**
 * Dot/bracket key paths inside messages/*.json that must still hold a
 * "[TODO: ...]" placeholder in both catalogs. Extend this list — never
 * replace an entry with a heuristic — as later tasks introduce more
 * placeholder fields (e.g. teachers.items, achievements.items,
 * pricing.plans[].price, testimonials.items).
 */
const MESSAGE_PLACEHOLDER_PATHS = [
  "stats.students.value",
  "stats.years.value",
  "stats.passRate.value",
  "stats.teachers.value",
  "teachers.items.0.name",
  "teachers.items.0.subject",
  "teachers.items.0.credential",
  "teachers.items.1.name",
  "teachers.items.1.subject",
  "teachers.items.1.credential",
  "teachers.items.2.name",
  "teachers.items.2.subject",
  "teachers.items.2.credential",
  "teachers.items.3.name",
  "teachers.items.3.subject",
  "teachers.items.3.credential",
  "achievements.items.0.title",
  "achievements.items.0.detail",
  "achievements.items.1.title",
  "achievements.items.1.detail",
  "achievements.items.2.title",
  "achievements.items.2.detail",
  "pricing.plans.0.price",
  "pricing.plans.1.price",
  "pricing.plans.2.price",
] as const;

/**
 * Key paths inside lib/site.ts that must still hold a "[TODO: ...]"
 * placeholder. SITE_ADDRESS.country ("VN") is deliberately excluded — it is
 * real data, not a placeholder.
 */
const SITE_PLACEHOLDER_PATHS = [
  "SITE_PHONE",
  "SITE_ZALO_URL",
  "SITE_EMAIL",
  "SITE_ADDRESS.street",
  "SITE_ADDRESS.district",
  "SITE_ADDRESS.city",
  "SITE_OPENING_HOURS[0]",
] as const;

function getPath(obj: unknown, path: string): unknown {
  const segments = path.match(/[^.[\]]+/g) ?? [];
  return segments.reduce<unknown>((acc, segment) => {
    if (acc == null || typeof acc !== "object") return undefined;
    return (acc as Record<string, unknown>)[segment];
  }, obj);
}

function isPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.startsWith("[TODO:");
}

describe("placeholder integrity", () => {
  describe.each(MESSAGE_PLACEHOLDER_PATHS)("messages.%s", (path) => {
    it("is still a [TODO: ...] placeholder in vi.json", () => {
      expect(getPath(vi, path)).toMatch(/^\[TODO:/);
    });

    it("is still a [TODO: ...] placeholder in en.json", () => {
      expect(getPath(en, path)).toMatch(/^\[TODO:/);
    });
  });

  it.each(SITE_PLACEHOLDER_PATHS)("lib/site.ts %s is still a [TODO: ...] placeholder", (path) => {
    expect(getPath(site, path)).toMatch(/^\[TODO:/);
  });

  it("vi and en agree on which message paths are still placeholders", () => {
    const viStatus = MESSAGE_PLACEHOLDER_PATHS.map((path) => isPlaceholder(getPath(vi, path)));
    const enStatus = MESSAGE_PLACEHOLDER_PATHS.map((path) => isPlaceholder(getPath(en, path)));
    expect(viStatus).toEqual(enStatus);
  });
});
