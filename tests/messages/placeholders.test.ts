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
  // stats.* were removed on purpose once the centre supplied real figures.
  // `stats.passRate` no longer exists at all: no admission-rate number was
  // available, so the slot became `stats.tutors` rather than carry an invented
  // one. Deleting entries here is the intended way to retire a placeholder —
  // never weaken the assertion instead.
  // teachers.items.* were removed on purpose once the centre supplied the four
  // real tutors, their credentials and their portraits. `teachers.items[].photo`
  // is a new sibling key and was never a placeholder — it is pinned to a real
  // portrait by tests/sections/teachers.test.tsx instead.
  // achievements.items.* were removed on purpose once the centre supplied three
  // real student results. Note what is NOT in those entries: no school year and
  // no exact entrance score, because none were given. Filling those gaps in
  // later means asking the centre, never estimating — these are advertising
  // claims aimed at parents.
  // pricing.plans.*.price were removed on purpose once the centre supplied its
  // floor prices. Every one of them is a *starting* figure, which is why the
  // card renders a `pricing.from` prefix in front of it — see
  // tests/sections/pricing.test.tsx, which pins that prefix so a later edit
  // cannot quietly turn "from 150k" into a flat rate.
  //
  // `pricing.plans[1]` is no longer the small-group plan: the centre priced the
  // working-adult track instead, and the grid is md:grid-cols-3, so the slot was
  // repurposed rather than left as a visible placeholder — the same move
  // stats.passRate -> stats.tutors made. Small groups still appear under
  // `formats.items[]`, just without a listed price.
  // testimonials.items.* were removed on purpose once the centre supplied three
  // real parent quotes. These are the one field on the page that must never be
  // written by anyone but the person quoted: a testimonial is an endorsement
  // attributed to a named customer, so composing one — however plausible, and
  // however much it reads like the rest of the marketing copy around it — makes
  // it a fake review rather than a placeholder. Refilling this slot means going
  // back to a parent, never drafting on their behalf.
  //
  // Slot 2 was originally reserved for a *student* quote; all three supplied
  // quotes came from parents, so `testimonials.title` dropped "và học viên".
] as const;

/**
 * Key paths inside lib/site.ts that must still hold a "[TODO: ...]"
 * placeholder. SITE_ADDRESS.country ("VN") is deliberately excluded — it is
 * real data, not a placeholder.
 */
const SITE_PLACEHOLDER_PATHS = [
  // SITE_PHONE, SITE_ZALO_URL, SITE_ADDRESS.* and SITE_OPENING_HOURS[0] were
  // removed on purpose once the centre supplied them. SITE_EMAIL is gone
  // entirely rather than filled — there is no published address yet, and the
  // centre chose to drop the channel instead of showing a dead `mailto:`.
  //
  // SITE_URL is still not on this list and never was: its default is a real
  // domain rather than a "[TODO: ...]" string, so nothing here can see it.
] as const;

function isPlaceholder(value: unknown): boolean {
  return typeof value === "string" && value.startsWith("[TODO:");
}

/** Every dot/bracket path in `value` whose leaf is a "[TODO: ...]" string. */
function findPlaceholders(value: unknown, prefix = ""): string[] {
  if (isPlaceholder(value)) return [prefix];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findPlaceholders(item, `${prefix}[${index}]`));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      findPlaceholders(child, prefix ? `${prefix}.${key}` : key),
    );
  }
  return [];
}

/**
 * Both lists are empty today, so the original per-path assertions would be
 * `describe.each([])` / `it.each([])` — zero tests, silently green. These
 * assertions replace them and hold in both directions: a placeholder that gets
 * filled without its entry being deleted fails, and a *new* placeholder added
 * without being registered fails too. The second half is coverage the old shape
 * never had.
 */
describe("placeholder integrity", () => {
  it.each([
    ["vi", vi],
    ["en", en],
  ])("%s.json holds exactly the registered placeholders, no more and no fewer", (_locale, cat) => {
    expect(findPlaceholders(cat).sort()).toEqual([...MESSAGE_PLACEHOLDER_PATHS].sort());
  });

  it("lib/site.ts holds exactly the registered placeholders", () => {
    // SITE_ADDRESS.country ("VN") is real data, so it is correctly absent here.
    expect(findPlaceholders(site).sort()).toEqual([...SITE_PLACEHOLDER_PATHS].sort());
  });

  it("vi and en agree on which message paths are still placeholders", () => {
    expect(findPlaceholders(vi).sort()).toEqual(findPlaceholders(en).sort());
  });
});
