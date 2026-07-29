import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { SITE_URL, localeUrl } from "@/lib/site";
import { routing } from "@/i18n/routing";

describe("sitemap", () => {
  it("lists one absolute entry per locale, pointing at the page that actually serves 200 (not the /:locale prefix, which 307s to /home)", () => {
    const entries = sitemap();
    expect(entries.map((e) => e.url).sort()).toEqual([
      `${SITE_URL}/en/home`,
      `${SITE_URL}/vi/home`,
    ]);
  });

  it("gives the default locale top priority", () => {
    const vi = sitemap().find((e) => e.url === `${SITE_URL}/vi/home`);
    expect(vi?.priority).toBe(1);
  });

  it("gives non-default locales a lower priority", () => {
    const en = sitemap().find((e) => e.url === `${SITE_URL}/en/home`);
    expect(en?.priority).toBe(0.9);
  });

  it("declares hreflang alternates including x-default", () => {
    const languages = sitemap()[0]?.alternates?.languages ?? {};
    expect(Object.keys(languages).sort()).toEqual(["en", "vi", "x-default"]);
  });

  it("points x-default at the default locale's URL", () => {
    const languages = sitemap()[0]?.alternates?.languages ?? {};
    expect(languages["x-default"]).toBe(localeUrl(routing.defaultLocale));
  });
});

describe("robots", () => {
  type Rule = { userAgent: string; allow?: string; disallow?: string[] };
  const rules = () => robots().rules as Rule[];
  const agents = () => rules().map((r) => r.userAgent);

  it("points at the absolute sitemap URL", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("allows the generic crawler and blocks /api/", () => {
    expect(rules().find((r) => r.userAgent === "*")?.disallow).toContain("/api/");
  });

  // A named User-agent group replaces the `*` group rather than inheriting it,
  // so every AI rule has to carry the /api/ block itself.
  it("repeats the /api/ block on every named rule instead of relying on inheritance", () => {
    for (const rule of rules()) {
      expect(rule.allow).toBe("/");
      expect(rule.disallow).toContain("/api/");
    }
  });

  // Each vendor runs a training crawler, a search indexer and a fetch-for-user
  // agent. Allowing only one of the three is the failure mode this pins.
  describe.each([
    ["OpenAI", ["GPTBot", "OAI-SearchBot", "ChatGPT-User"]],
    ["Anthropic", ["ClaudeBot", "Claude-SearchBot", "Claude-User"]],
    ["Google / Gemini", ["Google-Extended", "GoogleOther", "Google-CloudVertexBot"]],
  ])("priority vendor: %s", (_vendor, expected) => {
    it.each(expected)("welcomes %s", (agent) => {
      expect(agents()).toContain(agent);
    });
  });

  it("also welcomes the non-priority answer engines", () => {
    for (const agent of ["PerplexityBot", "Applebot-Extended", "meta-externalagent", "CCBot"]) {
      expect(agents()).toContain(agent);
    }
  });

  // Naming Googlebot would create a group that overrides the `*` rule for it.
  it("leaves Googlebot to the generic rule rather than shadowing it", () => {
    expect(agents()).not.toContain("Googlebot");
  });

  it("names every AI agent exactly once", () => {
    expect(new Set(agents()).size).toBe(agents().length);
  });
});

describe("manifest", () => {
  it("uses the short brand name and starts at the root", () => {
    expect(manifest().short_name).toBe("Trí Tuệ Việt");
    expect(manifest().start_url).toBe("/");
  });
});
