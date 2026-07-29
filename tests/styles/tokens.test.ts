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
  const { open, close } = balancedRange(start);
  return css.slice(open + 1, close);
}

/**
 * Từ vị trí bắt đầu một construct CSS (selector/@rule, trước dấu `{` của nó),
 * tìm dấu `{` mở đầu tiên và dấu `}` đóng cân bằng tương ứng. Trả về chỉ số
 * của cả hai để gọi có thể kiểm tra quan hệ lồng nhau (A nằm trong B) bằng
 * cách so sánh khoảng [open, close] thay vì chỉ khớp chuỗi con.
 */
function balancedRange(fromIndex: number): { open: number; close: number } {
  const open = css.indexOf("{", fromIndex);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++;
    else if (css[i] === "}") {
      depth--;
      if (depth === 0) return { open, close: i };
    }
  }
  throw new Error(`construct bắt đầu tại chỉ số ${fromIndex} không đóng ngoặc`);
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

describe("motion and pattern utilities", () => {
  it("keeps .reveal nested inside @media(no-preference) nested inside @supports", () => {
    // Nếu .reveal lọt ra ngoài @supports, Firefox (chưa hỗ trợ
    // animation-timeline) sẽ giữ nội dung ở trạng thái đầu của keyframe và
    // ẩn chữ vĩnh viễn. Đây là chế độ hỏng tệ nhất của cả thiết kế.
    //
    // Chỉ khớp chuỗi con là không đủ: cả @supports lẫn @media đều có thể
    // tồn tại đâu đó trong file mà không thực sự lồng nhau, hoặc .reveal có
    // thể nằm trong @supports nhưng ngoài @media (mất bảo vệ
    // prefers-reduced-motion trong khi vẫn "chứa" cả hai chuỗi). Vì vậy ở
    // đây kiểm tra quan hệ lồng nhau bằng khoảng ngoặc cân bằng, không phải
    // bằng vị trí chuỗi con đơn thuần.
    const supportsStart = css.indexOf("@supports (animation-timeline: view())");
    expect(supportsStart, "thiếu block @supports cho animation-timeline").toBeGreaterThan(-1);
    const supportsRange = balancedRange(supportsStart);

    const mediaStart = css.indexOf(
      "@media (prefers-reduced-motion: no-preference)",
      supportsRange.open,
    );
    expect(mediaStart, "thiếu @media(no-preference) bên trong @supports").toBeGreaterThan(-1);
    expect(mediaStart, "@media(no-preference) phải nằm trong @supports").toBeLessThan(
      supportsRange.close,
    );
    const mediaRange = balancedRange(mediaStart);
    expect(
      mediaRange.close,
      "@media(no-preference) phải đóng trước khi @supports đóng",
    ).toBeLessThan(supportsRange.close);

    const revealRule = css.indexOf(".reveal {", mediaRange.open);
    expect(revealRule, "không tìm thấy rule .reveal").toBeGreaterThan(-1);
    expect(revealRule, ".reveal phải nằm trong @media(no-preference)").toBeGreaterThan(
      mediaRange.open,
    );
    expect(revealRule, ".reveal phải nằm trong @media(no-preference)").toBeLessThan(
      mediaRange.close,
    );
  });

  it("defines the grid pattern utility", () => {
    expect(css).toContain(".bg-grid {");
    expect(css).toContain("mask-image:");
  });
});
