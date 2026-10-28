import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_GA_MEASUREMENT_ID } from "@/lib/site";

const layoutSource = fs.readFileSync(path.join(process.cwd(), "app/[locale]/layout.tsx"), "utf8");

describe("Google Analytics", () => {
  it("uses the GA4 measurement ID", () => {
    expect(SITE_GA_MEASUREMENT_ID).toBe("G-G2XBB6FW2L");
  });

  it("mounts the GoogleAnalytics component exactly once in the locale layout", () => {
    expect(layoutSource).toContain('import { GoogleAnalytics } from "@next/third-parties/google";');
    expect(
      layoutSource.match(/<GoogleAnalytics gaId=\{SITE_GA_MEASUREMENT_ID\}\s*\/>/g),
    ).toHaveLength(1);
  });
});
