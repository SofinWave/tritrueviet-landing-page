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
  it("points at the absolute sitemap URL", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("allows the generic crawler and blocks /api/", () => {
    const generic = (robots().rules as Array<{ userAgent: string; disallow?: string[] }>).find(
      (r) => r.userAgent === "*",
    );
    expect(generic?.disallow).toContain("/api/");
  });

  it("welcomes named AI crawlers", () => {
    const agents = (robots().rules as Array<{ userAgent: string }>).map((r) => r.userAgent);
    expect(agents).toContain("GPTBot");
    expect(agents).toContain("ClaudeBot");
  });
});

describe("manifest", () => {
  it("uses the short brand name and starts at the root", () => {
    expect(manifest().short_name).toBe("Trí Tuệ Việt");
    expect(manifest().start_url).toBe("/");
  });
});
