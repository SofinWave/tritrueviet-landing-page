import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { SITE_LOGO, SITE_OG_IMAGE, absoluteUrl } from "@/lib/site";

const PUBLIC_DIR = join(process.cwd(), "public");

/**
 * Reads the width/height out of a JPEG's first SOF (Start Of Frame) marker.
 *
 * The point is to check the *actual bytes on disk*, not a number we typed next
 * to them: `SITE_OG_IMAGE` promises 1200x630 to every crawler, and a re-export
 * or re-crop that quietly changed the file would otherwise sail through with
 * the constants still claiming the old size.
 */
function jpegSize(buffer: Buffer): { width: number; height: number } {
  // SOI marker.
  expect(buffer.readUInt16BE(0)).toBe(0xffd8);

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) throw new Error("not a JPEG segment boundary");
    const marker = buffer[offset + 1];
    const length = buffer.readUInt16BE(offset + 2);

    // SOF0..SOF15, skipping the four markers in that range that are not frames.
    const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc, 0xd8].includes(marker);
    if (isFrame) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    offset += 2 + length;
  }
  throw new Error("no SOF marker found");
}

function pngSize(buffer: Buffer): { width: number; height: number } {
  expect(buffer.subarray(1, 4).toString("ascii")).toBe("PNG");
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

describe("open graph image", () => {
  const file = join(PUBLIC_DIR, SITE_OG_IMAGE.path);

  it("exists at the path the metadata advertises", () => {
    expect(existsSync(file)).toBe(true);
  });

  it("really is the 1200x630 the metadata declares", () => {
    expect(jpegSize(readFileSync(file))).toEqual({
      width: SITE_OG_IMAGE.width,
      height: SITE_OG_IMAGE.height,
    });
  });

  it("is at least 1200px wide, or X downgrades summary_large_image to the small card", () => {
    expect(SITE_OG_IMAGE.width).toBeGreaterThanOrEqual(1200);
  });

  it("stays under the 5MB most scrapers refuse to download", () => {
    expect(readFileSync(file).byteLength).toBeLessThan(5 * 1024 * 1024);
  });
});

describe("organization logo", () => {
  const file = join(PUBLIC_DIR, SITE_LOGO.path);

  it("exists and matches its declared dimensions", () => {
    expect(existsSync(file)).toBe(true);
    expect(pngSize(readFileSync(file))).toEqual({
      width: SITE_LOGO.width,
      height: SITE_LOGO.height,
    });
  });
});

describe("absoluteUrl", () => {
  it("produces an absolute URL crawlers accept — a relative og:image is dropped", () => {
    expect(absoluteUrl(SITE_OG_IMAGE.path)).toMatch(/^https?:\/\/.+\/images\/og-image\.jpg$/);
  });

  it("tolerates a path with no leading slash rather than concatenating it flat", () => {
    expect(absoluteUrl("images/og-image.jpg")).toBe(absoluteUrl("/images/og-image.jpg"));
  });
});
