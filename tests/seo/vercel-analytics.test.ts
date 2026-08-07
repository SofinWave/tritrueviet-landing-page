import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const layoutSource = fs.readFileSync(path.join(process.cwd(), "app/[locale]/layout.tsx"), "utf8");

describe("Vercel Web Analytics", () => {
  it("mounts the Next.js Analytics component exactly once in the locale layout", () => {
    expect(layoutSource).toContain('import { Analytics } from "@vercel/analytics/next";');
    expect(layoutSource.match(/<Analytics\s*\/>/g)).toHaveLength(1);
  });
});
