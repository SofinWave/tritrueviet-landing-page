"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

const DURATION_MS = 1200;

/**
 * Splits a catalogue figure into the parts we can animate.
 *
 * The values live in `messages/*.json` as display strings, not numbers —
 * "3.000+" in Vietnamese, "3,000+" in English — so the digits have to be
 * recovered and the surrounding characters preserved. Returns null for
 * anything without digits (an unfilled "[TODO: …]", say), and the caller
 * then renders the string untouched rather than guessing.
 */
export function parseFigure(value: string) {
  const match = value.match(/^(\D*?)([\d\s.,]*\d)(\D*)$/);
  if (!match) return null;
  const digits = match[2].replace(/\D/g, "");
  if (!digits) return null;
  return { prefix: match[1], target: Number(digits), suffix: match[3] };
}

// useLayoutEffect would warn during the server pass; on the client we need it so
// the first painted frame is already the start of the count, never the end value.
const useBeforePaint = typeof window === "undefined" ? useEffect : useLayoutEffect;

export function CountUp({ value, locale }: { value: string; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  // Seeded with the final figure on purpose: the server, crawlers, a visitor with
  // JS disabled and anyone with reduced motion all see the real number. The count
  // is an enhancement layered on top, never the source of truth.
  const [display, setDisplay] = useState(value);

  useBeforePaint(() => {
    const node = ref.current;
    const figure = parseFigure(value);
    if (!node || !figure) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const format = new Intl.NumberFormat(locale);
    const render = (n: number) => setDisplay(`${figure.prefix}${format.format(n)}${figure.suffix}`);

    render(1);

    let frame = 0;
    // Sentinel rather than 0: a rAF timestamp of 0 is legal, and `startedAt ||= now`
    // would then re-seed the origin on every frame and freeze the count at 1.
    let startedAt = -1;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const step = (now: number) => {
          if (startedAt < 0) startedAt = now;
          const t = Math.min((now - startedAt) / DURATION_MS, 1);
          // easeOutCubic. A fixed duration rather than a fixed step rate is what
          // lets 3.000+ and 5+ land at the same moment instead of one figure
          // finishing while the others are still spinning.
          render(Math.round(1 + (figure.target - 1) * (1 - (1 - t) ** 3)));
          if (t < 1) frame = requestAnimationFrame(step);
          else setDisplay(value);
        };
        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, locale]);

  return <span ref={ref}>{display}</span>;
}
