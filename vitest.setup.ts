import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => cleanup());
afterEach(() => vi.clearAllMocks());

// next/navigation's App Router hooks throw outside an app-router tree
// (e.g. "invariant expected app router to be mounted"). Unit tests render
// client components in isolation, so stub the hooks instead of wiring up a
// full app-router context in every test. Stubs are stable, exported vi.fn()s
// (not fresh closures per call) so tests can import and assert on them, e.g.
// `expect(mockRouterPush).toHaveBeenCalledWith(...)`. Cleared (not reset)
// after each test so the default return values below survive between tests.
const mockNavigation = vi.hoisted(() => ({
  mockRouterPush: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockRouterRefresh: vi.fn(),
  mockRouterBack: vi.fn(),
  mockRouterForward: vi.fn(),
  mockRouterPrefetch: vi.fn(),
  mockUsePathname: vi.fn(() => "/"),
  mockUseParams: vi.fn(() => ({})),
  mockUseSearchParams: vi.fn(() => new URLSearchParams()),
}));

export const {
  mockRouterPush,
  mockRouterReplace,
  mockRouterRefresh,
  mockRouterBack,
  mockRouterForward,
  mockRouterPrefetch,
  mockUsePathname,
  mockUseParams,
  mockUseSearchParams,
} = mockNavigation;

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    useRouter: () => ({
      push: mockRouterPush,
      replace: mockRouterReplace,
      refresh: mockRouterRefresh,
      back: mockRouterBack,
      forward: mockRouterForward,
      prefetch: mockRouterPrefetch,
    }),
    usePathname: mockUsePathname,
    useParams: mockUseParams,
    useSearchParams: mockUseSearchParams,
  };
});

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
