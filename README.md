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

The centre's real details are still placeholders written as `[TODO: ...]` in
`lib/site.ts` and `messages/{vi,en}.json`. See the "Unfilled content" section
of `CLAUDE.md` for the exact list — it includes the phone number and Zalo
link, so the `tel:` links (header, hero, footer, contact section) and the
Zalo links (hero, contact section) will not work until those are filled in.
`tests/messages/placeholders.test.ts` guards against silently overwriting a
placeholder with an invented figure.
