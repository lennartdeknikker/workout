# 07 — Build Roadmap

Phased plan. Each phase is independently shippable/testable and ends with green tests. TDD throughout
(write tests with/before implementation). Earlier phases unblock later ones.

## Phase 0 — Project reset & toolchain

- Remove Firebase, adapter-netlify, `netlify.toml`, unused `src/constants/*.json`, old session/auth bits.
- Add deps: drizzle-orm, drizzle-kit, postgres driver, better-auth, zod, @vite-pwa/sveltekit, vitest,
  vitest-browser-svelte, @playwright/test.
- Switch to `adapter-node`. Set up Vitest + Playwright configs and npm scripts.
- Add `.env.example`, `robots.txt`, global `noindex`.
- **Done when:** `npm run check`, `lint`, `test` (empty), and a hello-world e2e all pass; app boots.

## Phase 1 — Database & infra skeleton

- `docker/Dockerfile` (multi-stage, arm64) + `docker-compose.yml` (app + postgres + volume + healthcheck).
- Drizzle: `schema.ts` (enums, `exercise`, `set_log`), `drizzle.config.ts`, first migration, boot migrate.
- DB client + repository stubs. Testcontainers/compose test DB wired into Vitest/Playwright.
- **Done when:** `docker compose up` runs app + db; migrations apply; a repo round-trip test passes.

## Phase 2 — Auth (better-auth)

- Configure better-auth (email+password, Drizzle adapter); generate its tables into migrations.
- `hooks.server.ts` session resolution + route guard; `app.d.ts` locals.
- `/signup`, `/login`, `/account` (sign-out) pages + actions; redirect logic.
- **Done when:** e2e #1 (sign up → guarded `/workout` → sign out → sign in) passes; unauth redirects work.

## Phase 3 — Exercise library + ExerciseDB proxy

- `src/lib/server/exercisedb.ts` (User-Agent, `search=`, timeout, mapping incl. `Step:` strip) + unit tests.
- `/api/exercise-search` and `/api/exercise-search/[id]` endpoints (auth-guarded).
- `/exercises` list, `/exercises/new` (search + create, custom path), `/exercises/[id]/edit` (update/delete).
- Zod `exerciseSchema`; conditional range UI by measurementType; `ExerciseSearch`, `RangeInput`, `ExerciseForm`.
- **Done when:** e2e #2 & #3 pass (add from search, add custom, add cardio); CRUD unit/component tests green.

## Phase 4 — Workout logging (the core)

- `workoutDrafts` store (tabs ≤3, commit/remove sets, posted state, localStorage) + unit tests.
- `DraftForm` 3-step machine + `WorkoutTabs` (+ button, checkmarks, auto-close) + `SetBadge`.
- `/workout/post` action with per-type validation, transactional insert, idempotency (draftId), snapshotting.
- Port `Timer`/`TimerBar`.
- **Done when:** e2e #4, #5, #6, #9 pass (log strength, multi-tab cardio, checkmarks, draft persistence).

## Phase 5 — Today overview & History

- `/workout` load (today's grouped sets, focus area, zero state).
- `/history` list (days + focus labels) and `/history/[date]` detail; `computeFocusArea`, `groupSetsByExercise`.
- **Done when:** e2e #7 & #8 pass (history listing/detail, delete keeps history); domain unit tests green.

## Phase 6 — PWA & polish

- `@vite-pwa/sveltekit`: manifest, icons, service worker (shell precache, network-first data).
- Responsive pass, reduced-motion, loading/disabled states, error toasts.
- **Done when:** installable on a phone over HTTPS; Lighthouse PWA checks pass.

## Phase 7 — Deployment & hardening (Raspberry Pi)

- Cloudflare Tunnel (recommended) or Caddy TLS; set `BETTER_AUTH_URL`/`PUBLIC_APP_URL`.
- Security headers/CSP (allow `static.exercisedb.dev` images), rate-limit auth + proxy.
- `pg_dump` backup cron + restore doc; README run/deploy instructions.
- **Done when:** reachable at the public HTTPS hostname from a phone, installable, multi-user isolation
  verified (e2e #10), backups produce a restorable dump.

## Suggested order of first tests to write (TDD seeds)

1. `computeFocusArea` (Phase 5 logic, but pure & quick — good warm-up).
2. Per-type set validators + `validateRange` (Phase 3/4).
3. `workoutDrafts` store behaviour (Phase 4).
4. `mapExerciseDbDetail` (Phase 3).
5. Auth e2e happy path (Phase 2).

## Out of scope for v1 (do not build, keep data-model-compatible)

In-app analytics/charts, workout programming/templates, supersets, RPE/RIR, bodyweight tracking,
sharing, native apps, offline writes, email verification/password reset (can add post-v1).
