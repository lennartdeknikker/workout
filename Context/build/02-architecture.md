# 02 — Technical Architecture

## 1. Stack summary

| Concern              | Choice                                   | Notes                                                       |
| -------------------- | ---------------------------------------- | ----------------------------------------------------------- |
| Framework            | SvelteKit (Svelte 5 runes)               | SSR + form actions + endpoints                              |
| Language             | TypeScript (strict)                      | TS everywhere feasible                                      |
| Adapter              | `@sveltejs/adapter-node`                 | Long-lived Node server in Docker (replaces adapter-netlify) |
| DB                   | PostgreSQL 16                            | Single datastore                                            |
| ORM                  | Drizzle ORM + drizzle-kit                | Typed schema + SQL migrations                               |
| Auth                 | better-auth (Drizzle adapter)            | Email+password, session cookies                             |
| Validation           | Zod                                      | Shared client/server schemas                                |
| Styling              | Scoped Svelte CSS + design tokens        | No heavy UI framework (keep it light for the Pi)            |
| Unit/component tests | Vitest + vitest-browser-svelte           |                                                             |
| E2E tests            | Playwright                               | Against a real Postgres test DB                             |
| Runtime              | Node 20 LTS (ARM64)                      | Matches Raspberry Pi                                        |
| Package manager      | npm                                      | Lockfile already present                                    |
| Container            | Docker + docker compose                  | app + postgres                                              |
| Ingress/TLS          | Cloudflare Tunnel (recommended) or Caddy | Public HTTPS without port-forwarding                        |
| PWA                  | `@vite-pwa/sveltekit`                    | Manifest + service worker                                   |

## 2. Repository structure (target)

Keep the existing path-alias style (`$components`, `$interfaces`/`$lib`, etc.) and extend it.

```
workout/
├─ src/
│  ├─ app.html
│  ├─ app.d.ts                 # App.Locals.user / session types
│  ├─ hooks.server.ts          # better-auth session → event.locals; route guards
│  ├─ lib/
│  │  ├─ server/
│  │  │  ├─ db/
│  │  │  │  ├─ index.ts        # drizzle client (pg Pool)
│  │  │  │  ├─ schema.ts       # Drizzle tables (see 03)
│  │  │  │  └─ migrate.ts      # run migrations on boot
│  │  │  ├─ auth.ts            # better-auth server instance
│  │  │  ├─ exercisedb.ts      # ExerciseDB proxy client (server-only, sets User-Agent)
│  │  │  └─ repositories/      # query funcs: exercises.ts, setLog.ts, history.ts
│  │  ├─ auth-client.ts        # better-auth client
│  │  ├─ schemas/              # Zod schemas shared by forms + server
│  │  ├─ stores/
│  │  │  ├─ workoutDrafts.ts   # tabs/drafts store (localStorage-backed)
│  │  │  └─ timer.ts
│  │  ├─ domain/               # PURE functions (focus-area, range validation, badge formatting)
│  │  └─ types.ts              # shared TS types
│  ├─ components/              # Svelte components (Navigation, Timer, TimerBar, forms, …)
│  └─ routes/
│     ├─ +layout.svelte        # shell, nav, timer bar, PWA bits
│     ├─ +layout.server.ts     # expose locals.user
│     ├─ (auth)/login/         # +page.svelte + actions
│     ├─ (auth)/signup/
│     ├─ workout/              # today overview + /new logging form
│     ├─ history/              # list + [date] detail
│     ├─ exercises/            # list, new, [id]/edit (CRUD via form actions)
│     ├─ account/
│     └─ api/
│        └─ exercise-search/   # +server.ts (search) and [id]/+server.ts (detail)
├─ drizzle/                    # generated migrations
├─ drizzle.config.ts
├─ tests/
│  ├─ unit/                    # vitest (domain, stores, schemas)
│  └─ e2e/                     # playwright specs + fixtures
├─ static/
│  ├─ documents/               # PDFs kept, NOT linked in UI
│  ├─ robots.txt               # Disallow: /  (excluded from indexing)
│  ├─ manifest.webmanifest
│  └─ icons/                   # PWA icons
├─ docker/
│  ├─ Dockerfile
│  └─ docker-compose.yml
├─ Caddyfile                   # only if using Caddy ingress
└─ ...config (vite, svelte, ts, eslint, prettier, playwright, vitest)
```

> Migration note: delete Firebase (`src/lib/firebase.client.ts`, `session.ts`, `GoogleLogin.svelte`),
> the Netlify adapter, and `firebase` from package.json. The static exercise JSON in `src/constants/`
> is **not** used (fresh DB) — keep only as reference if helpful, otherwise remove.

## 3. Environment variables

`.env` (server-only unless prefixed `PUBLIC_`). Provide `.env.example`.

```
# Database
DATABASE_URL=postgres://trainmate:CHANGEME@db:5432/trainmate

# better-auth
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://trainmate.example.com   # public origin, used for cookies/redirects

# Public origin exposed to the client
PUBLIC_APP_URL=https://trainmate.example.com

# ExerciseDB (defaults baked in; override if the OSS instance moves)
EXERCISEDB_BASE_URL=https://oss.exercisedb.dev/api/v1
```

Never expose `DATABASE_URL` or `BETTER_AUTH_SECRET` to the client. Only `PUBLIC_*` vars reach the browser.

## 4. Auth architecture (better-auth)

- Configure better-auth in `src/lib/server/auth.ts` with the **Drizzle adapter** and the
  **email+password** provider enabled (no email verification required in v1; can enable later).
- better-auth owns its tables (`user`, `session`, `account`, `verification`) — generated via its
  Drizzle schema/CLI and included in `drizzle/` migrations (see `03-data-model.md`).
- `hooks.server.ts`:
  - On every request, resolve the session from the cookie and set `event.locals.user` / `session`.
  - **Route guard:** if the path is not under `(auth)` and there's no session → redirect to
    `/login?redirect=<path>`. Allow `/api/exercise-search` only for authenticated users too.
- All repository queries are **scoped by `userId = locals.user.id`** — enforced server-side, never
  trusting client input for ownership.

## 5. ExerciseDB integration (server-side proxy — important)

Direct browser/WebFetch calls to ExerciseDB returned **403** without a browser-like `User-Agent`,
and the search uses the **`search`** query param (not `q`). Therefore **all ExerciseDB calls go
through our own server endpoints**, never from the browser directly. This avoids CORS, hides the
upstream, lets us set headers, and lets us add caching/rate-limiting.

- **Search:** `GET {EXERCISEDB_BASE_URL}/exercises/search?search=<q>&limit=10`
  → upstream returns `{ success, data: [{ exerciseId, name, gifUrl }] }` (abbreviated).
- **Detail:** `GET {EXERCISEDB_BASE_URL}/exercises/{exerciseId}`
  → `{ success, data: { exerciseId, name, gifUrl, targetMuscles[], bodyParts[], equipments[], secondaryMuscles[], instructions[] } }`.
- Our client (`src/lib/server/exercisedb.ts`) sets a `User-Agent` header, applies a timeout
  (e.g. 5 s), and maps upstream → our DTOs. On error it returns an empty/typed error result so the
  UI degrades to "add custom exercise".
- Optional: a short in-memory LRU cache (search + detail) to be kind to the OSS API.

## 6. Deployment — Raspberry Pi + Docker

### docker compose (app + db)

- **db:** `postgres:16` (multi-arch, runs on arm64). Named volume for persistence. Healthcheck.
- **app:** built from `docker/Dockerfile`. Depends on db (healthy). Runs migrations on boot, then
  starts the Node server (`node build`). Exposes port 3000 internally.
- Restart policy `unless-stopped`. `.env` provides secrets.

### Dockerfile (multi-stage, ARM64-friendly)

1. `deps` — `npm ci`.
2. `build` — `npm run build` (adapter-node → `build/`), prune to prod deps.
3. `runtime` — `node:20-bookworm-slim` (or `-alpine` if native modules behave), copy `build/` +
   prod `node_modules`, `CMD ["node","build"]`. Run as non-root.

### Migrations on boot

`src/lib/server/db/migrate.ts` runs `drizzle-kit` migrations (or `migrate()` from drizzle) before
the server accepts traffic. Idempotent.

### Backups

Document a `pg_dump` cron on the Pi writing to an external/USB volume; restore instructions in README.

## 7. Networking, HTTPS & public exposure

The app is internet-exposed and installable, but the Pi is typically behind home NAT.

**Recommended: Cloudflare Tunnel.**

- Run `cloudflared` (as a 3rd compose service or host daemon) bound to the app's internal port.
- Cloudflare provides a public hostname with automatic TLS; **no port-forwarding, no exposed home IP.**
- Set `BETTER_AUTH_URL` / `PUBLIC_APP_URL` to the public hostname.

**Alternative: Caddy reverse proxy** (if you own a domain pointing at your public IP and can forward
443). `Caddyfile` reverse-proxies `:443` → `app:3000` with automatic Let's Encrypt TLS.

**Security baseline (required because it's public):**

- HTTPS only; `Secure`, `HttpOnly`, `SameSite=Lax` session cookies (better-auth defaults).
- Set security headers (CSP allowing `static.exercisedb.dev` images, HSTS, `X-Content-Type-Options`,
  frame-ancestors none) — via SvelteKit `handle` hook or Caddy.
- Rate-limit auth endpoints and the ExerciseDB proxy.
- Strong `BETTER_AUTH_SECRET`; never commit `.env`.

## 8. PWA

- `@vite-pwa/sveltekit` with `manifest.webmanifest` (name "Trainmate", standalone display, theme/bg
  colors from tokens, icons in `static/icons/`).
- Service worker: precache the app shell + static assets; **network-first** for data (logging requires
  online). ExerciseDB GIFs are cross-origin and **not** precached (hotlinked, accepted to fail offline).
- Installability: served over HTTPS (satisfied by §7), valid manifest, registered SW.

## 9. Indexing exclusion

- `static/robots.txt`: `User-agent: *` / `Disallow: /`.
- Global `<meta name="robots" content="noindex, nofollow">` in `app.html` / root layout.
- `static/documents/*.pdf` stay shipped but are **not linked anywhere in the UI** and are covered by
  the global disallow. (Matches the existing "prevent indexing" intent in git history.)

## 10. Config changes from current repo

- `svelte.config.js`: swap adapter to `adapter-node`; keep/extend aliases (`$components`,
  `$lib`, add `$server` → `src/lib/server` if desired).
- Remove `firebase`, `@sveltejs/adapter-netlify`, `netlify.toml`.
- Add: `drizzle-orm`, `drizzle-kit`, `postgres`/`pg`, `better-auth`, `zod`, `@vite-pwa/sveltekit`,
  `vitest`, `vitest-browser-svelte`, `@playwright/test`.
- Keep Rubik font + the minimal black/white aesthetic.
