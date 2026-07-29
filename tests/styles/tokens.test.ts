import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
// Vite statically pattern-matches the literal syntax `new URL(str, import.meta.url)`
// whenever the callee is named `URL` and rewrites it into a dev-server asset URL —
// regardless of what's actually imported under that name. Aliasing the import avoids
// the match so this resolves to a real `file:` URL instead of `http://localhost:3000/...`.
import { URL as NodeURL, fileURLToPath } from "node:url";

const css = readFileSync(
  fileURLToPath(new NodeURL("../../app/globals.css", import.meta.url)),
  "utf8",
);

/**
 * Cắt ra thân của một block CSS top-level, cân bằng ngoặc nhọn.
 * Selector phải kèm dấu `{` — nếu tìm `.dark` trần thì nó khớp nhầm vào
 * `@custom-variant dark (&:is(.dark *))` ở đầu file và trả về block sai.
 */
function block(selector: string): string {
  const start = css.indexOf(selector);
  expect(start, `không tìm thấy block "${selector}" trong globals.css`).toBeGreaterThan(-1);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return css.slice(open + 1, i);
    }
  }
  throw new Error(`block "${selector}" không đóng ngoặc`);
}

const NEW_TOKENS = ["highlight", "highlight-foreground", "surface-ink", "surface-ink-foreground"];

describe("design tokens", () => {
  it("maps every new token in @theme inline so Tailwind emits the utility class", () => {
    const theme = block("@theme inline {");
    for (const token of NEW_TOKENS) {
      expect(theme, `thiếu --color-${token} trong @theme inline`).toContain(
        `--color-${token}: var(--${token});`,
      );
    }
  });

  it("defines every new token in :root", () => {
    const root = block(":root {");
    for (const token of NEW_TOKENS) {
      expect(root, `thiếu --${token} trong :root`).toMatch(new RegExp(`--${token}:`));
    }
  });

  it("defines every new token in .dark", () => {
    const dark = block(".dark {");
    for (const token of NEW_TOKENS) {
      expect(dark, `thiếu --${token} trong .dark`).toMatch(new RegExp(`--${token}:`));
    }
  });

  it("keeps the dark page background darker than the dark ink surface", () => {
    // Bất biến của thiết kế: ở dark mode dải ink phải NỔI trên nền, không chìm.
    const dark = block(".dark {");
    const lightness = (token: string) => {
      const match = dark.match(new RegExp(`--${token}:\\s*oklch\\(\\s*([\\d.]+)(%?)`));
      expect(match, `không đọc được độ sáng của --${token} trong .dark`).not.toBeNull();
      const value = Number(match![1]);
      return match![2] === "%" ? value / 100 : value;
    };
    expect(lightness("background")).toBeLessThan(lightness("surface-ink"));
  });

  it("sharpens the corner radius", () => {
    expect(block(":root {")).toContain("--radius: 0.375rem;");
  });
});
