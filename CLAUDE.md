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

`components/section.tsx` provides the shared shell. It takes two design props:

- `tone: "light" | "muted" | "ink"` (default `light`) picks the background
  from the `TONES` map and renders it as `<section data-tone={tone}>`. On
  `ink` the eyebrow switches from `text-primary` to `text-highlight` and the
  description from `text-muted-foreground` to
  `text-surface-ink-foreground/75`.
- `align: "center" | "start"` (default `center`) controls the heading block.

Those tones alternate into a fixed rhythm — three "chapters", each opened by
a dark ink band:

| # | Section | Tone |
|---|---|---|
| 1 | hero | ink |
| 2 | stats | ink |
| 3 | courses | light |
| 4 | formats | muted |
| 5 | process | light |
| 6 | teachers | muted |
| 7 | achievements | ink |
| 8 | pricing | light |
| 9 | testimonials | muted |
| 10 | faq | light |
| 11 | contact | ink |

`tests/sections/page-rhythm.test.tsx` pins that whole table. Because
`page.tsx` is an async Server Component that will not render under jsdom
(`setRequestLocale` throws outside a real RSC render and `StructuredData` is
async), it reads the component order out of `page.tsx`'s **source** and then
renders each component to read its real `data-tone`. Adding or reordering a
section means updating that test.

Hero, stats, `SiteHeader` and `SiteFooter` are **not** `Section`s — they are
plain containers on the ink surface. They must paint themselves with the
exported `INK_SURFACE` constant from `components/section.tsx` (which is also
what `TONES.ink` holds), not a hand-copied class string. `INK_FOCUS_RING` is
exported next to it: shadcn's default `focus-visible:ring-ring/50` measures
1.54:1 on `--surface-ink` in light mode, well under SC 1.4.11's 3:1, so every
interactive element on an ink surface that is not a `Button` carries that
constant instead. `Button`s use the `ink-ghost` variant.

Contact is `tone="ink"` but the consultation form sits inside a
`bg-card` panel: `text-primary`, `text-destructive` and
`placeholder:text-muted-foreground` all fail AA when measured against
`--surface-ink`, so the form needs a light surface under it. Do not remove
that wrapper — `tests/sections/contact.test.tsx` guards it.

`SiteHeader` (`components/site-header.tsx`) builds both the desktop nav and
the mobile dropdown menu from the same `NAV_ITEMS` array, plus a hotline
button (`tel:${SITE_PHONE}`, labelled via the `nav.callHotline` message key)
and the language switcher / theme toggle (`components/mode-toggle.tsx`). It
sits on the ink surface, so all five of its controls carry the ink focus
ring.

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

On top of shadcn's default map, `app/globals.css` defines two brand token
families, both mapped through `@theme inline` so Tailwind emits the utilities:

- `--highlight` / `--highlight-foreground` — the amber CTA. Amber is a
  **background**, never text: on a light surface amber text measures 2.1:1.
  `--highlight` is deliberately *different* between themes (amber-500 in
  `:root`, amber-400 in `.dark`) because amber on ink only reaches 4.06:1 at
  amber-500 in dark mode; do not "sync" the two values.
  **Amber must never be written into shadcn's `--accent`.** `--accent` is
  what shadcn's own components (ghost buttons, dropdown hover, etc.) reach
  for automatically, and pushing amber there would spray the CTA colour over
  every incidental hover state.
- `--surface-ink` / `--surface-ink-foreground` — the dark band. It
  **inverts** between modes: a deep maroon in light, a lighter red in dark.
  That carries an invariant — `.dark`'s `--background` must stay *darker*
  than `.dark`'s `--surface-ink`, or the band sinks into the page instead of
  floating on it. `tests/styles/tokens.test.ts` asserts this by comparing
  the two oklch lightness values.

`--primary` is the brand red sampled from `public/images/logo.png`:
`oklch(51.3% 0.2 28)` = `#BF1516`, 6.30:1 on white. **The site follows the
logo, not the reverse** — if this drifts, the header stops matching the mark
sitting inside it. `tests/styles/tokens.test.ts` pins the value. The neutrals
are Tailwind's warm `stone` family rather than the cool `slate` shadcn ships,
because slate greys read blue-ish next to red.

That red creates one hazard worth knowing about: **`--primary` (hue 28.0) and
`--destructive` (hue 27.3) are 0.7 degrees apart** — the same colour to the
eye. Colour alone can therefore no longer separate "brand emphasis" from
"error". Anything conveying success or failure must also carry a
non-colour cue; `consultation-form.tsx` pairs each status message with its own
lucide icon and a tinted block, and `tests/sections/consultation-form.test.tsx`
asserts both icons exist. This is WCAG 1.4.1, and it is why the success message
is *not* painted in `--primary`.

`--input` is deliberately much darker than `--border`
(`oklch(66% 0.012 56)`, 3.03:1 on white). An input's outline is the only thing
showing the control exists, so WCAG 1.4.11 asks 3:1; shadcn's stock stone-200
measured 1.26:1 against the white form panel.

Text on the ink surface must not drop below `text-surface-ink-foreground/70`
(4.94:1 in dark mode; `/60` is 4.04:1 and fails AA).
`tests/styles/ink-contrast.test.ts` sweeps `app/` and `components/` for
violations.

`app/globals.css` also holds two global classes, both inside
`@layer utilities` so ordinary utilities can still override them:

- `.bg-grid` — the faded grid pattern, for ink surfaces only.
- `.reveal` — the pure-CSS scroll reveal. Its rule is wrapped in
  `@supports (animation-timeline: view())` **and**
  `@media (prefers-reduced-motion: no-preference)`, and **both wrappers are
  load-bearing**: a browser without `animation-timeline` (Firefox) that
  reached this rule would pin every revealed element at the keyframe's
  `opacity: 0` forever. `tests/styles/tokens.test.ts` proves the nesting by
  balanced brace ranges, not substring matching. Never lift `.reveal` out of
  either wrapper.

`components/ui/button.tsx` carries two variants beyond upstream shadcn:
`highlight` (the amber CTA — used by the header register button, the hero
primary, all three pricing CTAs and the consultation form's submit) and
`ink-ghost` (a ghost button for ink surfaces). `ink-ghost`'s
`hover:text-surface-ink-foreground` is **not** redundant with the base
`ghost` variant: `cn()` is `twMerge(clsx(...))`, and that class is precisely
what cancels `ghost`'s `hover:text-accent-foreground` (slate-900 — near-black
text on the near-black ink header). It also swaps the focus ring for one that
reads on ink.

`app/globals.css` only defines the token families the current UI actually
uses — it omits `--color-destructive-foreground`, the `--color-chart-*`
family and the `--color-sidebar-*` family. The first `shadcn add chart`,
`shadcn add sonner` or `shadcn add sidebar` on this repo will need the token
map in `app/globals.css` extended by hand before the generated component's
classes resolve to real colors.

The `--radius-*` scale was also **remapped**, not merely rescaled: upstream
shadcn is `sm = r−4 / md = r−2 / lg = r / xl = r+4`, this repo is
`sm = r−2 / md = r / lg = r+2 / xl = r+6`. So `rounded-lg` no longer equals
`--radius`. Anything `shadcn add` generates will render one step rounder than
upstream assumes — check the corners on generated components rather than
trusting them.

## Unfilled content

The centre's real data is not in the repo yet. Every unfilled value is the
literal string `[TODO: ...]`:

- `lib/site.ts` — `SITE_PHONE`, `SITE_ZALO_URL`, `SITE_EMAIL`,
  `SITE_ADDRESS.street/district/city`, `SITE_OPENING_HOURS[0]`. `SITE_URL`'s
  default (`https://tritueviet.example.com`) is also a placeholder domain,
  though not a literal `[TODO: ...]` string — override it with
  `NEXT_PUBLIC_SITE_URL` once the real domain exists (see "Commands" above:
  it must be set at `docker build` time, not just in the runtime `.env`).
- `messages/vi.json` + `messages/en.json` — all four `teachers.items[]`
  entries (`name`/`subject`/`credential`), all three `achievements.items[]`
  entries (`title`/`detail`), all three `pricing.plans[].price`, all three
  `testimonials.items[]` entries (`quote`/`author`/`role`).

  `stats.*` values are rendered through `components/count-up.tsx`, a `"use
  client"` leaf that animates each figure from 1 up to its target when the band
  scrolls into view. `Stats` itself stays a Server Component — the client
  boundary is the leaf, the same shape `consultation-form.tsx` uses. The
  component is seeded with the **final** figure, so the server, crawlers, a
  visitor without JS and anyone with `prefers-reduced-motion` all see the real
  number; the count is an enhancement layered on top, never the source of
  truth. The catalogue stores display strings (`3.000+` vi, `3,000+` en), so
  `parseFigure` recovers the digits and `Intl.NumberFormat(locale)` regroups
  them on every frame.

  `stats.*` is **done** — the centre supplied 3.000+ học viên, 2+ năm kinh
  nghiệm, 500+ gia sư, 5+ giáo viên dạy thường xuyên. Note the fourth slot is
  `stats.tutors`, not the original `stats.passRate`: no admission-rate figure
  was available, and inventing one was not an option, so the slot was
  repurposed rather than left as a visible placeholder. If a real pass rate
  ever arrives it needs a new slot and a layout decision — the grid is
  `grid-cols-2 md:grid-cols-4`, so a fifth figure leaves one orphaned on its
  own row.
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

`public/images/logo.png` is the supplied artwork: a square social-avatar
lockup — wordmark, figure reaching for a star atop books, and a tagline —
brand red on a genuinely transparent background (all four corners are
`alpha=0`; it only *looks* white-backed in viewers that composite onto white).

`public/images/logo-mark.png` is the figure cropped out of it (source rows
176–361, squared and resampled to 512). `components/logo.tsx` renders **that
crop plus live HTML text**, never the full lockup: at the header's 36px, the
lockup's three text bands come out 4px, 4px and 1px tall, and its wordmark
would duplicate the `SITE_SHORT_NAME` text beside it. Live text also scales,
translates and is readable by screen readers.

The mark sits inside a **white chip** (`bg-white` wrapper). This is not
decoration — the artwork is the brand red, which measures **1.00:1 on the red
header** and 1.40:1 on the dark ink band. Without the chip the logo is
literally invisible in both places. `tests/components/logo.test.tsx` guards
the chip, the crop, and the empty `alt`.

`app/icon.png` (512) and `app/apple-icon.png` (180) are generated from the
mark on a white rounded tile — Next picks them up by filename. They replaced
the old `app/icon.tsx`, which drew a blue "TTV" via `ImageResponse`.
`app/manifest.ts`'s `theme_color` must be kept in step with `--primary`.

Still missing: an Open Graph image. `app/[locale]/layout.tsx` declares
`twitter.card: "summary_large_image"` but no image, so shared links render
without one.

## Testing

Vitest + jsdom + `@testing-library/react` (`vitest.config.mts`, setup in
`vitest.setup.ts`). Tests live in `tests/**/*.test.{ts,tsx}` mirroring source
structure. When adding a section or message key, add or extend the matching
test — and extend `tests/messages/placeholders.test.ts`'s path lists if the
new key is still a `[TODO: ...]` placeholder.
