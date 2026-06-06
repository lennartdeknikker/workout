# Trainmate

Mobile-first, multi-user **workout-tracking PWA**. A lifter maintains their own exercise library
(seeded by searching the free ExerciseDB API) and logs every set into a flat, analysis-friendly log,
then reviews history. Self-hosted on a Raspberry Pi (Docker + Postgres), internet-exposed over HTTPS.

> **This repo is being rebuilt from scratch.** The existing Svelte code (Firebase auth, Netlify,
> static-JSON exercises) is a **UI/interaction reference only** — not a base to extend. The dumbbell
> brand, Rubik font, monochrome styling, slider+number inputs, set-badge pattern, and slide-out rest
> timer should be preserved; everything else is new.

## ⭐ Start here: the build context

The complete, decision-locked spec lives in **`Context/build/`**. Read it before writing code:

1. `Context/build/00-overview.md` — summary, **locked decisions**, glossary
2. `Context/build/01-product-spec.md` — features, flows, screens, acceptance criteria
3. `Context/build/02-architecture.md` — stack, structure, deployment, networking, PWA, security
4. `Context/build/03-data-model.md` — Postgres schema, Drizzle, types, validation
5. `Context/build/04-api-and-routes.md` — routes, endpoints, ExerciseDB proxy, actions
6. `Context/build/05-ui-ux.md` — design system, components, the progressive multi-tab form
7. `Context/build/06-testing.md` — TDD workflow + concrete test inventory
8. `Context/build/07-roadmap.md` — phased milestones

`Context/current-ui.png` is the visual reference. `Context/opzetje.md` is the original idea note.

## Tech stack (locked)

SvelteKit + Svelte 5 (runes) · TypeScript (strict) · PostgreSQL · Drizzle ORM + drizzle-kit ·
better-auth (email+password, multi-user) · `adapter-node` · Zod · Vitest + vitest-browser-svelte ·
Playwright · Docker (ARM64) · PWA (`@vite-pwa/sveltekit`) · Cloudflare Tunnel/Caddy for HTTPS.

## Non-negotiable rules

- **TDD.** Write failing tests with/before implementation; keep `Context/build/06-testing.md` honest.
- **Per-user data isolation.** Every query is scoped by `userId` from the session — never trust the
  client for ownership. Two users must never see each other's data.
- **Immutable history.** `set_log` snapshots exercise name/routine/measurementType; editing or
  deleting an exercise must not alter past logs.
- **measurementType drives the UI:** `strength` (weight+reps), `bodyweight` (reps + optional weight),
  `cardio` (duration + optional distance/resistance — **never** prompt sets/reps/weight).
- **ExerciseDB only via our server proxy** (`/api/exercise-search`): upstream needs a browser-like
  `User-Agent` and uses `?search=` (not `q`); GIFs are **hotlinked**, not stored.
- **Keep pure logic in `src/lib/domain`** (no SvelteKit/DB imports) so it's unit-testable.
- **No indexing:** `robots.txt` Disallow + global `noindex`. `static/documents/*.pdf` stay shipped but
  are **not linked in the UI**.
- **Secrets server-side only.** Never expose `DATABASE_URL`/`BETTER_AUTH_SECRET`; only `PUBLIC_*` vars
  reach the browser. Don't commit `.env`.

## Commands

```bash
npm run dev          # local dev server
npm run build        # production build (adapter-node → build/)
npm run check        # svelte-check / tsc
npm run lint         # prettier --check + eslint
npm run test         # vitest (unit + component)   [add in Phase 0]
npm run test:e2e     # playwright                   [add in Phase 0]
# drizzle: generate/apply migrations via drizzle-kit (see Context/build/02 & 03)
# docker: `docker compose -f docker/docker-compose.yml up` (app + postgres)
```

## Conventions

- Path aliases: `$components`, `$lib` (+ `$server` → `src/lib/server` if added). Keep existing style.
- Numeric DB columns come back as **strings** (Drizzle) — convert at the domain boundary.
- Prefer SvelteKit `load` + form actions over ad-hoc client fetch; `+server.ts` only for the
  ExerciseDB typeahead.
- Match the surrounding code's style; minimal monochrome UI; large tap targets (≥44px); mobile-first.
- Conventional, focused commits. Don't commit/push unless asked.
