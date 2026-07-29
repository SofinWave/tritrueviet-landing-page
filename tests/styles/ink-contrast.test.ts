import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
// Xem chú thích trong tokens.test.ts: bí danh NodeURL tránh việc Vite viết lại
// literal `new URL(str, import.meta.url)` thành URL asset của dev server.
import { URL as NodeURL, fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new NodeURL("../../", import.meta.url));
const SOURCE_DIRS = ["app", "components"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(entry.name) ? [path] : [];
  });
}

/**
 * Ngưỡng độ mờ thấp nhất còn đọc được của chữ trên nền ink.
 *
 * Đo `--surface-ink-foreground` trên `--surface-ink` ở dark mode (trường hợp
 * xấu hơn trong hai theme, vì dark mode ĐẢO dải ink sang blue-800):
 *   /60 → 4.04:1  (trượt AA cho chữ thường)
 *   /70 → 4.94:1
 *   /75 → 5.44:1
 * AA cần 4.5:1, nên /70 là mức thấp nhất còn hợp lệ.
 */
const MIN_TEXT_OPACITY = 70;
const TEXT_ON_INK = /text-surface-ink-foreground\/(\d+)/g;

describe("ink surface text contrast", () => {
  it("never drops ink body text below the AA opacity floor", () => {
    // Đây là guard cho CẢ MỘT LOẠI lỗi, không chỉ một dòng: bất kỳ chữ nào
    // trên nền ink mờ hơn /70 đều trượt AA ở dark mode. Nếu cần một sắc độ
    // mờ hơn cho chữ trang trí, hãy nâng ngưỡng có chủ đích ở đây kèm số đo,
    // đừng nới lỏng biểu thức.
    const offenders: string[] = [];

    for (const dir of SOURCE_DIRS) {
      for (const file of sourceFiles(join(ROOT, dir))) {
        const source = readFileSync(file, "utf8");
        for (const match of source.matchAll(TEXT_ON_INK)) {
          const opacity = Number(match[1]);
          if (opacity < MIN_TEXT_OPACITY) {
            offenders.push(`${relative(ROOT, file)}: ${match[0]}`);
          }
        }
      }
    }

    expect(offenders, `chữ trên nền ink mờ dưới /${MIN_TEXT_OPACITY}`).toEqual([]);
  });

  it("still finds the ink text utilities it is meant to be policing", () => {
    // Nếu ai đó đổi tên token, biểu thức trên sẽ không khớp gì nữa và test
    // đầu tiên sẽ xanh một cách vô nghĩa.
    const all = SOURCE_DIRS.flatMap((dir) => sourceFiles(join(ROOT, dir)))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n")
      .match(TEXT_ON_INK);
    expect(all?.length ?? 0).toBeGreaterThan(4);
  });
});
