import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CountUp, parseFigure } from "@/components/count-up";

describe("parseFigure", () => {
  it("recovers the number from each locale's display format", () => {
    // The catalogue stores display strings, not numbers: vi groups with ".",
    // en with ",". Both must yield the same integer.
    expect(parseFigure("3.000+")).toEqual({ prefix: "", target: 3000, suffix: "+" });
    expect(parseFigure("3,000+")).toEqual({ prefix: "", target: 3000, suffix: "+" });
  });

  it("keeps whatever sits around the digits", () => {
    expect(parseFigure("2+")).toEqual({ prefix: "", target: 2, suffix: "+" });
    expect(parseFigure("98%")).toEqual({ prefix: "", target: 98, suffix: "%" });
    expect(parseFigure("~500 bạn")).toEqual({ prefix: "~", target: 500, suffix: " bạn" });
  });

  it("refuses anything without digits instead of guessing", () => {
    // An unfilled placeholder must fall through untouched rather than animate
    // toward some invented number.
    expect(parseFigure("[TODO: số học viên]")).toBeNull();
    expect(parseFigure("")).toBeNull();
  });
});

describe("CountUp", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("renders the final figure when motion is reduced", () => {
    // vitest.setup.ts reports matchMedia().matches === true, so this is the
    // reduced-motion path. It is also what the server renders and what a
    // visitor without JS keeps: the real figure, never a "1".
    render(<CountUp value="3.000+" locale="vi" />);
    expect(screen.getByText("3.000+")).toBeInTheDocument();
  });

  it("passes an unparseable value straight through", () => {
    render(<CountUp value="[TODO: số học viên]" locale="vi" />);
    expect(screen.getByText("[TODO: số học viên]")).toBeInTheDocument();
  });

  it("counts from 1 to the target and settles on the catalogue string", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: false, // motion allowed
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }));

    let trigger: (() => void) | undefined;
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(private cb: (e: { isIntersecting: boolean }[]) => void) {
          trigger = () => this.cb([{ isIntersecting: true }]);
        }
        observe() {}
        disconnect() {}
        unobserve() {}
        takeRecords() {
          return [];
        }
      },
    );

    const frames: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => frames.push(cb));
    vi.stubGlobal("cancelAnimationFrame", () => {});

    render(<CountUp value="3.000+" locale="vi" />);

    // Parked at its start before it scrolls into view — and the "+" is carried
    // through every frame, so the suffix never pops in at the end.
    expect(screen.getByText("1+")).toBeInTheDocument();

    act(() => trigger?.());
    // The first frame only establishes the time origin — the clock starts on
    // whatever timestamp rAF happens to hand over, not on zero.
    act(() => frames.shift()?.(0));

    // Halfway through the 1200ms window the figure sits between the two ends and
    // is already grouped in the Vietnamese format.
    act(() => frames.shift()?.(600));
    const mid = screen.getByText(/\d/).textContent ?? "";
    expect(mid).toMatch(/^[\d.]+\+$/);
    const midValue = Number(mid.replace(/\D/g, ""));
    expect(midValue).toBeGreaterThan(1);
    expect(midValue).toBeLessThan(3000);

    act(() => frames.shift()?.(1200));
    // Lands on the exact catalogue string, suffix included — not on "3.000".
    expect(screen.getByText("3.000+")).toBeInTheDocument();
  });
});
