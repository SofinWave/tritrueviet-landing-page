import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs vitest with globals and the @ alias resolved", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
