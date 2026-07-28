# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Bilingual (Vietnamese default / English) marketing landing page for the tutoring
centre **Trí Tuệ Việt**. Next.js 16 App Router + React 19 + TypeScript (strict),
styled with Tailwind v4 and shadcn/ui.

## Commands

Package manager is **pnpm 11.9.0**. Never use `npm` or `yarn` — there is no
`package-lock.json` or `yarn.lock` in this repo.

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

`pnpm install` requires `pnpm-workspace.yaml` — it is not a stray monorepo
leftover, it carries the `allowBuilds` list (`@parcel/watcher`, `@swc/core`,
`sharp`, `unrs-resolver`) that pnpm needs to run those packages' native
postinstall scripts. Without it, `pnpm install` exits 1.

Docker workflows are mise file tasks namespaced `local:*` / `prod:*`, defined
under `mise/tasks/local/` and `mise/tasks/prod/` (fourteen tasks total; list
with `mise tasks ls`). There is no `Makefile` — mise replaced it. They wrap the
Docker Compose override pattern: `docker-compose.yaml` (base),
`docker-compose.override.yaml` (dev, auto-loaded),
`docker-compose.production.yaml` (prod, applied explicitly with
`-f docker-compose.yaml -f docker-compose.production.yaml`).

## Formatting vs. linting split

Biome and ESLint are deliberately split — do not merge them:

- **Biome** = formatting only. Its linter is disabled (`biome.json` →
  `"linter": { "enabled": false }`). 2-space indent, 100 col, double quotes,
  semicolons, trailing commas.
- **ESLint** = linting only, via `eslint-config-next`.

The Husky pre-commit hook (`.husky/pre-commit`) runs `pnpm exec lint-staged`,
which formats staged files with Biome and runs `eslint --fix` on staged
`.ts`/`.tsx`. CI (`.github/workflows/lint-format.yml`) runs `format:check`,
then `lint`, then `test`, then `build` on every push and PR to `develop` — the
`build` step is what actually proves the app compiles and that Server
Components render, since every section test renders its component as a
client component under `NextIntlClientProvider`.

Note: `commitlint.config.ts` and the `@commitlint/*` packages are present but
are **not** currently wired into a git hook — there is no `commit-msg` hook in
`.husky/`, only `pre-commit`. Conventional Commits is the convention to follow,
but nothing enforces it locally or in CI today.

## Git flow

The integration branch is **`develop`**. Commits follow Conventional Commits.

## Architecture

### Internationalization (next-intl)

Everything is locale-scoped under `app/[locale]/`. Locales are declared once in
`enums/locale.enum.ts` (`LocaleSupport.VI` is the default, `.EN` secondary) and
wired into `i18n/routing.ts` (`localePrefix: "always"`). Middleware lives in
**`proxy.ts`** (Next 16 renamed `middleware.ts`). Use the locale-aware `Link`,
`redirect` and `useRouter` from `i18n/navigation.ts`, not `next/link` or
`next/navigation`.

`messages/vi.json` and `messages/en.json` **must have identical key
structure**, arrays included — `tests/messages/parity.test.ts` walks both
catalogs recursively (indexed paths like `teachers.items.2.name`) and diffs
the full set of paths, not just top-level keys.

### Page composition

`app/[locale]/(public)/home/page.tsx` is the single landing page. It composes
one component per marketing section from `_components/`, in this order: hero,
stats, courses, formats, process, teachers, achievements, pricing,
testimonials, faq, contact — plus `SiteHeader` above and `SiteFooter` below.
Sections are anchor-linked: `#top`, `#khoa-hoc`, `#hinh-thuc`, `#quy-trinh`,
`#giao-vien`, `#thanh-tich`, `#hoc-phi`, `#cam-nhan`, `#cau-hoi`, `#dang-ky`.

`components/section.tsx` provides the shared shell.

`SiteHeader` (`components/site-header.tsx`) builds both the desktop nav and
the mobile dropdown menu from the same `NAV_ITEMS` array, plus a hotline
button (`tel:${SITE_PHONE}`, labelled via the `nav.callHotline` message key)
and the language switcher / theme toggle (`components/mode-toggle.tsx`).

`app/[locale]/(public)/home/_components/formats.tsx` looks its icon up by the
`icon` identifier on each `formats.items[]` entry (`one-on-one`, `small-group`,
`online`, `home`), not by array position — keep the identifier and the `ICONS`
map in that file in sync when editing the catalog.

### Server actions

`app/actions/consultation.ts` (`"use server"`) handles the lead form, validating
with the Zod schema in `consultation.schema.ts`. The schema returns stable
error identifiers (`phone_invalid`, `parentName_required`, `grade_required`,
`subject_required`, `format_required`, `note_too_long`, `invalid_input`) —
never Vietnamese strings. `consultation-form.tsx` translates each identifier
through the `contact.form.errors` message block, falling back to
`contact.form.error` for anything not in the catalog. It currently logs
submissions — forwarding to a webhook, Google Sheet or email provider is
deliberately left open. Those logged submissions carry a parent's name and
phone number: **container logs contain personal data.** `docker-compose.yaml`
caps the `node` service's `json-file` log driver at `max-size: "10m"` /
`max-file: "3"` so that data doesn't accumulate on the host disk unrotated
and indefinitely — it does not make the data disappear, so treat host log
access accordingly.

### SEO

`lib/site.ts` is the single source of truth for site URL, brand name, contact
details, address and keywords. Metadata is generated in `app/[locale]/layout.tsx`,
plus `app/sitemap.ts`, `app/robots.ts`, `app/manifest.ts` and JSON-LD via
`components/structured-data.tsx` + `lib/structured-data.ts`. Four JSON-LD
blocks are emitted per page: a combined `EducationalOrganization` +
`LocalBusiness`, a `WebSite`, a `Course` `ItemList` built from `courses.items[]`,
and a `FAQPage` built from `faq.items[]`.

### Design tokens

`app/globals.css` only defines the token families the current UI actually
uses — it omits `--color-destructive-foreground`, the `--color-chart-*`
family and the `--color-sidebar-*` family. The first `shadcn add chart`,
`shadcn add sonner` or `shadcn add sidebar` on this repo will need the token
map in `app/globals.css` extended by hand before the generated component's
classes resolve to real colors.

## Unfilled content

The centre's real data is not in the repo yet. Every unfilled value is the
literal string `[TODO: ...]`:

- `lib/site.ts` — `SITE_PHONE`, `SITE_ZALO_URL`, `SITE_EMAIL`,
  `SITE_ADDRESS.street/district/city`, `SITE_OPENING_HOURS[0]`. `SITE_URL`'s
  default (`https://tritueviet.example.com`) is also a placeholder domain,
  though not a literal `[TODO: ...]` string — override it with
  `NEXT_PUBLIC_SITE_URL` once the real domain exists (see "Commands" above:
  it must be set at `docker build` time, not just in the runtime `.env`).
- `messages/vi.json` + `messages/en.json` — `stats.*.value` (all four),
  all four `teachers.items[]` entries (`name`/`subject`/`credential`), all
  three `achievements.items[]` entries (`title`/`detail`), all three
  `pricing.plans[].price`, all three `testimonials.items[]` entries
  (`quote`/`author`/`role`).
- `lib/site.ts` — `SITE_SAME_AS` is `[]`. Like `SITE_URL`, this is a
  placeholder that is not a literal `[TODO: ...]` string, so
  `placeholders.test.ts` cannot catch it — it silently emits `"sameAs":[]` in
  the JSON-LD `EducationalOrganization` node until social/canonical profile
  URLs are added.

`tests/messages/placeholders.test.ts` enforces the literal `[TODO: ...]`
cases: it holds an explicit list of every one of the key paths above and
asserts each still starts with `[TODO:` in both catalogs. **A red result
there once real data arrives is expected and correct** — the fix is to
deliberately delete that entry from the list, not to weaken or generalize the
assertion. `SITE_URL` and `SITE_SAME_AS` are not on that list — check them
manually before launch.

Because `SITE_PHONE` and `SITE_ZALO_URL` are still placeholders, the
`tel:${SITE_PHONE}` links (header, hero, footer, contact section) and the
Zalo link (hero, contact section) are non-functional. They are launch
blockers, not cosmetic issues — fixing `lib/site.ts` fixes all of them at
once since every call site imports from there.

Never invent figures for these — they are advertising claims.

## Brand assets

`components/logo.tsx` renders an SVG + text wordmark; `app/icon.tsx` generates
the favicon at runtime via `ImageResponse`. There is no image asset yet — when
real artwork arrives, replace the SVG in `logo.tsx` and swap `icon.tsx` for an
`icon.png`.

## Testing

Vitest + jsdom + `@testing-library/react` (`vitest.config.mts`, setup in
`vitest.setup.ts`). Tests live in `tests/**/*.test.{ts,tsx}` mirroring source
structure. When adding a section or message key, add or extend the matching
test — and extend `tests/messages/placeholders.test.ts`'s path lists if the
new key is still a `[TODO: ...]` placeholder.
