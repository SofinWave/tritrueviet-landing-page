# Trí Tuệ Việt — Landing Page

Bilingual (Vietnamese / English) marketing landing page for the Trí Tuệ Việt
tutoring centre. Next.js 16 App Router, Tailwind v4, shadcn/ui, next-intl.

## Getting started

Package manager is **pnpm 11.9.0** — do not use `npm` or `yarn`.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 — it redirects to `/vi/home`. Switch to English
with the language switcher in the header, which moves between `/vi/home` and
`/en/home`.

## Scripts

```bash
pnpm dev            # dev server (Turbopack)
pnpm build          # production build
pnpm start          # serve production build
pnpm test           # run the test suite once (vitest)
pnpm test:watch     # vitest watch mode
pnpm lint           # eslint
pnpm lint:fix       # eslint --fix
pnpm format         # biome format --write
pnpm format:check   # biome format check (what CI runs)
```

## Docker

Docker workflows are wrapped as [mise](https://mise.jdx.dev) file tasks,
namespaced `local:*` (development) and `prod:*` (production):

```bash
mise tasks ls           # list every local:* and prod:* task
mise run local:up       # start the local dev containers
mise run local:dev      # run the Next.js dev server inside the container
mise run local:connect  # open a bash shell inside the container
mise run prod:up        # start the production containers
```

Copy `.env.example` to `.env` first and set `UID_HOST_USER` / `GID_HOST_USER`
to your own `id -u` / `id -g` so bind-mounted files keep the right ownership.

## Before launch

The centre has supplied its real details — no `[TODO: ...]` placeholder is
left in `lib/site.ts` or `messages/{vi,en}.json`, and
`tests/messages/placeholders.test.ts` now fails if one is either filled without
being deregistered or added without being registered. See the "Unfilled
content" section of `CLAUDE.md` for what each slot became and why.

Three things are still outstanding:

- **No Open Graph image.** `app/[locale]/layout.tsx` declares
  `twitter.card: "summary_large_image"` but ships no image, so shared links
  render blank.
- **The consultation form is switched off.** `CONSULTATION_FORM_ENABLED` in
  `lib/site.ts` is `false`, so every field and the submit button render
  disabled behind a short explanatory line. Flip it once submissions have
  somewhere real to go — `app/actions/consultation.ts` still only logs them.
- **`NEXT_PUBLIC_SITE_URL` on non-production deploys.** `SITE_URL` now defaults
  to the real `https://tritueviet.org`, which means a staging build that leaves
  this unset will advertise the production domain as its own canonical, in
  `sitemap.ts`, `robots.ts`, every `alternates` block and all four JSON-LD
  nodes. It is baked into the image at `docker build` time (see
  `.docker/production/node/Dockerfile`), not read at container runtime — set it
  before building, not after.
