# Vercel Web Analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add basic Vercel Web Analytics tracking to every Vietnamese and English landing-page render.

**Architecture:** Install Vercel's official Next.js package and mount its `Analytics` component once in the locale root layout. A source-level regression test will pin the single import and render without trying to execute the async Server Component under jsdom.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, `@vercel/analytics`, Vitest

---

## File map

- Modify `package.json` and `pnpm-lock.yaml`: declare and lock the analytics runtime dependency.
- Modify `app/[locale]/layout.tsx`: mount analytics once for all locale pages.
- Create `tests/seo/vercel-analytics.test.ts`: guard the integration point and prevent duplicate trackers.

### Task 1: Pin the analytics integration with a failing test

**Files:**
- Create: `tests/seo/vercel-analytics.test.ts`

- [ ] **Step 1: Write the failing source-level test**

```ts
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const layoutSource = fs.readFileSync(
  path.join(process.cwd(), "app/[locale]/layout.tsx"),
  "utf8",
);

describe("Vercel Web Analytics", () => {
  it("mounts the Next.js Analytics component exactly once in the locale layout", () => {
    expect(layoutSource).toContain(
      'import { Analytics } from "@vercel/analytics/next";',
    );
    expect(layoutSource.match(/<Analytics\s*\/>/g)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run the focused test and verify the red state**

Run:

```bash
pnpm exec vitest run tests/seo/vercel-analytics.test.ts
```

Expected: FAIL because `app/[locale]/layout.tsx` does not import or render `Analytics`.

- [ ] **Step 3: Commit the test**

```bash
git add tests/seo/vercel-analytics.test.ts
git commit -m "test(analytics): pin Vercel Analytics integration"
```

### Task 2: Install and mount Vercel Web Analytics

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `app/[locale]/layout.tsx`
- Test: `tests/seo/vercel-analytics.test.ts`

- [ ] **Step 1: Install the official runtime package**

Run:

```bash
pnpm add @vercel/analytics
```

Expected: command exits 0; `@vercel/analytics` appears under `dependencies` and `pnpm-lock.yaml` changes.

- [ ] **Step 2: Import the Next.js integration in the locale layout**

Add this import to `app/[locale]/layout.tsx` with the other package imports:

```tsx
import { Analytics } from "@vercel/analytics/next";
```

- [ ] **Step 3: Mount Analytics once in the body**

Change the end of the `<body>` in `LocaleLayout` to:

```tsx
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
        <Analytics />
```

This keeps analytics independent of theme state while covering every locale page.

- [ ] **Step 4: Run the focused test and verify the green state**

Run:

```bash
pnpm exec vitest run tests/seo/vercel-analytics.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit the implementation**

```bash
git add package.json pnpm-lock.yaml 'app/[locale]/layout.tsx'
git commit -m "feat(analytics): add Vercel Web Analytics"
```

### Task 3: Run the complete quality gate

**Files:**
- Verify all changed files

- [ ] **Step 1: Verify formatting**

Run:

```bash
pnpm format:check
```

Expected: exits 0 with no formatting differences.

- [ ] **Step 2: Run lint**

Run:

```bash
pnpm lint
```

Expected: exits 0 with no ESLint errors.

- [ ] **Step 3: Run the complete test suite**

Run:

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 4: Build the production application**

Run:

```bash
pnpm build
```

Expected: Next.js production build completes successfully.

- [ ] **Step 5: Commit any formatting-only correction if one was required**

Only if formatting changed tracked files:

```bash
git add 'app/[locale]/layout.tsx' tests/seo/vercel-analytics.test.ts package.json pnpm-lock.yaml
git commit -m "style: format Vercel Analytics integration"
```

No additional commit is needed when the working tree is already clean.

### Task 4: Enable analytics in Vercel

**Files:**
- No repository files

- [ ] **Step 1: Enable Web Analytics for the deployed project**

In Vercel Dashboard, open the project, select **Analytics**, and choose **Enable** if it is not already active. Deploy the commit to Vercel, visit `/vi` and `/en`, then confirm page views begin appearing in the Analytics dashboard.
