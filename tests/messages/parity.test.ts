import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj)) {
    if (obj.length === 0) return [prefix];
    return obj.flatMap((v, i) => keyPaths(v, prefix ? `${prefix}.${i}` : `${i}`));
  }
  if (obj && typeof obj === "object") {
    return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
      keyPaths(v, prefix ? `${prefix}.${k}` : k),
    );
  }
  return [prefix];
}

describe("message catalogs", () => {
  it("vi and en have identical key structure", () => {
    expect(keyPaths(vi).sort()).toEqual(keyPaths(en).sort());
  });
});
