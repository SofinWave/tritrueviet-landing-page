import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_GTM_ID } from "@/lib/site";

const layoutSource = fs.readFileSync(path.join(process.cwd(), "app/[locale]/layout.tsx"), "utf8");

describe("Google Tag Manager", () => {
  it("uses the GTM container ID", () => {
    expect(SITE_GTM_ID).toBe("GTM-PPW3Q4FC");
  });

  it("mounts the GoogleTagManager component exactly once in the locale layout", () => {
    expect(layoutSource).toContain(
      'import { GoogleTagManager } from "@next/third-parties/google";',
    );
    expect(layoutSource.match(/<GoogleTagManager gtmId=\{SITE_GTM_ID\}\s*\/>/g)).toHaveLength(1);
  });

  it("no longer loads gtag.js directly, so GA4 is not counted twice", () => {
    expect(layoutSource).not.toContain("GoogleAnalytics");
  });
});
