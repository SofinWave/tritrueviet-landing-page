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

`mise run local:up` starts the dev server itself — the override's `command`
runs `pnpm install --frozen-lockfile && pnpm dev`, and the task uses
`docker compose up -d --wait` against a healthcheck, so it only returns once
http://localhost:3000 actually answers. Follow the server output with
`mise run local:logs`. Two named volumes (`node_modules`, `next_cache`) sit on
top of the `.:/app` bind mount so the host's platform-specific `node_modules`
(darwin-arm64 `@next/swc`, `sharp`, `lightningcss`, …) and `.next` cache never
shadow the container's linux ones. `/app/.next` is pre-created in
`.docker/development/node/Dockerfile` so its volume inherits the container
user's ownership instead of root's.

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

`localeDetection` is **`false`**, and that is what actually makes the site open
in Vietnamese. `defaultLocale: VI` alone does not: next-intl's detection is on
by default and resolves a bare `/` from the visitor's `Accept-Language` header
and `NEXT_LOCALE` cookie *first*, falling back to `defaultLocale` only when
neither matches — so an English browser landed on `/en`. With it off, `/` always
redirects to `/vi`; `tests/i18n/routing.test.ts` pins the flag. Turning it back
on silently re-breaks the default without failing anything else.

Nothing depends on detection to stay reachable: every route carries a locale
prefix and `LanguageSwitcher` navigates to explicit `/en/...` URLs. The
trade-off is that a visitor who switched to English and later returns to the
bare `/` lands on Vietnamese again — the cookie is no longer consulted.

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
button (`tel:${SITE_PHONE_E164}`, labelled via the `nav.callHotline` message key)
and the language switcher / theme toggle (`components/mode-toggle.tsx`). It
sits on the ink surface, so all five of its controls carry the ink focus
ring.

`app/[locale]/(public)/home/_components/formats.tsx` looks its icon up by the
`icon` identifier on each `formats.items[]` entry (`one-on-one`, `small-group`,
`online`, `home`), not by array position — keep the identifier and the `ICONS`
map in that file in sync when editing the catalog.

`app/[locale]/(public)/home/_components/teachers.tsx` follows the same shape for
portraits: each `teachers.items[]` entry carries a `photo` identifier
(`pham-linh-thu`, `hoang-thu-huong`, `duong-trung-kien`, `ha-huy-anh`) that is
looked up in the exported `PHOTOS` map of static imports from
`public/images/tutors/`, so reordering or translating the catalog can never slide
a portrait onto the wrong person. `tests/sections/teachers.test.tsx` pins every
identifier in both catalogs to a real key. The four sources are portraits of
different crops plus one full-body square, so the card frames them with
`aspect-4/5` + `object-cover object-top` rather than per-image focal points, and
the `alt` is empty on purpose — the name is live text directly below.

### Server actions

**The consultation form currently ships disabled.**
`CONSULTATION_FORM_ENABLED` in `lib/site.ts` is `false`, and
`ConsultationForm`'s `disabled` prop defaults to its negation, so all six
controls and the submit button render with `disabled` in the built HTML. The
prop exists so `tests/sections/consultation-form.test.tsx` can render
`disabled={false}` and keep every submit / success / failure path exercised —
that coverage is live, not skipped, and must stay that way. Re-enabling the
form is a single flip of the constant; two tests pin the current default (all
controls disabled, and the action unreachable on click). `onSubmit` also
early-returns when disabled, so a submit raised some other way cannot create a
lead.

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
`components/structured-data.tsx` + `lib/structured-data.ts`. **Five** JSON-LD
blocks are emitted per page: a combined `EducationalOrganization` +
`LocalBusiness`, a `WebSite`, a `WebPage`, a `Course` `ItemList` built from
`courses.items[]`, and a `FAQPage` built from `faq.items[]`. They are joined by
`@id` — `${SITE_URL}/#organization`, `/#website`, and a per-locale
`${localeUrl(locale)}#webpage` — so the graph is one entity rather than five
loose nodes.

The organization node is assembled from the message catalog, not restated:
`formats.items[]` becomes its `hasOfferCatalog` (four `Service` offers) and
`teachers.items[]` becomes its `employee` list (four `Person` nodes carrying the
real credentials). Both are passed in by `components/structured-data.tsx` and
both are **omitted entirely** when empty, rather than emitted as `[]`.

Three fields are deliberately **absent** from the organization node, and adding
any of them is a content decision, not a code cleanup:

- `priceRange` — every figure in `pricing.plans[]` is a *floor* ("Chỉ từ"), so
  any range string turns a starting price into a promised cap.
- `aggregateRating` / `review` — Google's review guidelines forbid a business
  marking up testimonials it collected about itself, and no rating exists.

`tests/seo/structured-data.test.ts` asserts all three stay missing.

#### Open Graph

`public/images/og-image.jpg` is the supplied 1200x630 card. `SITE_OG_IMAGE` in
`lib/site.ts` holds its path *and* its dimensions, and both the Open Graph and
Twitter blocks in `app/[locale]/layout.tsx` are built from that one constant, so
`twitter.card: "summary_large_image"` finally has an image behind it. The alt
text is a catalog key (`metadata.ogImageAlt`), not a constant, because it is
prose and has to translate.

`tests/seo/og-image.test.ts` parses the JPEG's SOF marker and the PNG's IHDR
chunk and fails if the bytes on disk stop matching the declared numbers —
a re-crop that changed the file without changing the constant is exactly the
drift it exists to catch. 1200 wide is a hard floor: below it X silently
downgrades to the small card.

`SITE_THEME_COLOR` is now shared by `app/manifest.ts` and the `viewport` export
in `app/[locale]/layout.tsx`. Those two used to carry the hex separately.

#### GEO (answer engines)

`app/robots.ts` names AI crawlers **per vendor, three agents each** — a training
crawler, a search indexer, and a fetch-on-behalf-of-a-user agent. They are not
interchangeable, and this is the part that is easy to get subtly wrong:
`GPTBot` without `OAI-SearchBot` keeps the site out of ChatGPT's search index;
`ClaudeBot` without `Claude-User` means Claude cannot open the page when a user
asks it to; and for Gemini the load-bearing token is `Google-Extended`, which is
not a crawler at all but the opt-in deciding whether content Googlebot already
fetched may ground an answer. OpenAI, Anthropic and Google are the priority
vendors; the rest of the field follows in `OTHER_AI_CRAWLERS`.

Two rules there are structural: **`Googlebot` is deliberately not named** (a
named group *replaces* the `*` group for that agent rather than layering on it,
so naming it would shadow the generic rule), and for the same reason every AI
rule re-states the `/api/` disallow instead of inheriting it.

`/llms.txt` (and its `/llms-full.txt` alias — this site is one page, so its
index *is* the full content) is generated by `lib/llms-txt.ts` from the same
message catalogs the page renders from. Nothing in it is authored: change a
price or add a tutor in `messages/vi.json` and the file changes with it.
`tests/seo/llms-txt.test.ts` walks the catalog and asserts every course,
format, price, tutor, testimonial and FAQ answer survives into the output —
including that `pricing.from` ("Chỉ từ") still travels with each figure.

Both routes live **outside** `app/[locale]/`, because `/llms.txt` is a
well-known root path that must not carry a locale prefix. `proxy.ts`'s matcher
excludes it. `app/llms-full.txt/route.ts` re-exports `GET` but **re-declares**
`dynamic` — Next parses route segment config statically and rejects a
re-exported one at build time. The HTML advertises the file through
`alternates.types` (`<link rel="alternate" type="text/markdown">`).

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

**Nothing is a `[TODO: ...]` placeholder any more** — the centre has supplied
every value. This section records what each slot became and why, because
several of those decisions are not recoverable from the code alone.

- `lib/site.ts` — `SITE_OPENING_HOURS` is `["Mo-Su 08:30-23:00"]`. The `Mo-Su`
  span and the 24-hour clock are schema.org's format, not a style choice; do
  not "tidy" it into `8h30 - 23h`. The hours are currently **only** in JSON-LD —
  no visitor-facing surface renders them.

  `SITE_URL` now defaults to the real `https://tritueviet.org`, so it is no
  longer a placeholder — but that makes `NEXT_PUBLIC_SITE_URL` *more* important
  on any non-production deploy, not less: a staging build that leaves it unset
  now advertises the production domain as its own canonical, in `sitemap.ts`,
  `robots.ts`, every `alternates` block and all four JSON-LD nodes. It is baked
  in at `docker build` time (see "Commands" above), not read at runtime.

  The hotline is stored **twice on purpose**: `SITE_PHONE` (`"0965 492 153"`) is
  the display form and `SITE_PHONE_E164` (`"+84965492153"`) is what every
  `tel:` href and schema.org `telephone` carries. A `tel:` URI may not contain
  raw spaces — RFC 3966 allows `-` and `.` as visual separators and nothing
  else — so linking the grouped string relies on the browser repairing it, and
  Google reads `telephone` literally, where a leading national `0` only dials
  from inside Vietnam. `tests/sections/contact.test.tsx` pins both halves.

  `SITE_EMAIL` **no longer exists.** The centre has no published address and
  chose to drop the channel rather than show a dead `mailto:`, so the field was
  deleted along with its call sites in `footer.tsx`, `contact.tsx` and the
  `email` key in `organizationSchema`. Re-adding one means restoring all four.

  `SITE_ZALO_URL` points at `https://zalo.me/<number>` — the personal profile
  behind the hotline, because there is no Zalo Official Account yet. An OA link
  is shaped `https://oa.zalo.me/<oa-id>`, so this is a swap, not an edit.

  `SITE_FACEBOOK_URL` is the one social profile, and `SITE_SAME_AS` is built
  from it — that array is no longer the empty `[]` that used to emit
  `"sameAs":[]` into the JSON-LD. The contact row uses lucide's `Globe`: lucide
  dropped its brand icons, so there is no `Facebook` glyph to import, and the
  row is identified by its text label instead.
- `messages/vi.json` + `messages/en.json` — **nothing left.** Every message-catalog
  placeholder has been filled; `MESSAGE_PLACEHOLDER_PATHS` in
  `tests/messages/placeholders.test.ts` is now deliberately empty, kept as the
  landing spot for the next placeholder rather than deleted.

  `testimonials.items[]` is **done** — three parent quotes, supplied by the
  centre in the parents' own words and kept that way: the colloquial register
  ("chị phải lên giục để cho em Quân nó đi tắm") is the evidence that a person
  said it. The `en` versions are translations of those quotes, which is normal
  practice but does mean they are no longer verbatim. Slot 3 was reserved for a
  *student* quote; all three that arrived were from parents, so
  `testimonials.title` dropped "và học viên".

  This is the one field on the page that must never be drafted on the customer's
  behalf. Filling it by writing plausible quotes — even framed as marketing copy,
  even in the same warm voice as the rest of the page — produces a fake review
  attributed to a named person, which is a different thing from every other
  string in these catalogs. Refilling the slot means going back to a parent.

  `pricing.plans[].price` is **done** — 150.000đ kèm 1–1, 200.000đ người đi làm,
  140.000đ học online. Every one is a **floor, not a flat rate**, which is why
  `pricing.from` ("Chỉ từ") renders as a muted prefix in front of the figure;
  `tests/sections/pricing.test.tsx` pins that prefix on every card, because
  dropping it turns a starting price into a promise. Note the middle plan is now
  `Người đi làm`, not the original `Nhóm nhỏ 3 – 6 bạn`: the centre priced the
  working-adult track and the grid is `md:grid-cols-3`, so the slot was
  repurposed rather than left as a visible placeholder — the same call
  `stats.passRate` -> `stats.tutors` made. Small groups are still offered and
  still listed under `formats.items[]`; they just carry no published price.

  `achievements.items[]` is **done** — the centre supplied three named student
  results (IELTS 6.5, chuyên Hà Nội – Amsterdam, ĐH Bách khoa Hà Nội). They
  deliberately carry **no school year and no exact entrance score**: neither was
  supplied, and the centre's own placeholder text asked for a year. Those gaps
  get filled by asking the centre, never by estimating.

  `teachers.items[]` is **done** — the centre supplied four tutors with their
  credentials and portraits (Phạm Linh Thư, Hoàng Thu Hương, Dương Trung Kiên,
  Hà Huy Anh). `public/images/tutors/tran-minh-thuy.webp` was supplied alongside
  them but belongs to nobody on that list and is unused; delete it or add a
  fifth entry, but note the grid is `sm:grid-cols-2 lg:grid-cols-4`, so a fifth
  card leaves one orphaned on its own row.

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

`tests/messages/placeholders.test.ts` keeps two registries of `[TODO: ...]`
paths — one per message catalog, one for `lib/site.ts` — and **both are now
empty**. Because empty lists would make the original `describe.each` /
`it.each` shape expand to zero tests and pass silently, the assertions were
rewritten to walk the catalogs and `lib/site.ts` and compare the *set* of
surviving placeholders against the registry. That holds in both directions: a
placeholder filled without its entry being deleted fails, and a **new**
placeholder added without registering it fails too — coverage the old
per-path shape never had. **A red result once real data arrives is still
expected and correct**; the fix is to delete that entry, never to weaken the
assertion. The retirement comments left in the file record what each slot
became, so read them before repurposing a slot again. `SITE_URL` is not on
either list and cannot be — its default is a real domain, not a `[TODO:`
string.

The `tel:` links (header, hero, footer, contact section) and the Zalo link
(hero, contact section) all resolve now, and the Open Graph image is in place.
What is left before launch is re-enabling the consultation form once
submissions have somewhere real to go.

Never invent figures for these — they are advertising claims.

## Advertised scope

The centre takes **grades 1–12** across natural sciences, social sciences,
foreign languages and programming; programming splits into basics, competitive,
and a career track for working adults.

That range is spelled out in five places, four of which are invisible on
screen — `metadata.description`, `footer.tagline`, `app/manifest.ts`,
`SITE_KEYWORDS` in `lib/site.ts`, and the `courses.items[]` cards. It went stale
in all of them once before. `tests/messages/scope.test.ts` is the net: it fails
on any surviving "lớp 6 đến lớp 12" / "THCS và THPT" claim, pins the course-card
count across both locales, and requires the primary-school and programming
keywords to stay in the keyword list.

The career-track course is the one audience the rest of the funnel does not
address: `hero`, `process` and `formats` all speak to a parent about their
child. The registration form's grade field was widened to
**"Lớp / trình độ"** so an adult can complete it — that relabelling is the only
concession, and it is deliberate. Widening the rest of the copy was considered
and rejected: parents are the paying audience and the warm tone is aimed at
them.

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
`app/manifest.ts`'s `theme_color` must be kept in step with `--primary` — it and
the `viewport` export in `app/[locale]/layout.tsx` now read the same
`SITE_THEME_COLOR` constant instead of each carrying the hex.

`public/images/og-image.jpg` (1200x630) is the share card: the full lockup —
wordmark, figure and tagline — brand red on white, which is the one place the
untouched artwork works, since the card is never composited onto the red header
or the ink band. It is a **separate asset from `logo`** in JSON-LD, which stays
the square `logo.png`: Google wants the organisation mark square-ish, and the
share card is neither. See "Open Graph" under SEO above.

## Testing

Vitest + jsdom + `@testing-library/react` (`vitest.config.mts`, setup in
`vitest.setup.ts`). Tests live in `tests/**/*.test.{ts,tsx}` mirroring source
structure. When adding a section or message key, add or extend the matching
test — and extend `tests/messages/placeholders.test.ts`'s path lists if the
new key is still a `[TODO: ...]` placeholder.
