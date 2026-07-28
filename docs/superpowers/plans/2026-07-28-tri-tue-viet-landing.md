# Trí Tuệ Việt Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `frontend-nextjs-app` scaffold into a bilingual (vi-default / en) marketing landing page for the tutoring centre **Trí Tuệ Việt**, matching the toolchain and architecture of the sibling repo `../landing-page`.

**Architecture:** Single Next.js 16 App Router page under `app/[locale]/(public)/home/`, composed of 12 translation-driven section components. `next-intl` provides the routing backbone; all business facts live in `lib/site.ts` plus the two message catalogs. Docker keeps the existing compose override pattern, wrapped by mise file tasks.

**Tech Stack:** Next.js 16.2.10, React 19.2, TypeScript strict, Tailwind v4, shadcn/ui (new-york), next-intl 4, Zod 4, Vitest 4 + jsdom + Testing Library, Biome 2.5 (format only), ESLint (`eslint-config-next`), pnpm 11.9.0, Docker Compose + mise.

## Global Constraints

These apply to **every** task. Do not restate them per task; do not violate them.

- Package manager is **pnpm 11.9.0**. Never run `npm` or `yarn` on the host.
- **Biome formats, ESLint lints.** Biome's linter stays disabled (`"linter": { "enabled": false }`). Never merge the two.
- Format style: 2-space indent, line width 100, double quotes, semicolons always, trailing commas `all` (but `none` in JSON).
- Path alias `@/*` → repo root. Import as `@/components/...`, `@/lib/...`, `@/enums`.
- **Internal navigation uses `@/i18n/navigation`** (`Link`, `redirect`, `useRouter`), never `next/link` or `next/navigation`.
- `messages/vi.json` and `messages/en.json` must have **identical key structure**. `tests/messages/parity.test.ts` enforces it. Every new key goes into both files in the same task that adds it.
- Default locale is **`vi`**. `localePrefix: "always"`.
- Middleware file is **`proxy.ts`** at repo root (Next 16 renamed `middleware.ts`).
- **Never invent business facts.** Student counts, pass rates, tuition figures, teacher names, addresses, phone numbers and testimonials are written as the literal string `[TODO: <what to fill>]`. Structural copy (headings, button labels, FAQ questions, field labels) is written for real.
- Tests live in `tests/**/*.test.{ts,tsx}` mirroring source structure. Vitest globals are enabled.
- Commits follow Conventional Commits (commitlint enforces). Never add `Co-Authored-By` or attribution lines.
- Work happens on branch `feature/tri-tue-viet-landing`. Never commit to `develop`.
- Section anchors use Vietnamese slugs and are the same in both locales: `#khoa-hoc`, `#hinh-thuc`, `#giao-vien`, `#hoc-phi`, `#dang-ky`.

## File Structure

| Path | Responsibility |
| --- | --- |
| `enums/locale.enum.ts` | The only place locale codes are declared |
| `i18n/routing.ts` / `request.ts` / `navigation.ts` | next-intl routing, per-request catalog, locale-aware nav |
| `proxy.ts` | next-intl middleware |
| `lib/site.ts` | Single source of truth for every business fact and SEO constant |
| `lib/structured-data.ts` | Pure JSON-LD builders (no React) |
| `lib/utils.ts` | `cn()` only |
| `components/ui/*` | shadcn primitives, generated not hand-written |
| `components/section.tsx` | Shared section shell (container, rhythm, heading) |
| `components/site-header.tsx`, `logo.tsx`, `language-switcher.tsx`, `mode-toggle.tsx`, `theme-provider.tsx`, `structured-data.tsx` | Chrome shared across the page |
| `app/[locale]/layout.tsx` | Fonts, theme, `NextIntlClientProvider`, `generateMetadata` |
| `app/[locale]/(public)/home/page.tsx` | Composes the 12 sections, nothing else |
| `app/[locale]/(public)/home/_components/*.tsx` | One file per marketing section |
| `app/actions/consultation.ts` / `.schema.ts` | Server action + Zod schema for the lead form |
| `app/sitemap.ts`, `robots.ts`, `manifest.ts`, `icon.tsx` | Metadata routes |
| `messages/vi.json`, `messages/en.json` | All copy |
| `mise/tasks/{local,prod}/*` | Docker wrappers |

---

### Task 1: Toolchain migration

Replaces the Next 15 / yarn scaffold with the Next 16 / pnpm toolchain. Nothing renders yet — the deliverable is that `pnpm install`, `pnpm format:check`, `pnpm lint` and `pnpm test` all run green.

**Files:**
- Modify: `package.json` (full rewrite)
- Create: `biome.json`, `vitest.config.mts`, `vitest.setup.ts`
- Modify: `eslint.config.mjs`, `tsconfig.json`, `.lintstagedrc.json`
- Delete: `yarn.lock`, `package-lock.json`
- Test: `tests/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: the `pnpm dev|build|start|lint|lint:fix|format|format:check|test|test:watch` script names every later task uses.

- [ ] **Step 1: Write the failing test**

Create `tests/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("toolchain", () => {
  it("runs vitest with globals and the @ alias resolved", async () => {
    const { cn } = await import("@/lib/utils");
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/smoke.test.ts`
Expected: FAIL — vitest is not installed yet (`command not found` / cannot resolve `@/lib/utils`).

- [ ] **Step 3: Rewrite `package.json`**

```json
{
  "name": "tri-tue-viet-landing",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@11.9.0",
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "biome format --write",
    "format:check": "biome format",
    "prepare": "husky",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.11",
    "@radix-ui/react-dropdown-menu": "^2.1.20",
    "@radix-ui/react-slot": "^1.3.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "lucide-react": "^1.23.0",
    "next": "16.2.10",
    "next-intl": "^4.13.1",
    "next-themes": "^0.4.6",
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "tailwind-merge": "^3.6.0",
    "zod": "^4.4.3"
  },
  "devDependencies": {
    "@biomejs/biome": "2.5.2",
    "@commitlint/cli": "^21.2.0",
    "@commitlint/config-conventional": "^21.2.0",
    "@commitlint/types": "^19",
    "@tailwindcss/postcss": "^4.3.2",
    "@testing-library/dom": "^10.4.1",
    "@testing-library/jest-dom": "^6.9.1",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1",
    "@types/node": "^26.1.0",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.3",
    "eslint": "^9.39.4",
    "eslint-config-next": "16.2.10",
    "husky": "^9.1.7",
    "jsdom": "^29.1.1",
    "lint-staged": "^17.0.8",
    "tailwindcss": "^4.3.2",
    "tw-animate-css": "^1.4.0",
    "typescript": "^6.0.3",
    "vitest": "^4.1.10"
  }
}
```

- [ ] **Step 4: Create `biome.json`**

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.2/schema.json",
  "vcs": { "enabled": true, "clientKind": "git", "useIgnoreFile": true },
  "files": {
    "includes": [
      "**/*.ts",
      "**/*.tsx",
      "**/*.js",
      "**/*.jsx",
      "**/*.mjs",
      "**/*.mts",
      "**/*.json",
      "**/*.jsonc",
      "**/*.css"
    ],
    "ignoreUnknown": true
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "double",
      "semicolons": "always",
      "trailingCommas": "all",
      "lineEnding": "lf"
    }
  },
  "json": { "formatter": { "trailingCommas": "none" } },
  "css": { "parser": { "tailwindDirectives": true } },
  "linter": { "enabled": false }
}
```

- [ ] **Step 5: Create `vitest.config.mts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
});
```

- [ ] **Step 6: Create `vitest.setup.ts`**

```ts
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
```

- [ ] **Step 7: Replace `eslint.config.mjs`**

```js
import next from "eslint-config-next";

const eslintConfig = [
  { ignores: [".next/**", "next-env.d.ts", "coverage/**"] },
  ...next,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];

export default eslintConfig;
```

- [ ] **Step 8: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 9: Replace `.lintstagedrc.json`**

```json
{
  "*.{ts,tsx,js,jsx,mjs,mts,json,jsonc,css}": ["biome format --write"],
  "*.{ts,tsx}": ["eslint --fix"]
}
```

- [ ] **Step 10: Create `lib/utils.ts`** (the smoke test needs it)

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 11: Drop the old lockfiles and install**

```bash
rm -f yarn.lock package-lock.json
pnpm install
```

- [ ] **Step 12: Run the test suite**

Run: `pnpm test`
Expected: PASS — 1 test in `tests/smoke.test.ts`.

- [ ] **Step 13: Verify format and lint**

Run: `pnpm format:check && pnpm lint`
Expected: both exit 0. If `format:check` reports diffs, run `pnpm format` and re-check.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "build: migrate toolchain to pnpm, next 16, biome and vitest"
```

---

### Task 2: i18n backbone

Wires next-intl with `vi` as default. No UI yet beyond a bare layout that proves routing works.

**Files:**
- Create: `enums/locale.enum.ts`, `enums/index.ts`, `i18n/routing.ts`, `i18n/request.ts`, `i18n/navigation.ts`, `proxy.ts`, `messages/vi.json`, `messages/en.json`
- Modify: `next.config.ts`
- Test: `tests/i18n/routing.test.ts`, `tests/messages/parity.test.ts`

**Interfaces:**
- Consumes: Task 1's toolchain.
- Produces: `LocaleSupport` enum (`VI = "vi"`, `EN = "en"`); `routing` object with `.locales`, `.defaultLocale`, `.localePrefix`; `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `@/i18n/navigation`; the `metadata` and `nav` message namespaces.

- [ ] **Step 1: Write the failing tests**

Create `tests/i18n/routing.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { routing } from "@/i18n/routing";
import { LocaleSupport } from "@/enums";

describe("routing", () => {
  it("defaults to Vietnamese", () => {
    expect(routing.defaultLocale).toBe(LocaleSupport.VI);
  });

  it("supports exactly vi and en", () => {
    expect([...routing.locales].sort()).toEqual(["en", "vi"]);
  });

  it("always prefixes the locale", () => {
    expect(routing.localePrefix).toBe("always");
  });
});
```

Create `tests/messages/parity.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import en from "@/messages/en.json";
import vi from "@/messages/vi.json";

function keyPaths(obj: unknown, prefix = ""): string[] {
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/i18n tests/messages`
Expected: FAIL — cannot resolve `@/i18n/routing`, `@/enums`, `@/messages/vi.json`.

- [ ] **Step 3: Create the locale enum**

`enums/locale.enum.ts`:

```ts
export enum LocaleSupport {
  VI = "vi",
  EN = "en",
}
```

`enums/index.ts`:

```ts
export * from "./locale.enum";
```

- [ ] **Step 4: Create the i18n modules**

`i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";
import { LocaleSupport } from "@/enums";

export const routing = defineRouting({
  locales: [LocaleSupport.VI, LocaleSupport.EN],
  defaultLocale: LocaleSupport.VI,
  localePrefix: "always",
});
```

`i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
```

`i18n/navigation.ts`:

```ts
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
```

- [ ] **Step 5: Create `proxy.ts`**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/", "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)"],
};
```

- [ ] **Step 6: Wire the plugin in `next.config.ts`**

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Self-contained server bundle for the Docker production image.
  output: "standalone",
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Create the seed message catalogs**

`messages/vi.json`:

```json
{
  "metadata": {
    "title": "Trung tâm Gia sư Trí Tuệ Việt — Kèm 1-1, nhóm nhỏ và online",
    "description": "Trí Tuệ Việt đồng hành cùng học sinh từ lớp 6 đến lớp 12 với lộ trình cá nhân hoá, giáo viên tận tâm và cam kết tiến bộ rõ ràng."
  },
  "nav": {
    "courses": "Khoá học",
    "formats": "Hình thức học",
    "teachers": "Giáo viên",
    "pricing": "Học phí",
    "register": "Đăng ký tư vấn",
    "openMenu": "Mở menu",
    "switchLanguage": "Đổi ngôn ngữ",
    "toggleTheme": "Đổi giao diện sáng/tối"
  }
}
```

`messages/en.json`:

```json
{
  "metadata": {
    "title": "Tri Tue Viet Tutoring Centre — 1-on-1, small group and online",
    "description": "Tri Tue Viet supports students from grade 6 to 12 with personalised learning paths, dedicated teachers and clear progress commitments."
  },
  "nav": {
    "courses": "Courses",
    "formats": "Formats",
    "teachers": "Teachers",
    "pricing": "Tuition",
    "register": "Book a consultation",
    "openMenu": "Open menu",
    "switchLanguage": "Switch language",
    "toggleTheme": "Toggle light/dark theme"
  }
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/i18n tests/messages`
Expected: PASS — 4 tests.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat(i18n): add next-intl routing backbone with vi as default locale"
```

---

### Task 3: Design system foundation

Installs shadcn/ui and the shared `Section` shell. `pnpm dev` should render an unstyled-but-working page after this task, so `app/globals.css` and a temporary root page are part of it.

**Files:**
- Create: `components.json`, `app/globals.css`, `components/ui/{button,card,input,label,textarea,accordion,dropdown-menu}.tsx`, `components/section.tsx`
- Test: `tests/components/section.test.tsx`

**Interfaces:**
- Consumes: `cn()` from `@/lib/utils` (Task 1).
- Produces: `Section` component with props `{ id?: string; className?: string; eyebrow?: string; title?: string; description?: string; children: React.ReactNode }`, rendering a `<section>` with an `<h2>` when `title` is given. shadcn primitives `Button`, `Card`/`CardHeader`/`CardTitle`/`CardContent`, `Input`, `Label`, `Textarea`, `Accordion`/`AccordionItem`/`AccordionTrigger`/`AccordionContent`, `DropdownMenu` family.

  Note: section cards render their own `<h3>` inside `CardHeader` rather than using
  `CardTitle`. `CardTitle` renders a `<div>` and does not accept `asChild`, so wrapping
  a heading in it would break the heading-level assertions in the section tests.

- [ ] **Step 1: Write the failing test**

Create `tests/components/section.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Section } from "@/components/section";

describe("Section", () => {
  it("renders its id so anchor navigation works", () => {
    const { container } = render(
      <Section id="khoa-hoc">
        <p>content</p>
      </Section>,
    );
    expect(container.querySelector("section#khoa-hoc")).not.toBeNull();
  });

  it("renders the title as an h2 and the eyebrow above it", () => {
    render(
      <Section title="Khoá học" eyebrow="Chương trình">
        <p>content</p>
      </Section>,
    );
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Khoá học");
    expect(screen.getByText("Chương trình")).toBeInTheDocument();
  });

  it("omits the heading block when no title is given", () => {
    render(
      <Section>
        <p>content</p>
      </Section>,
    );
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/components/section.test.tsx`
Expected: FAIL — cannot resolve `@/components/section`.

- [ ] **Step 3: Initialise shadcn/ui**

```bash
pnpm dlx shadcn@latest init --base-color slate --css-variables --yes
```

This writes `components.json`, creates `app/globals.css` with the Tailwind v4 import and the shadcn CSS variables (light + dark), and confirms `lib/utils.ts`. Verify `components.json` has `"style": "new-york"` and `"aliases": { "components": "@/components", "utils": "@/lib/utils" }`; edit it to match if the prompt defaulted elsewhere.

- [ ] **Step 4: Add the primitives**

```bash
pnpm dlx shadcn@latest add button card input label textarea accordion dropdown-menu --yes
```

- [ ] **Step 5: Create `components/section.tsx`**

```tsx
import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  eyebrow,
  title,
  description,
  children,
}: {
  id?: string;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("container mx-auto px-4 py-16 md:py-24", className)}>
      {title ? (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          {eyebrow ? (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
          ) : null}
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
          {description ? (
            <p className="mt-4 text-muted-foreground">{description}</p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm exec vitest run tests/components/section.test.tsx`
Expected: PASS — 3 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(ui): add shadcn primitives and shared section shell"
```

---

### Task 4: Site identity and layout

Brand chrome plus the locale layout. After this task `pnpm dev` serves `/vi` with a header, theme toggle and language switcher.

**Files:**
- Create: `lib/site.ts`, `components/theme-provider.tsx`, `components/mode-toggle.tsx`, `components/logo.tsx`, `components/language-switcher.tsx`, `components/site-header.tsx`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`, `app/icon.tsx`
- Delete: `src/` (the old Next 15 scaffold), `app/layout.tsx` and `app/page.tsx` if the scaffold left them
- Test: `tests/components/logo.test.tsx`, `tests/components/site-header.test.tsx`, `tests/components/language-switcher.test.tsx`

**Interfaces:**
- Consumes: `routing` (Task 2), `Section`/`Button`/`DropdownMenu` (Task 3), `nav` and `metadata` namespaces (Task 2).
- Produces:
  - `lib/site.ts` exports `SITE_URL: string`, `SITE_NAME: string`, `SITE_SHORT_NAME: string`, `SITE_PHONE: string`, `SITE_ZALO_URL: string`, `SITE_EMAIL: string`, `SITE_ADDRESS: { street: string; district: string; city: string; country: string }`, `SITE_OPENING_HOURS: string[]`, `SITE_SAME_AS: string[]`, `OG_LOCALE: Record<string, string>`, `SITE_KEYWORDS: Record<string, string[]>`, `localeUrl(locale: string): string`, `languageAlternates(locales: readonly string[]): Record<string, string>`
  - `Logo`, `ModeToggle`, `LanguageSwitcher`, `SiteHeader`, `ThemeProvider` components

- [ ] **Step 1: Write the failing tests**

Create `tests/components/logo.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/logo";

describe("Logo", () => {
  it("renders the wordmark as accessible text", () => {
    render(<Logo />);
    expect(screen.getByText(/Trí Tuệ Việt/)).toBeInTheDocument();
  });

  it("renders an svg mark labelled for screen readers", () => {
    const { container } = render(<Logo />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
```

Create `tests/components/site-header.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { SiteHeader } from "@/components/site-header";

function renderHeader() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <SiteHeader />
    </NextIntlClientProvider>,
  );
}

describe("SiteHeader", () => {
  it("links to every in-page section anchor", () => {
    const { container } = renderHeader();
    for (const anchor of ["#khoa-hoc", "#hinh-thuc", "#giao-vien", "#hoc-phi"]) {
      expect(container.querySelector(`a[href="${anchor}"]`)).not.toBeNull();
    }
  });

  it("exposes a direct phone link so leads are not lost", () => {
    const { container } = renderHeader();
    expect(container.querySelector('a[href^="tel:"]')).not.toBeNull();
  });

  it("shows the registration CTA", () => {
    renderHeader();
    expect(screen.getByText("Đăng ký tư vấn")).toBeInTheDocument();
  });
});
```

Create `tests/components/language-switcher.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { LanguageSwitcher } from "@/components/language-switcher";

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/home",
  useRouter: () => ({ replace: () => {} }),
}));

describe("LanguageSwitcher", () => {
  it("renders a labelled trigger", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <LanguageSwitcher />
      </NextIntlClientProvider>,
    );
    expect(screen.getByLabelText("Đổi ngôn ngữ")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/components`
Expected: FAIL — cannot resolve `@/components/logo`, `@/components/site-header`, `@/components/language-switcher`.

- [ ] **Step 3: Create `lib/site.ts`**

Every value marked `[TODO: ...]` is a deliberate placeholder — do not replace with invented data.

```ts
import { LocaleSupport } from "@/enums";

/**
 * Canonical site URL. Override per environment with NEXT_PUBLIC_SITE_URL
 * (no trailing slash). The default is a placeholder until the real domain
 * is registered.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://tritueviet.example.com"
).replace(/\/$/, "");

export const SITE_NAME = "Trung tâm Gia sư Trí Tuệ Việt";
export const SITE_SHORT_NAME = "Trí Tuệ Việt";

/** Contact details — fill these in before launch. */
export const SITE_PHONE = "[TODO: hotline]";
export const SITE_ZALO_URL = "[TODO: link Zalo OA]";
export const SITE_EMAIL = "[TODO: email trung tâm]";

export const SITE_ADDRESS = {
  street: "[TODO: số nhà, tên đường]",
  district: "[TODO: quận/huyện]",
  city: "[TODO: tỉnh/thành phố]",
  country: "VN",
};

/** schema.org openingHours strings, e.g. "Mo-Fr 08:00-20:00". */
export const SITE_OPENING_HOURS: string[] = ["[TODO: giờ mở cửa]"];

/** Social / canonical profiles surfaced in structured data (sameAs). */
export const SITE_SAME_AS: string[] = [];

/** BCP-47 tags used for Open Graph locale + hreflang. */
export const OG_LOCALE: Record<string, string> = {
  [LocaleSupport.VI]: "vi_VN",
  [LocaleSupport.EN]: "en_US",
};

export const SITE_KEYWORDS: Record<string, string[]> = {
  [LocaleSupport.VI]: [
    "trung tâm gia sư",
    "gia sư tại nhà",
    "học kèm 1 kèm 1",
    "luyện thi vào 10",
    "luyện thi THPT quốc gia",
    "gia sư online",
    "dạy kèm nhóm nhỏ",
    "gia sư Toán Lý Hoá Anh",
  ],
  [LocaleSupport.EN]: [
    "tutoring centre",
    "private tutor",
    "one-on-one tutoring",
    "small group classes",
    "online tutoring",
    "exam preparation",
    "maths tutor",
    "english tutor",
  ],
};

/** Absolute URL for a locale's home page. */
export function localeUrl(locale: string): string {
  return `${SITE_URL}/${locale}`;
}

/** hreflang alternates map (locale -> absolute URL). */
export function languageAlternates(locales: readonly string[]): Record<string, string> {
  return Object.fromEntries(locales.map((l) => [l, localeUrl(l)]));
}
```

- [ ] **Step 4: Create the theme components**

`components/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

`components/mode-toggle.tsx`:

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("nav");

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggleTheme")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 dark:hidden" />
      <Moon className="hidden h-5 w-5 dark:block" />
    </Button>
  );
}
```

- [ ] **Step 5: Create `components/logo.tsx`**

Pure SVG + text lockup — no image asset exists yet.

```tsx
import { cn } from "@/lib/utils";
import { SITE_SHORT_NAME } from "@/lib/site";

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-bold", className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0 text-primary"
        fill="none"
        aria-hidden="true"
      >
        <title>{SITE_SHORT_NAME}</title>
        <path d="M4 8h24v4H18v14h-4V12H4V8Z" fill="currentColor" />
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" />
      </svg>
      <span className="text-lg tracking-tight">{SITE_SHORT_NAME}</span>
    </span>
  );
}
```

- [ ] **Step 6: Create `components/language-switcher.tsx`**

```tsx
"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { LocaleSupport } from "@/enums";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LABELS: Record<string, string> = {
  [LocaleSupport.VI]: "Tiếng Việt",
  [LocaleSupport.EN]: "English",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("switchLanguage")}>
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.values(LocaleSupport).map((l) => (
          <DropdownMenuItem
            key={l}
            disabled={l === locale}
            onSelect={() => router.replace(pathname, { locale: l })}
          >
            {LABELS[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

- [ ] **Step 7: Create `components/site-header.tsx`**

```tsx
import { Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Button } from "@/components/ui/button";
import { SITE_PHONE } from "@/lib/site";

const NAV_ITEMS = [
  { href: "#khoa-hoc", key: "courses" },
  { href: "#hinh-thuc", key: "formats" },
  { href: "#giao-vien", key: "teachers" },
  { href: "#hoc-phi", key: "pricing" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center gap-4 px-4">
        <a href="#top" className="mr-auto">
          <Logo />
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t(item.key)}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ModeToggle />
          <Button asChild variant="ghost" size="icon" aria-label={SITE_PHONE}>
            <a href={`tel:${SITE_PHONE}`}>
              <Phone className="h-5 w-5" />
            </a>
          </Button>
          <Button asChild size="sm" className="ml-1">
            <a href="#dang-ky">{t("register")}</a>
          </Button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 8: Create the locale layout**

`app/[locale]/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Be_Vietnam_Pro } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import {
  OG_LOCALE,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  languageAlternates,
  localeUrl,
} from "@/lib/site";
import "../globals.css";

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const title = t("title");
  const description = t("description");
  const url = localeUrl(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    applicationName: SITE_NAME,
    keywords: SITE_KEYWORDS[locale] ?? SITE_KEYWORDS[routing.defaultLocale],
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: url,
      languages: {
        ...languageAlternates(routing.locales),
        "x-default": localeUrl(routing.defaultLocale),
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${sans.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

`app/[locale]/page.tsx`:

```tsx
import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";

export default async function LocaleIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect({ href: "/home", locale });
}
```

- [ ] **Step 9: Create `app/icon.tsx`**

Generates the favicon from text, so no image asset is needed.

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#1d4ed8",
        color: "#ffffff",
        fontSize: 34,
        fontWeight: 700,
        borderRadius: 12,
      }}
    >
      TTV
    </div>,
    size,
  );
}
```

- [ ] **Step 10: Remove the old scaffold**

```bash
rm -rf src app/layout.tsx app/page.tsx
```

If `app/globals.css` lived under `src/app/`, move it to `app/globals.css` before deleting `src/`.

- [ ] **Step 11: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/components`
Expected: PASS — Section (3) + Logo (2) + SiteHeader (3) + LanguageSwitcher (1).

- [ ] **Step 12: Verify the app boots**

Run: `pnpm build`
Expected: build succeeds; output lists `/[locale]` and `/[locale]/home` is not yet present (added in Task 14). A `Module not found` error here means a step above was skipped.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat(brand): add site constants, logo, header and locale layout"
```

---

### Task 5: SEO metadata routes

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts`
- Test: `tests/seo/metadata-routes.test.ts`

**Interfaces:**
- Consumes: `SITE_URL`, `SITE_NAME`, `SITE_SHORT_NAME`, `localeUrl`, `languageAlternates` (Task 4); `routing` (Task 2).
- Produces: default-exported `sitemap()`, `robots()`, `manifest()` functions.

- [ ] **Step 1: Write the failing test**

Create `tests/seo/metadata-routes.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import { SITE_URL } from "@/lib/site";

describe("sitemap", () => {
  it("lists one absolute entry per locale", () => {
    const entries = sitemap();
    expect(entries.map((e) => e.url).sort()).toEqual([`${SITE_URL}/en`, `${SITE_URL}/vi`]);
  });

  it("gives the default locale top priority", () => {
    const vi = sitemap().find((e) => e.url === `${SITE_URL}/vi`);
    expect(vi?.priority).toBe(1);
  });

  it("declares hreflang alternates including x-default", () => {
    const languages = sitemap()[0]?.alternates?.languages ?? {};
    expect(Object.keys(languages).sort()).toEqual(["en", "vi", "x-default"]);
  });
});

describe("robots", () => {
  it("points at the absolute sitemap URL", () => {
    expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
  });

  it("allows the generic crawler and blocks /api/", () => {
    const generic = (robots().rules as Array<{ userAgent: string; disallow?: string[] }>).find(
      (r) => r.userAgent === "*",
    );
    expect(generic?.disallow).toContain("/api/");
  });

  it("welcomes named AI crawlers", () => {
    const agents = (robots().rules as Array<{ userAgent: string }>).map((r) => r.userAgent);
    expect(agents).toContain("GPTBot");
    expect(agents).toContain("ClaudeBot");
  });
});

describe("manifest", () => {
  it("uses the short brand name and starts at the root", () => {
    expect(manifest().short_name).toBe("Trí Tuệ Việt");
    expect(manifest().start_url).toBe("/");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/seo/metadata-routes.test.ts`
Expected: FAIL — cannot resolve `@/app/sitemap`.

- [ ] **Step 3: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { languageAlternates, localeUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = {
    ...languageAlternates(routing.locales),
    "x-default": localeUrl(routing.defaultLocale),
  };

  return routing.locales.map((locale) => ({
    url: localeUrl(locale),
    changeFrequency: "monthly",
    priority: locale === routing.defaultLocale ? 1 : 0.9,
    alternates: { languages },
  }));
}
```

- [ ] **Step 4: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * AI / answer-engine crawlers explicitly welcomed. Listing them by name makes
 * the allow-intent unambiguous even as generic rules evolve.
 */
const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      ...AI_CRAWLERS.map((userAgent) => ({ userAgent, allow: "/" })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- [ ] **Step 5: Create `app/manifest.ts`**

```ts
import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description:
      "Trung tâm gia sư kèm 1-1, nhóm nhỏ và online cho học sinh THCS và THPT.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1d4ed8",
    icons: [{ src: "/icon", sizes: "64x64", type: "image/png" }],
  };
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm exec vitest run tests/seo/metadata-routes.test.ts`
Expected: PASS — 7 tests.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(seo): add sitemap, robots and manifest routes"
```

---

### Task 6: Structured data

JSON-LD for a physical education business — this is where the schema deliberately differs from `../landing-page`.

**Files:**
- Create: `lib/structured-data.ts`, `components/structured-data.tsx`
- Test: `tests/seo/structured-data.test.ts`

**Interfaces:**
- Consumes: `lib/site.ts` constants (Task 4).
- Produces:
  - `educationalOrganizationSchema({ locale, description }: { locale: string; description: string })`
  - `websiteSchema(locale: string)`
  - `courseListSchema(courses: Array<{ name: string; description: string }>, locale: string)`
  - `faqSchema(items: Array<{ question: string; answer: string }>)`
  - `<StructuredData locale={string} />` React component that renders all four as `<script type="application/ld+json">`

- [ ] **Step 1: Write the failing test**

Create `tests/seo/structured-data.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  courseListSchema,
  educationalOrganizationSchema,
  faqSchema,
  websiteSchema,
} from "@/lib/structured-data";
import { SITE_URL } from "@/lib/site";

describe("educationalOrganizationSchema", () => {
  const schema = educationalOrganizationSchema({ locale: "vi", description: "mô tả" });

  it("is an EducationalOrganization that is also a LocalBusiness", () => {
    expect(schema["@type"]).toEqual(["EducationalOrganization", "LocalBusiness"]);
  });

  it("carries a stable @id other nodes can reference", () => {
    expect(schema["@id"]).toBe(`${SITE_URL}/#organization`);
  });

  it("includes a postal address node", () => {
    expect(schema.address["@type"]).toBe("PostalAddress");
  });
});

describe("websiteSchema", () => {
  it("links back to the organization node as publisher", () => {
    expect(websiteSchema("vi").publisher["@id"]).toBe(`${SITE_URL}/#organization`);
  });
});

describe("courseListSchema", () => {
  const schema = courseListSchema([{ name: "Toán", description: "Đại số và hình học" }], "vi");

  it("wraps courses in an ItemList", () => {
    expect(schema["@type"]).toBe("ItemList");
    expect(schema.itemListElement).toHaveLength(1);
  });

  it("marks each item as a Course provided by the organization", () => {
    const first = schema.itemListElement[0];
    expect(first.item["@type"]).toBe("Course");
    expect(first.item.provider["@id"]).toBe(`${SITE_URL}/#organization`);
  });
});

describe("faqSchema", () => {
  it("maps items to Question/acceptedAnswer pairs", () => {
    const schema = faqSchema([{ question: "Q?", answer: "A." }]);
    expect(schema["@type"]).toBe("FAQPage");
    expect(schema.mainEntity[0].acceptedAnswer.text).toBe("A.");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/seo/structured-data.test.ts`
Expected: FAIL — cannot resolve `@/lib/structured-data`.

- [ ] **Step 3: Create `lib/structured-data.ts`**

```ts
import {
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_NAME,
  SITE_OPENING_HOURS,
  SITE_PHONE,
  SITE_SAME_AS,
  SITE_URL,
  localeUrl,
} from "@/lib/site";

const ORG_ID = `${SITE_URL}/#organization`;

/**
 * Primary entity. Dual-typed because the centre is both a school and a
 * physical business with an address and opening hours — search engines use
 * the LocalBusiness half for map results.
 */
export function educationalOrganizationSchema({
  locale,
  description,
}: {
  locale: string;
  description: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": ["EducationalOrganization", "LocalBusiness"],
    "@id": ORG_ID,
    name: SITE_NAME,
    url: localeUrl(locale),
    description,
    inLanguage: locale,
    email: SITE_EMAIL,
    telephone: SITE_PHONE,
    sameAs: SITE_SAME_AS,
    openingHours: SITE_OPENING_HOURS,
    address: {
      "@type": "PostalAddress",
      streetAddress: SITE_ADDRESS.street,
      addressLocality: SITE_ADDRESS.district,
      addressRegion: SITE_ADDRESS.city,
      addressCountry: SITE_ADDRESS.country,
    },
    areaServed: { "@type": "Country", name: "Vietnam" },
  };
}

export function websiteSchema(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: localeUrl(locale),
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };
}

export function courseListSchema(
  courses: Array<{ name: string; description: string }>,
  locale: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Course",
        name: course.name,
        description: course.description,
        inLanguage: locale,
        provider: { "@id": ORG_ID },
      },
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run tests/seo/structured-data.test.ts`
Expected: PASS — 7 tests.

- [ ] **Step 5: Create `components/structured-data.tsx`**

This reads the `courses` and `faq` namespaces, which Tasks 9 and 12 add. Nothing renders this component until Task 14 composes the page, so the missing namespaces cause no failure in between — but keep the `?? []` guards so a namespace that is later renamed degrades instead of crashing the page.

```tsx
import { getTranslations } from "next-intl/server";
import {
  courseListSchema,
  educationalOrganizationSchema,
  faqSchema,
  websiteSchema,
} from "@/lib/structured-data";

export async function StructuredData({ locale }: { locale: string }) {
  const meta = await getTranslations({ locale, namespace: "metadata" });
  const courses = await getTranslations({ locale, namespace: "courses" });
  const faq = await getTranslations({ locale, namespace: "faq" });

  const courseItems =
    (courses.raw("items") as Array<{ name: string; description: string }> | undefined) ?? [];
  const faqItems =
    (faq.raw("items") as Array<{ question: string; answer: string }> | undefined) ?? [];

  const nodes = [
    educationalOrganizationSchema({ locale, description: meta("description") }),
    websiteSchema(locale),
    courseListSchema(courseItems, locale),
    faqSchema(faqItems),
  ];

  return (
    <>
      {nodes.map((node, i) => (
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw injection
          key={`ld-${i}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
    </>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(seo): add EducationalOrganization and Course structured data"
```

---

### Task 7: Consultation server action

**Files:**
- Create: `app/actions/consultation.schema.ts`, `app/actions/consultation.ts`
- Test: `tests/actions/consultation.test.ts`

**Interfaces:**
- Consumes: nothing beyond Zod.
- Produces:
  - `consultationSchema` (Zod object) and `type ConsultationInput`
  - `submitConsultation(data: ConsultationInput): Promise<{ ok: true } | { ok: false; error: string }>`
  - Fields: `parentName: string`, `phone: string`, `grade: string`, `subject: string`, `format: string`, `note?: string`

- [ ] **Step 1: Write the failing test**

Create `tests/actions/consultation.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { consultationSchema } from "@/app/actions/consultation.schema";
import { submitConsultation } from "@/app/actions/consultation";

const valid = {
  parentName: "Nguyễn Văn A",
  phone: "0912345678",
  grade: "9",
  subject: "toan",
  format: "one-on-one",
  note: "",
};

describe("consultationSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(consultationSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts a +84 phone number", () => {
    expect(consultationSchema.safeParse({ ...valid, phone: "+84912345678" }).success).toBe(true);
  });

  it("rejects a phone number that is not a Vietnamese mobile", () => {
    const result = consultationSchema.safeParse({ ...valid, phone: "12345" });
    expect(result.success).toBe(false);
  });

  it("rejects a landline-style number starting with 02", () => {
    expect(consultationSchema.safeParse({ ...valid, phone: "0212345678" }).success).toBe(false);
  });

  it("rejects a one-character parent name", () => {
    expect(consultationSchema.safeParse({ ...valid, parentName: "A" }).success).toBe(false);
  });
});

describe("submitConsultation", () => {
  beforeEach(() => vi.spyOn(console, "log").mockImplementation(() => {}));
  afterEach(() => vi.restoreAllMocks());

  it("returns ok for a valid submission", async () => {
    await expect(submitConsultation(valid)).resolves.toEqual({ ok: true });
  });

  it("returns the first validation message for an invalid submission", async () => {
    const result = await submitConsultation({ ...valid, phone: "nope" });
    expect(result).toEqual({ ok: false, error: expect.any(String) });
  });

  it("does not log anything when validation fails", async () => {
    await submitConsultation({ ...valid, phone: "nope" });
    expect(console.log).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run tests/actions/consultation.test.ts`
Expected: FAIL — cannot resolve `@/app/actions/consultation.schema`.

- [ ] **Step 3: Create `app/actions/consultation.schema.ts`**

```ts
import { z } from "zod";

/** Vietnamese mobile numbers: 0 or +84 followed by 3|5|7|8|9 and 8 digits. */
const VN_MOBILE = /^(?:\+84|0)(?:3|5|7|8|9)\d{8}$/;

export const consultationSchema = z.object({
  parentName: z.string().trim().min(2, "Vui lòng nhập họ tên phụ huynh"),
  phone: z
    .string()
    .trim()
    .regex(VN_MOBILE, "Số điện thoại không hợp lệ"),
  grade: z.string().min(1, "Vui lòng chọn lớp"),
  subject: z.string().min(1, "Vui lòng chọn môn học"),
  format: z.string().min(1, "Vui lòng chọn hình thức học"),
  note: z.string().max(1000, "Ghi chú quá dài").optional(),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
```

- [ ] **Step 4: Create `app/actions/consultation.ts`**

```ts
"use server";

import { consultationSchema, type ConsultationInput } from "./consultation.schema";

export async function submitConsultation(
  data: ConsultationInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = consultationSchema.safeParse(data);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dữ liệu không hợp lệ" };
  }
  // Deliberately unintegrated — see the design spec. Wire a webhook, Google
  // Sheet or email provider here when the centre picks one.
  console.log("[consultation] submission", parsed.data);
  return { ok: true };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run tests/actions/consultation.test.ts`
Expected: PASS — 8 tests.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(forms): add consultation server action with VN phone validation"
```

---

### Task 8: Hero and Stats sections

**Files:**
- Create: `app/[locale]/(public)/home/_components/hero.tsx`, `.../stats.tsx`
- Modify: `messages/vi.json`, `messages/en.json`
- Test: `tests/sections/hero.test.tsx`, `tests/sections/stats.test.tsx`

**Interfaces:**
- Consumes: `Button` (Task 3), `SITE_PHONE`/`SITE_ZALO_URL` (Task 4).
- Produces: `Hero`, `Stats` named exports; `hero` and `stats` message namespaces.

- [ ] **Step 1: Add the message keys**

Append to `messages/vi.json` (top level, alongside `metadata` and `nav`):

```json
{
  "hero": {
    "eyebrow": "Trung tâm gia sư uy tín",
    "title": "Học đúng lộ trình, tiến bộ thấy rõ từng tháng",
    "subtitle": "Trí Tuệ Việt xây lộ trình riêng cho từng học sinh — kiểm tra đầu vào, xếp lớp phù hợp, báo cáo tiến độ đều đặn cho phụ huynh.",
    "ctaPrimary": "Đăng ký học thử miễn phí",
    "ctaSecondary": "Xem khoá học",
    "callNow": "Gọi ngay",
    "chatZalo": "Nhắn Zalo"
  },
  "stats": {
    "students": { "value": "[TODO: số học viên]", "label": "Học viên đã đồng hành" },
    "years": { "value": "[TODO: số năm]", "label": "Năm kinh nghiệm" },
    "passRate": { "value": "[TODO: tỉ lệ đỗ]", "label": "Tỉ lệ đỗ nguyện vọng 1" },
    "teachers": { "value": "[TODO: số giáo viên]", "label": "Giáo viên cơ hữu" }
  }
}
```

Append the matching English block to `messages/en.json`:

```json
{
  "hero": {
    "eyebrow": "A tutoring centre parents trust",
    "title": "A learning path that fits, with progress you can see",
    "subtitle": "Tri Tue Viet builds an individual plan for every student — entry assessment, the right class, and regular progress reports for parents.",
    "ctaPrimary": "Book a free trial lesson",
    "ctaSecondary": "Browse courses",
    "callNow": "Call now",
    "chatZalo": "Chat on Zalo"
  },
  "stats": {
    "students": { "value": "[TODO: student count]", "label": "Students taught" },
    "years": { "value": "[TODO: years]", "label": "Years of experience" },
    "passRate": { "value": "[TODO: pass rate]", "label": "First-choice admission rate" },
    "teachers": { "value": "[TODO: teacher count]", "label": "In-house teachers" }
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/sections/hero.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Hero } from "@/app/[locale]/(public)/home/_components/hero";

function renderHero() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Hero />
    </NextIntlClientProvider>,
  );
}

describe("Hero", () => {
  it("renders exactly one h1 carrying the headline", () => {
    renderHero();
    const headings = screen.getAllByRole("heading", { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent("Học đúng lộ trình");
  });

  it("points the primary CTA at the registration anchor", () => {
    const { container } = renderHero();
    expect(container.querySelector('a[href="#dang-ky"]')).not.toBeNull();
  });

  it("offers a direct phone and Zalo route as a form fallback", () => {
    const { container } = renderHero();
    expect(container.querySelector('a[href^="tel:"]')).not.toBeNull();
    expect(screen.getByText("Nhắn Zalo")).toBeInTheDocument();
  });

  it("has the top anchor the header logo links to", () => {
    const { container } = renderHero();
    expect(container.querySelector("#top")).not.toBeNull();
  });
});
```

Create `tests/sections/stats.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Stats } from "@/app/[locale]/(public)/home/_components/stats";

describe("Stats", () => {
  it("renders all four trust figures", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Stats />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Học viên đã đồng hành")).toBeInTheDocument();
    expect(screen.getByText("Năm kinh nghiệm")).toBeInTheDocument();
    expect(screen.getByText("Tỉ lệ đỗ nguyện vọng 1")).toBeInTheDocument();
    expect(screen.getByText("Giáo viên cơ hữu")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/sections`
Expected: FAIL — cannot resolve the two section modules.

- [ ] **Step 4: Create `hero.tsx`**

```tsx
import { MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { SITE_PHONE, SITE_ZALO_URL } from "@/lib/site";

export function Hero() {
  const t = useTranslations("hero");

  return (
    <div id="top" className="relative overflow-hidden border-b bg-muted/30">
      <div className="container relative z-10 mx-auto px-4 py-20 text-center md:py-28">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          {t("title")}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">{t("subtitle")}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <a href="#dang-ky">{t("ctaPrimary")}</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#khoa-hoc">{t("ctaSecondary")}</a>
          </Button>
        </div>
        <div className="mt-6 flex flex-col items-center justify-center gap-4 text-sm sm:flex-row">
          <a href={`tel:${SITE_PHONE}`} className="inline-flex items-center gap-2 hover:underline">
            <Phone className="h-4 w-4" />
            {t("callNow")}
          </a>
          <a
            href={SITE_ZALO_URL}
            className="inline-flex items-center gap-2 hover:underline"
            rel="noreferrer"
          >
            <MessageCircle className="h-4 w-4" />
            {t("chatZalo")}
          </a>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `stats.tsx`**

```tsx
import { useTranslations } from "next-intl";

const KEYS = ["students", "years", "passRate", "teachers"] as const;

export function Stats() {
  const t = useTranslations("stats");

  return (
    <div className="border-b bg-background">
      <div className="container mx-auto grid grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        {KEYS.map((key) => (
          <div key={key} className="text-center">
            <p className="text-3xl font-bold tracking-tight text-primary md:text-4xl">
              {t(`${key}.value`)}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{t(`${key}.label`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/sections tests/messages`
Expected: PASS — 5 section tests plus the parity test.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): add hero and trust stats sections"
```

---

### Task 9: Courses and Formats sections

**Files:**
- Create: `.../courses.tsx`, `.../formats.tsx`
- Modify: `messages/vi.json`, `messages/en.json`
- Test: `tests/sections/courses.test.tsx`, `tests/sections/formats.test.tsx`

**Interfaces:**
- Consumes: `Section` (Task 3), `Card` family (Task 3).
- Produces: `Courses`, `Formats` named exports. The `courses.items` array shape `{ name: string; description: string; grades: string }` is also consumed by `courseListSchema` via `StructuredData` (Task 6) — it reads `name` and `description`.

- [ ] **Step 1: Add the message keys**

Append to `messages/vi.json`:

```json
{
  "courses": {
    "eyebrow": "Chương trình",
    "title": "Khoá học theo môn và cấp lớp",
    "description": "Mỗi môn có lộ trình riêng cho từng khối, bám sát chương trình của Bộ và đề thi thực tế.",
    "gradesLabel": "Cấp lớp",
    "items": [
      {
        "name": "Toán",
        "description": "Đại số, hình học và ôn luyện dạng bài trọng tâm theo từng khối.",
        "grades": "Lớp 6 – 12"
      },
      {
        "name": "Ngữ văn",
        "description": "Đọc hiểu, nghị luận xã hội và nghị luận văn học theo cấu trúc đề mới.",
        "grades": "Lớp 6 – 12"
      },
      {
        "name": "Tiếng Anh",
        "description": "Ngữ pháp nền tảng, từ vựng theo chủ đề và kỹ năng làm bài thi.",
        "grades": "Lớp 6 – 12"
      },
      {
        "name": "Vật lý",
        "description": "Hệ thống công thức, bài tập vận dụng và thí nghiệm minh hoạ.",
        "grades": "Lớp 8 – 12"
      },
      {
        "name": "Hoá học",
        "description": "Phương trình, chuỗi phản ứng và bài toán hoá học có lời giải chi tiết.",
        "grades": "Lớp 8 – 12"
      },
      {
        "name": "Luyện thi chuyển cấp",
        "description": "Lộ trình tăng tốc cho kỳ thi vào lớp 10 và kỳ thi tốt nghiệp THPT.",
        "grades": "Lớp 9 và lớp 12"
      }
    ]
  },
  "formats": {
    "eyebrow": "Hình thức học",
    "title": "Chọn cách học phù hợp với con",
    "description": "Bốn hình thức, cùng một chất lượng giáo viên và cùng một hệ thống báo cáo tiến độ.",
    "items": [
      {
        "name": "Kèm 1 – 1",
        "description": "Giáo viên tập trung hoàn toàn vào một học sinh, điều chỉnh tốc độ theo từng buổi."
      },
      {
        "name": "Nhóm nhỏ 3 – 6 bạn",
        "description": "Chi phí hợp lý hơn, vẫn đủ sát sao và có thêm động lực từ bạn cùng nhóm."
      },
      {
        "name": "Học online",
        "description": "Lớp trực tuyến có ghi hình lại, phù hợp khi con ở xa hoặc lịch bận."
      },
      {
        "name": "Gia sư tại nhà",
        "description": "Giáo viên tới tận nhà theo lịch phụ huynh sắp xếp."
      }
    ]
  }
}
```

Append to `messages/en.json`:

```json
{
  "courses": {
    "eyebrow": "Programmes",
    "title": "Courses by subject and grade",
    "description": "Each subject has its own path per grade, aligned with the national curriculum and real exam papers.",
    "gradesLabel": "Grades",
    "items": [
      {
        "name": "Mathematics",
        "description": "Algebra, geometry and focused drilling on the question types that matter per grade.",
        "grades": "Grades 6 – 12"
      },
      {
        "name": "Literature",
        "description": "Reading comprehension, social and literary essays following the current exam format.",
        "grades": "Grades 6 – 12"
      },
      {
        "name": "English",
        "description": "Grammar foundations, topic vocabulary and exam technique.",
        "grades": "Grades 6 – 12"
      },
      {
        "name": "Physics",
        "description": "Formula systems, applied problems and demonstrative experiments.",
        "grades": "Grades 8 – 12"
      },
      {
        "name": "Chemistry",
        "description": "Equations, reaction chains and fully worked chemistry problems.",
        "grades": "Grades 8 – 12"
      },
      {
        "name": "Transition exam prep",
        "description": "Accelerated paths for the grade 10 entrance exam and the high school graduation exam.",
        "grades": "Grades 9 and 12"
      }
    ]
  },
  "formats": {
    "eyebrow": "Learning formats",
    "title": "Pick the format that suits your child",
    "description": "Four formats, the same teacher quality and the same progress reporting.",
    "items": [
      {
        "name": "One-on-one",
        "description": "The teacher focuses entirely on one student and adjusts pace lesson by lesson."
      },
      {
        "name": "Small group of 3 – 6",
        "description": "More affordable, still closely supervised, with peer motivation added."
      },
      {
        "name": "Online classes",
        "description": "Live lessons with recordings, suited to distance or a busy schedule."
      },
      {
        "name": "Home tutoring",
        "description": "The teacher comes to your home on a schedule you set."
      }
    ]
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/sections/courses.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Courses } from "@/app/[locale]/(public)/home/_components/courses";

function renderCourses() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Courses />
    </NextIntlClientProvider>,
  );
}

describe("Courses", () => {
  it("renders one card per catalogue entry", () => {
    renderCourses();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.courses.items.length);
  });

  it("shows each subject name and its grade range", () => {
    renderCourses();
    expect(screen.getByText("Toán")).toBeInTheDocument();
    expect(screen.getByText("Luyện thi chuyển cấp")).toBeInTheDocument();
    expect(screen.getByText("Lớp 9 và lớp 12")).toBeInTheDocument();
  });

  it("carries the anchor the header links to", () => {
    const { container } = renderCourses();
    expect(container.querySelector("section#khoa-hoc")).not.toBeNull();
  });
});
```

Create `tests/sections/formats.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Formats } from "@/app/[locale]/(public)/home/_components/formats";

describe("Formats", () => {
  it("renders all four learning formats under the #hinh-thuc anchor", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Formats />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("section#hinh-thuc")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
    expect(screen.getByText("Kèm 1 – 1")).toBeInTheDocument();
    expect(screen.getByText("Gia sư tại nhà")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/sections/courses.test.tsx tests/sections/formats.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 4: Create `courses.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type CourseItem = { name: string; description: string; grades: string };

export function Courses() {
  const t = useTranslations("courses");
  const items = t.raw("items") as CourseItem[];

  return (
    <Section
      id="khoa-hoc"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.name} className="h-full">
            <CardHeader>
              <h3 className="text-lg font-semibold leading-none">{item.name}</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <p className="text-xs font-medium uppercase tracking-wide text-primary">
                {item.grades}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Create `formats.tsx`**

```tsx
import { Home, Monitor, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type FormatItem = { name: string; description: string };

const ICONS = [User, Users, Monitor, Home];

export function Formats() {
  const t = useTranslations("formats");
  const items = t.raw("items") as FormatItem[];

  return (
    <Section
      id="hinh-thuc"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      className="bg-muted/30"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = ICONS[index] ?? User;
          return (
            <Card key={item.name} className="h-full">
              <CardHeader>
                <Icon className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="text-lg font-semibold leading-none">{item.name}</h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/sections tests/messages`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): add courses and learning formats sections"
```

---

### Task 10: Process and Teachers sections

**Files:**
- Create: `.../process.tsx`, `.../teachers.tsx`
- Modify: `messages/vi.json`, `messages/en.json`
- Test: `tests/sections/process.test.tsx`, `tests/sections/teachers.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Card` family.
- Produces: `Process`, `Teachers` named exports.

- [ ] **Step 1: Add the message keys**

Append to `messages/vi.json`:

```json
{
  "process": {
    "eyebrow": "Quy trình",
    "title": "Bốn bước để con bắt đầu học",
    "description": "Không mất phí cho tới khi phụ huynh hài lòng với buổi học thử.",
    "steps": [
      {
        "title": "Tư vấn miễn phí",
        "description": "Phụ huynh để lại thông tin, chúng tôi gọi lại trong vòng 24 giờ để nghe về mục tiêu của con."
      },
      {
        "title": "Kiểm tra đầu vào",
        "description": "Bài test ngắn xác định đúng lỗ hổng kiến thức, không xếp lớp theo cảm tính."
      },
      {
        "title": "Xếp lớp và chọn giáo viên",
        "description": "Ghép con với giáo viên và hình thức học phù hợp nhất với kết quả kiểm tra."
      },
      {
        "title": "Học thử và theo dõi",
        "description": "Buổi học thử miễn phí, sau đó là báo cáo tiến độ định kỳ gửi phụ huynh."
      }
    ]
  },
  "teachers": {
    "eyebrow": "Đội ngũ",
    "title": "Giáo viên đồng hành cùng con",
    "description": "Mỗi giáo viên đều qua vòng phỏng vấn chuyên môn và dạy thử trước khi đứng lớp.",
    "items": [
      {
        "name": "[TODO: tên giáo viên 1]",
        "subject": "[TODO: môn phụ trách]",
        "credential": "[TODO: bằng cấp, số năm kinh nghiệm]"
      },
      {
        "name": "[TODO: tên giáo viên 2]",
        "subject": "[TODO: môn phụ trách]",
        "credential": "[TODO: bằng cấp, số năm kinh nghiệm]"
      },
      {
        "name": "[TODO: tên giáo viên 3]",
        "subject": "[TODO: môn phụ trách]",
        "credential": "[TODO: bằng cấp, số năm kinh nghiệm]"
      },
      {
        "name": "[TODO: tên giáo viên 4]",
        "subject": "[TODO: môn phụ trách]",
        "credential": "[TODO: bằng cấp, số năm kinh nghiệm]"
      }
    ]
  }
}
```

Append to `messages/en.json`:

```json
{
  "process": {
    "eyebrow": "How it works",
    "title": "Four steps to your child's first lesson",
    "description": "Nothing is charged until you are happy with the trial lesson.",
    "steps": [
      {
        "title": "Free consultation",
        "description": "Leave your details and we call back within 24 hours to hear about your child's goals."
      },
      {
        "title": "Entry assessment",
        "description": "A short test pinpoints the actual knowledge gaps — no placement by guesswork."
      },
      {
        "title": "Class and teacher matching",
        "description": "We match your child to the teacher and format that fit the assessment result."
      },
      {
        "title": "Trial lesson and tracking",
        "description": "A free trial lesson, then regular progress reports sent to parents."
      }
    ]
  },
  "teachers": {
    "eyebrow": "Our team",
    "title": "The teachers your child will work with",
    "description": "Every teacher passes a subject interview and a trial lesson before taking a class.",
    "items": [
      {
        "name": "[TODO: teacher 1 name]",
        "subject": "[TODO: subject]",
        "credential": "[TODO: qualification, years of experience]"
      },
      {
        "name": "[TODO: teacher 2 name]",
        "subject": "[TODO: subject]",
        "credential": "[TODO: qualification, years of experience]"
      },
      {
        "name": "[TODO: teacher 3 name]",
        "subject": "[TODO: subject]",
        "credential": "[TODO: qualification, years of experience]"
      },
      {
        "name": "[TODO: teacher 4 name]",
        "subject": "[TODO: subject]",
        "credential": "[TODO: qualification, years of experience]"
      }
    ]
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/sections/process.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Process } from "@/app/[locale]/(public)/home/_components/process";

describe("Process", () => {
  it("renders the four steps in order with visible numbering", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Process />
      </NextIntlClientProvider>,
    );
    const headings = screen.getAllByRole("heading", { level: 3 });
    expect(headings).toHaveLength(4);
    expect(headings[0]).toHaveTextContent("Tư vấn miễn phí");
    expect(headings[3]).toHaveTextContent("Học thử và theo dõi");
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
  });
});
```

Create `tests/sections/teachers.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Teachers } from "@/app/[locale]/(public)/home/_components/teachers";

describe("Teachers", () => {
  it("renders one card per teacher under the #giao-vien anchor", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Teachers />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("section#giao-vien")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.teachers.items.length);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/sections/process.test.tsx tests/sections/teachers.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 4: Create `process.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";

type Step = { title: string; description: string };

export function Process() {
  const t = useTranslations("process");
  const steps = t.raw("steps") as Step[];

  return (
    <Section
      id="quy-trinh"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title} className="relative border-t-2 border-primary/30 pt-6">
            <span className="text-sm font-bold tracking-widest text-primary">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
```

- [ ] **Step 5: Create `teachers.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Teacher = { name: string; subject: string; credential: string };

export function Teachers() {
  const t = useTranslations("teachers");
  const items = t.raw("items") as Teacher[];

  return (
    <Section
      id="giao-vien"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      className="bg-muted/30"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((teacher, index) => (
          <Card key={`teacher-${index}`} className="h-full text-center">
            <CardHeader>
              <div
                className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary"
                aria-hidden="true"
              >
                {index + 1}
              </div>
              <h3 className="text-lg font-semibold leading-none">{teacher.name}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium text-primary">{teacher.subject}</p>
              <p className="mt-2 text-sm text-muted-foreground">{teacher.credential}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/sections tests/messages`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): add enrolment process and teachers sections"
```

---

### Task 11: Achievements and Pricing sections

**Files:**
- Create: `.../achievements.tsx`, `.../pricing.tsx`
- Modify: `messages/vi.json`, `messages/en.json`
- Test: `tests/sections/achievements.test.tsx`, `tests/sections/pricing.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Card` family, `Button`.
- Produces: `Achievements`, `Pricing` named exports.

- [ ] **Step 1: Add the message keys**

Append to `messages/vi.json`:

```json
{
  "achievements": {
    "eyebrow": "Kết quả",
    "title": "Thành tích học viên",
    "description": "Những con số dưới đây sẽ được cập nhật theo từng năm học.",
    "items": [
      {
        "title": "[TODO: thành tích 1]",
        "detail": "[TODO: mô tả kết quả, năm học]"
      },
      {
        "title": "[TODO: thành tích 2]",
        "detail": "[TODO: mô tả kết quả, năm học]"
      },
      {
        "title": "[TODO: thành tích 3]",
        "detail": "[TODO: mô tả kết quả, năm học]"
      }
    ]
  },
  "pricing": {
    "eyebrow": "Học phí",
    "title": "Học phí minh bạch, không phát sinh",
    "description": "Học phí tính theo buổi và theo hình thức học. Buổi học thử đầu tiên miễn phí.",
    "perSession": "mỗi buổi",
    "cta": "Nhận báo giá chi tiết",
    "note": "Học phí có thể thay đổi theo cấp lớp và số buổi đăng ký. Liên hệ để nhận báo giá chính xác.",
    "plans": [
      {
        "name": "Kèm 1 – 1",
        "price": "[TODO: học phí 1 kèm 1]",
        "features": [
          "Giáo viên riêng theo môn",
          "Lộ trình cá nhân hoá",
          "Báo cáo tiến độ hàng tuần"
        ]
      },
      {
        "name": "Nhóm nhỏ 3 – 6 bạn",
        "price": "[TODO: học phí nhóm nhỏ]",
        "features": [
          "Sĩ số tối đa 6 học sinh",
          "Chữa bài chi tiết từng buổi",
          "Báo cáo tiến độ hàng tháng"
        ]
      },
      {
        "name": "Học online",
        "price": "[TODO: học phí online]",
        "features": ["Lớp trực tuyến có ghi hình", "Tài liệu số đi kèm", "Linh hoạt lịch học"]
      }
    ]
  }
}
```

Append to `messages/en.json`:

```json
{
  "achievements": {
    "eyebrow": "Results",
    "title": "Student achievements",
    "description": "These figures are updated each academic year.",
    "items": [
      { "title": "[TODO: achievement 1]", "detail": "[TODO: result description, school year]" },
      { "title": "[TODO: achievement 2]", "detail": "[TODO: result description, school year]" },
      { "title": "[TODO: achievement 3]", "detail": "[TODO: result description, school year]" }
    ]
  },
  "pricing": {
    "eyebrow": "Tuition",
    "title": "Transparent tuition, no hidden extras",
    "description": "Tuition is charged per session and per format. The first trial lesson is free.",
    "perSession": "per session",
    "cta": "Request a detailed quote",
    "note": "Tuition varies by grade and by the number of sessions booked. Contact us for an exact quote.",
    "plans": [
      {
        "name": "One-on-one",
        "price": "[TODO: one-on-one tuition]",
        "features": ["A dedicated subject teacher", "Personalised path", "Weekly progress report"]
      },
      {
        "name": "Small group of 3 – 6",
        "price": "[TODO: small group tuition]",
        "features": ["Maximum 6 students", "Detailed per-session review", "Monthly progress report"]
      },
      {
        "name": "Online classes",
        "price": "[TODO: online tuition]",
        "features": ["Recorded live lessons", "Digital materials included", "Flexible scheduling"]
      }
    ]
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/sections/achievements.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Achievements } from "@/app/[locale]/(public)/home/_components/achievements";

describe("Achievements", () => {
  it("renders one entry per achievement", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Achievements />
      </NextIntlClientProvider>,
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.achievements.items.length);
  });

  it("still shows unfilled placeholders rather than hiding them", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Achievements />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("[TODO: thành tích 1]")).toBeInTheDocument();
  });
});
```

Create `tests/sections/pricing.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Pricing } from "@/app/[locale]/(public)/home/_components/pricing";

function renderPricing() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Pricing />
    </NextIntlClientProvider>,
  );
}

describe("Pricing", () => {
  it("renders one plan per format under the #hoc-phi anchor", () => {
    const { container } = renderPricing();
    expect(container.querySelector("section#hoc-phi")).not.toBeNull();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(vi.pricing.plans.length);
  });

  it("lists every feature of a plan", () => {
    renderPricing();
    expect(screen.getByText("Giáo viên riêng theo môn")).toBeInTheDocument();
    expect(screen.getByText("Sĩ số tối đa 6 học sinh")).toBeInTheDocument();
  });

  it("routes every plan CTA to the registration form", () => {
    const { container } = renderPricing();
    expect(container.querySelectorAll('a[href="#dang-ky"]')).toHaveLength(vi.pricing.plans.length);
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/sections/achievements.test.tsx tests/sections/pricing.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 4: Create `achievements.tsx`**

```tsx
import { Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Achievement = { title: string; detail: string };

export function Achievements() {
  const t = useTranslations("achievements");
  const items = t.raw("items") as Achievement[];

  return (
    <Section
      id="thanh-tich"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Card key={`achievement-${index}`} className="h-full">
            <CardHeader>
              <Trophy className="mb-2 h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="text-lg font-semibold leading-none">{item.title}</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Create `pricing.tsx`**

```tsx
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type Plan = { name: string; price: string; features: string[] };

export function Pricing() {
  const t = useTranslations("pricing");
  const plans = t.raw("plans") as Plan[];

  return (
    <Section
      id="hoc-phi"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
      className="bg-muted/30"
    >
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="flex h-full flex-col">
            <CardHeader>
              <h3 className="text-lg font-semibold leading-none">{plan.name}</h3>
              <p className="mt-2">
                <span className="text-2xl font-bold">{plan.price}</span>{" "}
                <span className="text-sm text-muted-foreground">{t("perSession")}</span>
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <ul className="mb-6 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="mt-auto w-full">
                <a href="#dang-ky">{t("cta")}</a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">{t("note")}</p>
    </Section>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/sections tests/messages`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): add achievements and tuition sections"
```

---

### Task 12: Testimonials and FAQ sections

**Files:**
- Create: `.../testimonials.tsx`, `.../faq.tsx`
- Modify: `messages/vi.json`, `messages/en.json`
- Test: `tests/sections/testimonials.test.tsx`, `tests/sections/faq.test.tsx`

**Interfaces:**
- Consumes: `Section`, `Card` family, `Accordion` family.
- Produces: `Testimonials`, `Faq` named exports. The `faq.items` array shape `{ question: string; answer: string }` is consumed by `faqSchema` via `StructuredData` (Task 6).

- [ ] **Step 1: Add the message keys**

Append to `messages/vi.json`:

```json
{
  "testimonials": {
    "eyebrow": "Phụ huynh nói gì",
    "title": "Cảm nhận từ phụ huynh và học viên",
    "items": [
      {
        "quote": "[TODO: trích cảm nhận phụ huynh 1]",
        "author": "[TODO: tên phụ huynh 1]",
        "role": "[TODO: phụ huynh em ..., lớp ...]"
      },
      {
        "quote": "[TODO: trích cảm nhận phụ huynh 2]",
        "author": "[TODO: tên phụ huynh 2]",
        "role": "[TODO: phụ huynh em ..., lớp ...]"
      },
      {
        "quote": "[TODO: trích cảm nhận học viên]",
        "author": "[TODO: tên học viên]",
        "role": "[TODO: học viên lớp ...]"
      }
    ]
  },
  "faq": {
    "eyebrow": "Giải đáp",
    "title": "Câu hỏi thường gặp",
    "items": [
      {
        "question": "Buổi học thử có mất phí không?",
        "answer": "Không. Buổi học thử đầu tiên hoàn toàn miễn phí, phụ huynh chỉ đóng học phí khi quyết định cho con theo học."
      },
      {
        "question": "Con học yếu có theo kịp lớp nhóm không?",
        "answer": "Bài kiểm tra đầu vào giúp chúng tôi xếp con vào nhóm đúng trình độ. Nếu khoảng cách còn lớn, chúng tôi sẽ đề xuất kèm 1 kèm 1 trong giai đoạn đầu."
      },
      {
        "question": "Trung tâm báo cáo tiến độ như thế nào?",
        "answer": "Phụ huynh nhận báo cáo định kỳ gồm mức độ hoàn thành bài tập, điểm kiểm tra và nhận xét của giáo viên phụ trách."
      },
      {
        "question": "Có thể đổi giáo viên nếu con chưa hợp không?",
        "answer": "Có. Phụ huynh báo với trung tâm và chúng tôi sắp xếp giáo viên khác, không phát sinh chi phí."
      },
      {
        "question": "Lớp online học trên nền tảng nào?",
        "answer": "Lớp trực tuyến diễn ra theo thời gian thực và được ghi hình lại để con xem lại trong tuần."
      },
      {
        "question": "Học phí đóng theo tháng hay theo khoá?",
        "answer": "Phụ huynh có thể đóng theo tháng hoặc theo khoá. Đóng theo khoá thường có mức ưu đãi tốt hơn."
      }
    ]
  }
}
```

Append to `messages/en.json`:

```json
{
  "testimonials": {
    "eyebrow": "What parents say",
    "title": "Feedback from parents and students",
    "items": [
      {
        "quote": "[TODO: parent testimonial 1]",
        "author": "[TODO: parent 1 name]",
        "role": "[TODO: parent of ..., grade ...]"
      },
      {
        "quote": "[TODO: parent testimonial 2]",
        "author": "[TODO: parent 2 name]",
        "role": "[TODO: parent of ..., grade ...]"
      },
      {
        "quote": "[TODO: student testimonial]",
        "author": "[TODO: student name]",
        "role": "[TODO: grade ... student]"
      }
    ]
  },
  "faq": {
    "eyebrow": "Answers",
    "title": "Frequently asked questions",
    "items": [
      {
        "question": "Is the trial lesson charged?",
        "answer": "No. The first trial lesson is free; you only pay once you decide to enrol."
      },
      {
        "question": "Can a struggling student keep up in a group class?",
        "answer": "The entry assessment places your child at the right level. If the gap is still large we recommend one-on-one lessons for the first stage."
      },
      {
        "question": "How is progress reported?",
        "answer": "Parents receive regular reports covering homework completion, test scores and the teacher's comments."
      },
      {
        "question": "Can we change teacher if it is not a good fit?",
        "answer": "Yes. Tell us and we will arrange a different teacher at no extra cost."
      },
      {
        "question": "Which platform do online classes use?",
        "answer": "Online classes run live and are recorded so your child can review them during the week."
      },
      {
        "question": "Is tuition paid monthly or per course?",
        "answer": "Either. Paying per course usually comes with a better rate."
      }
    ]
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/sections/testimonials.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Testimonials } from "@/app/[locale]/(public)/home/_components/testimonials";

describe("Testimonials", () => {
  it("renders each quote inside a blockquote with its attribution", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={vi}>
        <Testimonials />
      </NextIntlClientProvider>,
    );
    expect(container.querySelectorAll("blockquote")).toHaveLength(vi.testimonials.items.length);
    expect(screen.getByText("[TODO: tên phụ huynh 1]")).toBeInTheDocument();
  });
});
```

Create `tests/sections/faq.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { Faq } from "@/app/[locale]/(public)/home/_components/faq";

function renderFaq() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <Faq />
    </NextIntlClientProvider>,
  );
}

describe("Faq", () => {
  it("renders one trigger per question", () => {
    renderFaq();
    expect(screen.getAllByRole("button")).toHaveLength(vi.faq.items.length);
  });

  it("reveals the answer when a question is opened", async () => {
    const user = userEvent.setup();
    renderFaq();
    await user.click(screen.getByText("Buổi học thử có mất phí không?"));
    expect(await screen.findByText(/hoàn toàn miễn phí/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/sections/testimonials.test.tsx tests/sections/faq.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 4: Create `testimonials.tsx`**

```tsx
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = { quote: string; author: string; role: string };

export function Testimonials() {
  const t = useTranslations("testimonials");
  const items = t.raw("items") as Testimonial[];

  return (
    <Section id="cam-nhan" eyebrow={t("eyebrow")} title={t("title")}>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item, index) => (
          <Card key={`testimonial-${index}`} className="h-full">
            <CardContent className="pt-6">
              <Quote className="mb-4 h-6 w-6 text-primary" aria-hidden="true" />
              <blockquote className="text-sm leading-relaxed">{item.quote}</blockquote>
              <footer className="mt-4">
                <p className="text-sm font-semibold">{item.author}</p>
                <p className="text-xs text-muted-foreground">{item.role}</p>
              </footer>
            </CardContent>
          </Card>
        ))}
      </div>
    </Section>
  );
}
```

- [ ] **Step 5: Create `faq.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type FaqItem = { question: string; answer: string };

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as FaqItem[];

  return (
    <Section id="cau-hoi" eyebrow={t("eyebrow")} title={t("title")} className="bg-muted/30">
      <Accordion type="single" collapsible className="mx-auto max-w-3xl">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`item-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/sections tests/messages`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): add parent testimonials and FAQ sections"
```

---

### Task 13: Consultation form and contact section

**Files:**
- Create: `.../consultation-form.tsx`, `.../contact.tsx`
- Modify: `messages/vi.json`, `messages/en.json`
- Test: `tests/sections/consultation-form.test.tsx`, `tests/sections/contact.test.tsx`

**Interfaces:**
- Consumes: `submitConsultation` and `ConsultationInput` (Task 7), `Input`/`Label`/`Textarea`/`Button` (Task 3), `Section` (Task 3), `SITE_PHONE`/`SITE_ZALO_URL`/`SITE_EMAIL`/`SITE_ADDRESS` (Task 4).
- Produces: `ConsultationForm` (client component), `Contact` named exports.

- [ ] **Step 1: Add the message keys**

Append to `messages/vi.json`:

```json
{
  "contact": {
    "eyebrow": "Đăng ký",
    "title": "Đăng ký tư vấn và học thử miễn phí",
    "description": "Để lại thông tin, chúng tôi gọi lại trong vòng 24 giờ làm việc.",
    "phoneLabel": "Hotline",
    "zaloLabel": "Zalo",
    "emailLabel": "Email",
    "addressLabel": "Địa chỉ",
    "form": {
      "parentName": "Họ tên phụ huynh",
      "phone": "Số điện thoại",
      "grade": "Lớp",
      "gradePlaceholder": "Ví dụ: lớp 9",
      "subject": "Môn quan tâm",
      "subjectPlaceholder": "Ví dụ: Toán",
      "format": "Hình thức học",
      "formatPlaceholder": "Ví dụ: kèm 1 kèm 1",
      "note": "Ghi chú",
      "notePlaceholder": "Mục tiêu của con, lịch rảnh, yêu cầu khác…",
      "submit": "Gửi đăng ký",
      "submitting": "Đang gửi…",
      "success": "Đã nhận thông tin. Trung tâm sẽ liên hệ lại trong vòng 24 giờ làm việc.",
      "error": "Gửi chưa thành công. Vui lòng kiểm tra lại thông tin."
    }
  }
}
```

Append to `messages/en.json`:

```json
{
  "contact": {
    "eyebrow": "Register",
    "title": "Book a free consultation and trial lesson",
    "description": "Leave your details and we will call back within 24 working hours.",
    "phoneLabel": "Hotline",
    "zaloLabel": "Zalo",
    "emailLabel": "Email",
    "addressLabel": "Address",
    "form": {
      "parentName": "Parent's full name",
      "phone": "Phone number",
      "grade": "Grade",
      "gradePlaceholder": "e.g. grade 9",
      "subject": "Subject of interest",
      "subjectPlaceholder": "e.g. Mathematics",
      "format": "Learning format",
      "formatPlaceholder": "e.g. one-on-one",
      "note": "Notes",
      "notePlaceholder": "Your child's goals, available times, anything else…",
      "submit": "Send registration",
      "submitting": "Sending…",
      "success": "We have your details and will be in touch within 24 working hours.",
      "error": "Could not send. Please check the details and try again."
    }
  }
}
```

- [ ] **Step 2: Write the failing tests**

Create `tests/sections/consultation-form.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { ConsultationForm } from "@/app/[locale]/(public)/home/_components/consultation-form";

const submitConsultation = vi.hoisted(() => vi.fn());
vi.mock("@/app/actions/consultation", () => ({ submitConsultation }));

function renderForm() {
  return render(
    <NextIntlClientProvider locale="vi" messages={viMessages}>
      <ConsultationForm />
    </NextIntlClientProvider>,
  );
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Họ tên phụ huynh"), "Nguyễn Văn A");
  await user.type(screen.getByLabelText("Số điện thoại"), "0912345678");
  await user.type(screen.getByLabelText("Lớp"), "9");
  await user.type(screen.getByLabelText("Môn quan tâm"), "Toán");
  await user.type(screen.getByLabelText("Hình thức học"), "1 kèm 1");
}

describe("ConsultationForm", () => {
  beforeEach(() => submitConsultation.mockReset());

  it("labels every required field", () => {
    renderForm();
    for (const label of ["Họ tên phụ huynh", "Số điện thoại", "Lớp", "Môn quan tâm", "Hình thức học"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("sends the typed values to the server action", async () => {
    submitConsultation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(submitConsultation).toHaveBeenCalledWith(
      expect.objectContaining({ parentName: "Nguyễn Văn A", phone: "0912345678", grade: "9" }),
    );
  });

  it("shows the success message after a successful submission", async () => {
    submitConsultation.mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Đã nhận thông tin");
  });

  it("surfaces the error returned by the action", async () => {
    submitConsultation.mockResolvedValue({ ok: false, error: "Số điện thoại không hợp lệ" });
    const user = userEvent.setup();
    renderForm();
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Gửi đăng ký" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Số điện thoại không hợp lệ");
  });
});
```

Create `tests/sections/contact.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import viMessages from "@/messages/vi.json";
import { Contact } from "@/app/[locale]/(public)/home/_components/contact";

vi.mock("@/app/actions/consultation", () => ({ submitConsultation: vi.fn() }));

describe("Contact", () => {
  it("renders the registration anchor the CTAs point at", () => {
    const { container } = render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <Contact />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector("section#dang-ky")).not.toBeNull();
  });

  it("shows the hotline, email and address alongside the form", () => {
    render(
      <NextIntlClientProvider locale="vi" messages={viMessages}>
        <Contact />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Hotline")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Địa chỉ")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `pnpm exec vitest run tests/sections/consultation-form.test.tsx tests/sections/contact.test.tsx`
Expected: FAIL — modules not found.

- [ ] **Step 4: Create `consultation-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { submitConsultation } from "@/app/actions/consultation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "failed"; error: string };

export function ConsultationForm() {
  const t = useTranslations("contact.form");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus({ kind: "sending" });

    const result = await submitConsultation({
      parentName: String(form.get("parentName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      grade: String(form.get("grade") ?? ""),
      subject: String(form.get("subject") ?? ""),
      format: String(form.get("format") ?? ""),
      note: String(form.get("note") ?? ""),
    });

    setStatus(result.ok ? { kind: "sent" } : { kind: "failed", error: result.error });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="parentName">{t("parentName")}</Label>
          <Input id="parentName" name="parentName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">{t("phone")}</Label>
          <Input id="phone" name="phone" type="tel" inputMode="tel" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">{t("grade")}</Label>
          <Input id="grade" name="grade" placeholder={t("gradePlaceholder")} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subject">{t("subject")}</Label>
          <Input id="subject" name="subject" placeholder={t("subjectPlaceholder")} required />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="format">{t("format")}</Label>
          <Input id="format" name="format" placeholder={t("formatPlaceholder")} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">{t("note")}</Label>
        <Textarea id="note" name="note" rows={4} placeholder={t("notePlaceholder")} />
      </div>

      <Button type="submit" className="w-full" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? t("submitting") : t("submit")}
      </Button>

      {status.kind === "sent" ? (
        <p role="status" className="text-sm font-medium text-primary">
          {t("success")}
        </p>
      ) : null}
      {status.kind === "failed" ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {status.error}
        </p>
      ) : null}
    </form>
  );
}
```

- [ ] **Step 5: Create `contact.tsx`**

```tsx
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/section";
import { SITE_ADDRESS, SITE_EMAIL, SITE_PHONE, SITE_ZALO_URL } from "@/lib/site";
import { ConsultationForm } from "./consultation-form";

export function Contact() {
  const t = useTranslations("contact");
  const address = [
    SITE_ADDRESS.street,
    SITE_ADDRESS.district,
    SITE_ADDRESS.city,
  ].join(", ");

  const details = [
    { icon: Phone, label: t("phoneLabel"), value: SITE_PHONE, href: `tel:${SITE_PHONE}` },
    { icon: MessageCircle, label: t("zaloLabel"), value: SITE_ZALO_URL, href: SITE_ZALO_URL },
    { icon: Mail, label: t("emailLabel"), value: SITE_EMAIL, href: `mailto:${SITE_EMAIL}` },
    { icon: MapPin, label: t("addressLabel"), value: address, href: undefined },
  ];

  return (
    <Section
      id="dang-ky"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-2">
        <ul className="space-y-6">
          {details.map((detail) => (
            <li key={detail.label} className="flex gap-3">
              <detail.icon className="mt-1 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">{detail.label}</p>
                {detail.href ? (
                  <a href={detail.href} className="text-sm text-muted-foreground hover:underline">
                    {detail.value}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{detail.value}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <ConsultationForm />
      </div>
    </Section>
  );
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `pnpm exec vitest run tests/sections tests/messages`
Expected: PASS — 6 new tests plus every earlier section test.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(home): add consultation form and contact section"
```

---

### Task 14: Footer and page composition

The page becomes reachable at `/vi/home` after this task.

**Files:**
- Create: `.../footer.tsx`, `app/[locale]/(public)/home/page.tsx`
- Modify: `messages/vi.json`, `messages/en.json`
- Test: `tests/sections/footer.test.tsx`

**Interfaces:**
- Consumes: every section component from Tasks 8–13, `SiteHeader` (Task 4), `StructuredData` (Task 6).
- Produces: `SiteFooter` named export; the default-exported `HomePage`.

- [ ] **Step 1: Add the message keys**

Append to `messages/vi.json`:

```json
{
  "footer": {
    "tagline": "Trung tâm gia sư đồng hành cùng học sinh THCS và THPT.",
    "quickLinks": "Liên kết nhanh",
    "contact": "Liên hệ",
    "rights": "Bảo lưu mọi quyền."
  }
}
```

Append to `messages/en.json`:

```json
{
  "footer": {
    "tagline": "A tutoring centre supporting secondary and high school students.",
    "quickLinks": "Quick links",
    "contact": "Contact",
    "rights": "All rights reserved."
  }
}
```

- [ ] **Step 2: Write the failing test**

Create `tests/sections/footer.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import vi from "@/messages/vi.json";
import { SiteFooter } from "@/app/[locale]/(public)/home/_components/footer";

function renderFooter() {
  return render(
    <NextIntlClientProvider locale="vi" messages={vi}>
      <SiteFooter />
    </NextIntlClientProvider>,
  );
}

describe("SiteFooter", () => {
  it("renders a contentinfo landmark", () => {
    renderFooter();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("repeats the in-page navigation anchors", () => {
    const { container } = renderFooter();
    for (const anchor of ["#khoa-hoc", "#hinh-thuc", "#giao-vien", "#hoc-phi", "#dang-ky"]) {
      expect(container.querySelector(`a[href="${anchor}"]`)).not.toBeNull();
    }
  });

  it("shows the brand name and the rights line", () => {
    renderFooter();
    expect(screen.getByText(/Bảo lưu mọi quyền/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run tests/sections/footer.test.tsx`
Expected: FAIL — cannot resolve the footer module.

- [ ] **Step 4: Create `footer.tsx`**

```tsx
import { useTranslations } from "next-intl";
import { Logo } from "@/components/logo";
import { SITE_EMAIL, SITE_NAME, SITE_PHONE } from "@/lib/site";

const LINKS = [
  { href: "#khoa-hoc", key: "courses" },
  { href: "#hinh-thuc", key: "formats" },
  { href: "#giao-vien", key: "teachers" },
  { href: "#hoc-phi", key: "pricing" },
  { href: "#dang-ky", key: "register" },
] as const;

export function SiteFooter() {
  const t = useTranslations("footer");
  const nav = useTranslations("nav");

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">{t("tagline")}</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t("quickLinks")}</p>
          <ul className="space-y-2">
            {LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {nav(link.key)}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">{t("contact")}</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href={`tel:${SITE_PHONE}`} className="hover:text-foreground">
                {SITE_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE_EMAIL}`} className="hover:text-foreground">
                {SITE_EMAIL}
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t py-6 text-center text-xs text-muted-foreground">
        © {SITE_NAME}. {t("rights")}
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Create the home page**

`app/[locale]/(public)/home/page.tsx`:

```tsx
import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { StructuredData } from "@/components/structured-data";
import { Achievements } from "./_components/achievements";
import { Contact } from "./_components/contact";
import { Courses } from "./_components/courses";
import { Faq } from "./_components/faq";
import { SiteFooter } from "./_components/footer";
import { Formats } from "./_components/formats";
import { Hero } from "./_components/hero";
import { Pricing } from "./_components/pricing";
import { Process } from "./_components/process";
import { Stats } from "./_components/stats";
import { Teachers } from "./_components/teachers";
import { Testimonials } from "./_components/testimonials";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <StructuredData locale={locale} />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Stats />
        <Courses />
        <Formats />
        <Process />
        <Teachers />
        <Achievements />
        <Pricing />
        <Testimonials />
        <Faq />
        <Contact />
      </main>
      <SiteFooter />
    </div>
  );
}
```

- [ ] **Step 6: Run the whole suite**

Run: `pnpm test`
Expected: PASS — every test written so far.

- [ ] **Step 7: Verify the page builds and renders**

Run: `pnpm build`
Expected: build succeeds and the route list includes `/[locale]/home`.

Then run `pnpm dev`, open `http://localhost:3000` and confirm it redirects to `/vi/home`, all eleven sections render top to bottom, and the language switcher moves to `/en/home`.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(home): compose the landing page and add the site footer"
```

---

### Task 15: mise tasks replace the Makefile

**Files:**
- Create: `mise/tasks/local/{up,down,restart,start,stop,rm,connect,dev}`, `mise/tasks/prod/{up,down,restart,start,stop,rm}`
- Modify: `mise.toml`, `.docker/development/node/Dockerfile`, `.docker/production/node/Dockerfile`, `.dockerignore`
- Delete: `Makefile`

**Interfaces:**
- Consumes: the compose files already committed (`docker-compose.yaml`, `docker-compose.override.yaml`, `docker-compose.production.yaml`) and `.env` variables `APP_NAME`, `APP_PORT`, `UID_HOST_USER`, `GID_HOST_USER`.
- Produces: `mise run local:*` and `mise run prod:*` task names.

- [ ] **Step 1: Write `mise.toml`**

```toml
# mise configuration.
#
# Tasks are file tasks under `mise/tasks/`, namespaced by environment:
#   mise/tasks/local/*  -> local:*  (development)
#   mise/tasks/prod/*   -> prod:*   (production)
#
# List them with `mise tasks ls`; run with `mise run <task>`,
# e.g. `mise run local:up`.
#
# They wrap Docker Compose using the override pattern:
#   docker-compose.yaml             base (shared) config
#   docker-compose.override.yaml    local overrides, auto-loaded
#   docker-compose.production.yaml  prod overrides, applied explicitly
```

- [ ] **Step 2: Create the local tasks**

Each file starts with the same two lines:

```bash
#!/usr/bin/env bash
set -euo pipefail
```

`mise/tasks/local/up`:

```bash
#!/usr/bin/env bash
#MISE description="Start the local dev containers"
set -euo pipefail
docker compose up -d
```

`mise/tasks/local/down`:

```bash
#!/usr/bin/env bash
#MISE description="Stop and remove the local dev containers"
set -euo pipefail
docker compose down
```

`mise/tasks/local/restart`:

```bash
#!/usr/bin/env bash
#MISE description="Rebuild and restart the local dev containers"
set -euo pipefail
docker compose up -d --build
```

`mise/tasks/local/start`:

```bash
#!/usr/bin/env bash
#MISE description="Start existing local dev containers"
set -euo pipefail
docker compose start
```

`mise/tasks/local/stop`:

```bash
#!/usr/bin/env bash
#MISE description="Stop the local dev containers without removing them"
set -euo pipefail
docker compose stop
```

`mise/tasks/local/rm`:

```bash
#!/usr/bin/env bash
#MISE description="Remove local dev containers, local images and volumes"
set -euo pipefail
docker compose down --rmi local -v
```

`mise/tasks/local/connect`:

```bash
#!/usr/bin/env bash
#MISE description="Open a bash shell inside the local node container"
set -euo pipefail
docker compose exec -it node bash
```

`mise/tasks/local/dev`:

```bash
#!/usr/bin/env bash
#MISE description="Run the Next.js dev server inside the local node container"
set -euo pipefail
docker compose exec -it node pnpm dev
```

- [ ] **Step 3: Create the prod tasks**

Each prod task uses the explicit two-file chain, which deliberately excludes the auto-loaded dev override.

`mise/tasks/prod/up`:

```bash
#!/usr/bin/env bash
#MISE description="Start the production containers"
set -euo pipefail
docker compose -f docker-compose.yaml -f docker-compose.production.yaml up -d
```

`mise/tasks/prod/down`:

```bash
#!/usr/bin/env bash
#MISE description="Stop and remove the production containers"
set -euo pipefail
docker compose -f docker-compose.yaml -f docker-compose.production.yaml down
```

`mise/tasks/prod/restart`:

```bash
#!/usr/bin/env bash
#MISE description="Rebuild and restart the production containers"
set -euo pipefail
docker compose -f docker-compose.yaml -f docker-compose.production.yaml up -d --build
```

`mise/tasks/prod/start`:

```bash
#!/usr/bin/env bash
#MISE description="Start existing production containers"
set -euo pipefail
docker compose -f docker-compose.yaml -f docker-compose.production.yaml start
```

`mise/tasks/prod/stop`:

```bash
#!/usr/bin/env bash
#MISE description="Stop the production containers without removing them"
set -euo pipefail
docker compose -f docker-compose.yaml -f docker-compose.production.yaml stop
```

`mise/tasks/prod/rm`:

```bash
#!/usr/bin/env bash
#MISE description="Remove production containers, local images and volumes"
set -euo pipefail
docker compose -f docker-compose.yaml -f docker-compose.production.yaml down --rmi local -v
```

- [ ] **Step 4: Make the tasks executable and drop the Makefile**

```bash
chmod +x mise/tasks/local/* mise/tasks/prod/*
rm -f Makefile
```

- [ ] **Step 5: Switch the dev Dockerfile to pnpm**

Replace `.docker/development/node/Dockerfile`:

```dockerfile
FROM node:22.15.0

LABEL maintainer="KingNNT"

ARG UID_HOST_USER
ARG GID_HOST_USER
ARG NAME_CONTAINER_GROUP=group_container
ARG NAME_CONTAINER_USER=user_container

RUN apt update

RUN userdel -r node
RUN addgroup --system --gid ${GID_HOST_USER} ${NAME_CONTAINER_GROUP}
RUN adduser --system -uid ${UID_HOST_USER} --home /home/${NAME_CONTAINER_USER} --disabled-password ${NAME_CONTAINER_USER}
RUN adduser ${NAME_CONTAINER_USER} ${NAME_CONTAINER_GROUP}
RUN usermod --gid sudo ${NAME_CONTAINER_USER}

RUN corepack enable && corepack prepare pnpm@11.9.0 --activate

ENV PNPM_HOME=/home/${NAME_CONTAINER_USER}/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH

USER ${NAME_CONTAINER_USER}

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

EXPOSE 3000
```

- [ ] **Step 6: Switch the production Dockerfile to pnpm and standalone output**

Replace `.docker/production/node/Dockerfile`:

```dockerfile
FROM node:22.15.0-alpine AS deps
LABEL maintainer="KingNNT"
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM node:22.15.0-alpine AS builder
RUN corepack enable && corepack prepare pnpm@11.9.0 --activate
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22.15.0-alpine AS production
LABEL maintainer="KingNNT"
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
ENTRYPOINT ["node", "server.js"]
```

- [ ] **Step 7: Update `.dockerignore`**

Replace the dependency block so the pnpm lockfile is kept and the yarn one is gone:

```
# dependencies
/node_modules
/.pnp
.pnp.*
package-lock.json
yarn.lock

# testing
/coverage
/tests

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# env files (can opt-in for committing if needed)
.env*
!.env.example

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 8: Verify the tasks are discovered**

Run: `mise tasks ls`
Expected: 14 tasks listed — 8 under `local:` and 6 under `prod:`, each with its description.

- [ ] **Step 9: Verify the compose files still merge**

```bash
set -a; . ./.env.example; set +a
docker compose config >/dev/null
```

Expected: exits 0 with no output. (`prod` config needs a real `.env` for its `env_file`, so it is not checked here.)

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "build: replace Makefile with mise tasks and move containers to pnpm"
```

---

### Task 16: CI and repository documentation

**Files:**
- Create: `.github/workflows/lint-format.yml`, `CLAUDE.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: the `format:check`, `lint` and `test` scripts (Task 1).
- Produces: nothing other tasks depend on. This is the last task.

- [ ] **Step 1: Create the workflow**

`.github/workflows/lint-format.yml`:

```yaml
name: Lint, Format & Test

on:
  pull_request:
    branches: [develop]
  push:
    branches: [develop]

permissions:
  contents: read

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  check:
    name: Lint, Format & Test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: pnpm/action-setup@v4
        with:
          version: "11.9.0"
      - uses: actions/setup-node@v5
        with:
          node-version: "22.15.0"
          cache: pnpm
      - run: pnpm install --frozen-lockfile
        env:
          HUSKY: 0
      - run: pnpm format:check
      - run: pnpm lint
      - run: pnpm test
```

- [ ] **Step 2: Create `CLAUDE.md`**

```markdown
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bilingual (Vietnamese default / English) marketing landing page for the tutoring
centre **Trí Tuệ Việt**. Next.js 16 App Router + React 19 + TypeScript (strict),
styled with Tailwind v4 and shadcn/ui.

## Commands

Package manager is **pnpm**.

```bash
pnpm dev            # dev server (Turbopack) on http://localhost:3000
pnpm build          # production build
pnpm start          # serve production build
pnpm test           # run vitest once
pnpm test:watch     # vitest watch mode
pnpm lint           # eslint
pnpm lint:fix       # eslint --fix
pnpm format         # biome format --write
pnpm format:check   # biome format (verify only) — what CI runs
```

Run a single test file / test:

```bash
pnpm exec vitest run tests/sections/hero.test.tsx
pnpm exec vitest run -t "renders exactly one h1"
```

Docker workflows are mise file tasks namespaced `local:*` / `prod:*`
(`mise/tasks/`; list with `mise tasks ls`). They wrap the Docker Compose
override pattern: `docker-compose.yaml` (base),
`docker-compose.override.yaml` (dev, auto-loaded),
`docker-compose.production.yaml` (prod, applied explicitly).

## Formatting vs. linting split

Biome and ESLint are deliberately split — do not merge them:

- **Biome** = formatting only. Its linter is disabled (`biome.json` →
  `"linter": { "enabled": false }`). 2-space indent, 100 col, double quotes,
  semicolons, trailing commas.
- **ESLint** = linting only, via `eslint-config-next`.

The Husky pre-commit hook runs `lint-staged`. CI runs `format:check`, `lint`
then `test` on pushes/PRs to `develop`.

## Git flow

The integration branch is **`develop`**. Commits follow Conventional Commits;
commitlint is enforced.

## Architecture

### Internationalization (next-intl)

Everything is locale-scoped under `app/[locale]/`. Locales are declared once in
`enums/locale.enum.ts` (`LocaleSupport.VI` is the default, `.EN` secondary) and
wired into `i18n/routing.ts` (`localePrefix: "always"`). Middleware lives in
**`proxy.ts`** (Next 16 renamed `middleware.ts`). Use the locale-aware `Link`,
`redirect` and `useRouter` from `i18n/navigation.ts`, not `next/link` or
`next/navigation`.

`messages/vi.json` and `messages/en.json` **must have identical key structure** —
`tests/messages/parity.test.ts` enforces it.

### Page composition

`app/[locale]/(public)/home/page.tsx` is the single landing page. It composes
one component per marketing section from `_components/`: hero, stats, courses,
formats, process, teachers, achievements, pricing, testimonials, faq, contact,
footer. Sections are anchor-linked with Vietnamese slugs (`#khoa-hoc`,
`#hinh-thuc`, `#giao-vien`, `#hoc-phi`, `#dang-ky`).

`components/section.tsx` provides the shared shell.

### Server actions

`app/actions/consultation.ts` (`"use server"`) handles the lead form, validating
with the Zod schema in `consultation.schema.ts`. It currently logs submissions —
forwarding to a webhook, Google Sheet or email provider is deliberately left
open.

### SEO

`lib/site.ts` is the single source of truth for site URL, brand name, contact
details, address and keywords. Metadata is generated in `app/[locale]/layout.tsx`,
plus `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` and JSON-LD via
`components/structured-data.tsx` + `lib/structured-data.ts`. The JSON-LD types
are `EducationalOrganization` + `LocalBusiness` + `Course`.

## Unfilled content

The centre's real data is not in the repo yet. Every unfilled value is the
literal string `[TODO: ...]`. Fill these before launch:

- `lib/site.ts` — `SITE_PHONE`, `SITE_ZALO_URL`, `SITE_EMAIL`, `SITE_ADDRESS`,
  `SITE_OPENING_HOURS`, `SITE_SAME_AS`, and the `SITE_URL` default
- `messages/vi.json` + `messages/en.json` — `stats.*.value`, `teachers.items[]`,
  `achievements.items[]`, `pricing.plans[].price`, `testimonials.items[]`

Never invent figures for these — they are advertising claims.

## Brand assets

`components/logo.tsx` renders an SVG + text wordmark; `app/icon.tsx` generates
the favicon at runtime via `ImageResponse`. There is no image asset yet — when
real artwork arrives, replace the SVG in `logo.tsx` and swap `icon.tsx` for an
`icon.png`.

## Testing

Vitest + jsdom + `@testing-library/react` (`vitest.config.mts`, setup in
`vitest.setup.ts`). Tests live in `tests/**/*.test.{ts,tsx}` mirroring source
structure. When adding a section or message key, add or extend the matching test.
```

- [ ] **Step 3: Replace `README.md`**

```markdown
# Trí Tuệ Việt — Landing Page

Bilingual (Vietnamese / English) marketing landing page for the Trí Tuệ Việt
tutoring centre. Next.js 16 App Router, Tailwind v4, shadcn/ui, next-intl.

## Getting started

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — it redirects to `/vi/home`.

## Docker

```bash
mise tasks ls        # list every local:* and prod:* task
mise run local:up    # start the dev container
mise run local:dev   # run the dev server inside it
mise run prod:up     # start the production container
```

Copy `.env.example` to `.env` first and set `UID_HOST_USER` / `GID_HOST_USER`
to your own `id -u` / `id -g`.

## Before launch

The centre's real details are still placeholders written as `[TODO: ...]`.
See the "Unfilled content" section of `CLAUDE.md` for the exact list.
```

- [ ] **Step 4: Run the full verification suite**

```bash
pnpm format:check && pnpm lint && pnpm test && pnpm build
```

Expected: all four exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "ci: run format, lint and tests on develop; document the repo"
```

---

## Verification checklist

Run after Task 16. Every line must pass before the branch is considered done.

- [ ] `pnpm format:check` exits 0
- [ ] `pnpm lint` exits 0
- [ ] `pnpm test` — all tests pass, no `.skip`
- [ ] `pnpm build` succeeds and lists `/[locale]/home`
- [ ] `mise tasks ls` shows 14 tasks
- [ ] `http://localhost:3000` redirects to `/vi/home`
- [ ] The language switcher moves between `/vi/home` and `/en/home` and the copy changes
- [ ] `grep -rn "\[TODO:" messages lib` lists only intended placeholders
- [ ] `Makefile` no longer exists; `yarn.lock` and `package-lock.json` no longer exist
