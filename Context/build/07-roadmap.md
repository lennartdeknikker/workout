# 07 — Build Roadmap

Phased plan. Each phase is independently shippable/testable and ends with green tests. TDD throughout
(write tests with/before implementation). Earlier phases unblock later ones.

## Phase 0 — Project reset & toolchain ✅ DONE

- Removed Firebase, adapter-netlify, `netlify.toml`, static-JSON exercises, old session/auth.
- Fresh `sv` scaffold: SvelteKit 2 + Svelte 5, `adapter-node`, Vitest (+ vitest-browser-svelte),
  Playwright, ESLint, Prettier. `$components`/`$server` aliases, `robots.txt` Disallow + `noindex`.
- **Verified:** `npm run check`, `lint`, `build`, `test:unit` all green.

## Phase 1 — Database & infra skeleton ✅ DONE

- `docker/docker-compose.yml` (postgres + app, volume, healthcheck; host port 5544) + multi-stage `docker/Dockerfile`.
- `migrations/0000_auth.sql` + `migrations/0001_app_tables.sql` (enums, `exercise`, `set_log`, indexes, FKs).
- `scripts/migrate.js` (CLI-free SQL runner, `_app_migrations`); typed Kysely `db` + `AppDB` types.
- **Verified:** dropping/recreating the schema and running the runner rebuilds all 7 tables.
- _Remaining:_ Testcontainers/compose test DB wired into Vitest/Playwright (do with Phase 3+ tests).

## Phase 2 — Auth (better-auth) ✅ CORE DONE

- better-auth (email+password) on the shared `pg` pool; `sveltekitCookies` plugin; auth schema captured to SQL.
- `hooks.server.ts` session resolution + route guard; `app.d.ts` locals typed from `auth.$Infer.Session`.
- `/login`, `/signup` pages (authClient) + sign-out; redirect-with-`?redirect=` logic.
- **Verified (curl smoke):** sign-up 200 + session, get-session 200, `/workout` 200 with cookie /
  303→`/login` without, sign-in 200, wrong password 401, user row persisted.
- _Remaining:_ `/account` page; convert e2e #1 into a Playwright spec; password-strength UX polish.

## Phase 3 — Exercise library + ExerciseDB proxy ✅ DONE

- `src/lib/server/exercisedb.ts` (User-Agent, `search=`, 5s timeout) + pure `mapExerciseDbDetail`/`stripStepPrefix` in `$lib/domain` (unit-tested).
- `/api/exercise-search` and `/api/exercise-search/[id]` endpoints (401 when unauthenticated).
- `/exercises` list (grouped by routine), `/exercises/new` (search + create, custom path), `/exercises/[id]/edit` (update/delete); nav in layout.
- Zod `exerciseInputSchema` (coerce + min≤max, unit-tested); `ExerciseForm` (conditional ranges by measurementType), `ExerciseSearch` (debounced typeahead), `RangeInput`.
- Exercise repository (Kysely CRUD, user-scoped); shared `parseExerciseForm` helper.
- **Verified (curl smoke):** search 401 without auth / results with auth, short-query empty, detail 200, create persists (strength + cardio), no-JS POST → 303, validation failure → 400 with message. `check`/`lint`/`build` green; 16 unit/component tests pass.
- _Remaining:_ Playwright e2e #2/#3; ExerciseSearch + ExerciseForm component tests; CSRF/rate-limit polish.

## Phase 4 — Workout logging (the core) ✅ CORE DONE

- `workoutDrafts` store (tabs ≤3, commit/remove sets, posted state, localStorage persist/hydrate) + unit tests.
- Domain: `formatSetBadge`, `formatDuration`, `localWorkoutDate` + unit tests; per-type set schemas (`setSchemaFor`) + tests.
- `DraftForm` 3-step machine + `WorkoutTabs` (+ button, checkmarks, auto-close) + `SetBadge`; `RestTimer` (1/2/3-min) in layout.
- `/api/workout` POST (auth, per-type validation, server-derived `workout_date` from tz, transactional insert, snapshotting, in-memory idempotency by `draftId`); `setLog` repository.
- **Verified (curl):** strength 3 sets → 3 rows (indexed, snapshotted); duplicate draftId → `duplicate:true` (no dupes); cardio duration+distance → 1 row; reps-on-cardio → 400. `check`/`lint`/`build` green; 34 unit/component tests pass.
- _Remaining:_ Playwright e2e #4/#5/#6/#9; DraftForm/WorkoutTabs component tests; richer timer UI (Phase 6).

## Phase 5 — Today overview & History ✅ DONE

- Domain (+ tests): `computeFocusArea`, `summariseRoutines`, `groupSetsByExercise`, `formatLoggedSet`, `formatDayLabel`.
- History repository: `getDaySets` + `listWorkoutDays` (SQL group-by aggregate, per-day focus area); row mapper.
- `/workout` today overview (grouped sets + focus chip + zero state) with `tz` cookie so the server derives "today" in the user's zone; `ExerciseGroupList` shared component.
- `/history` list (day label + focus + totals) and `/history/[date]` detail (404 for empty/invalid days); History added to nav.
- Fix: `pg` now returns `date` as a `'YYYY-MM-DD'` string (type parser) — matches types, avoids tz shifts.
- **Verified (curl):** today shows logged sets + push focus; history lists Mon 1 Jun (legs) + Sat 6 Jun (push); detail renders past sets (incl. a deleted-exercise snapshot); empty day → 404. `check`/`lint`/`build` green; 43 tests pass.
- _Remaining:_ Playwright e2e #7/#8.

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
