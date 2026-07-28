import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());

// Reports reduced motion ON so animated components render deterministically.
vi.stubGlobal("matchMedia", (query: string) => ({
  matches: true,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
}));

// @ts-expect-error - minimal mock for components using IntersectionObserver
globalThis.IntersectionObserver = class MockIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};
