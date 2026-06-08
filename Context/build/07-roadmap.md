# 07 — Build Roadmap

Phased plan. Each phase is independently shippable/testable and ends with green tests. TDD throughout
(write tests with/before implementation). Earlier phases unblock later ones.

## ✅ Test coverage (complete)

- **Unit + component (Vitest):** 52 tests — domain (exercisedb mapping, ranges, set/badge formatting,
  focus-area, grouping, schemas) + components (RangeInput, SetBadge, WorkoutTabs, ExerciseSearch, DraftForm).
- **E2E (Playwright):** all 10 acceptance criteria (`06-testing.md §5`) pass against a production
  `preview` build + an isolated `trainmate_test` Postgres (created/migrated in global-setup, truncated
  per test). ExerciseDB is stubbed via route interception; auth via the API helper; rate-limiting
  disabled in the test env. Run with `npm run test:e2e` (needs the dev Postgres up on :5544).
- Note: Playwright's `selectOption` doesn't update a Svelte 5 `<select>` that drives a conditional
  re-render (a real `change` event does), so tests pick via the `chooseSelect` helper. Not a user-facing bug.

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

## Phase 6 — PWA & polish ✅ CORE DONE

- `@vite-pwa/sveltekit` (registerType autoUpdate): manifest (standalone, theme/bg, scope `/`, start_url `/workout`), service worker precaching the app shell + assets. Disabled under Vitest.
- Trainmate dumbbell icon: `static/icons/icon-source.svg` → 192/512/maskable/apple-touch PNGs via `scripts/gen-icons.mjs` (`npm run icons`, uses sharp).
- Manifest `<link>` injected via `virtual:pwa-info`; SW registered in the layout (`virtual:pwa-register`); apple-touch-icon + apple-mobile-web-app meta in `app.html`.
- Polish: Post button disabled + "Posting…" while in flight (complements idempotency); search/auth already have loading/disabled states.
- **Verified:** build emits `manifest.webmanifest` + `sw.js` (+ workbox) with icons precached; dev serves `/manifest.webmanifest` (200) and injects the manifest link. `check`/`lint`/`build` green; 43 tests pass.
- _Remaining:_ confirm install + Lighthouse PWA on the real HTTPS deploy (Phase 7); optional offline fallback page; reduced-motion sweep.

## Phase 7 — Deployment & hardening (Raspberry Pi) ✅ APP-SIDE DONE

- **Security headers** (HSTS in prod, `X-Frame-Options: DENY`, `X-Content-Type-Options`, Referrer-Policy,
  Permissions-Policy) + **CSP** (`svelte.config.js`, auto-nonce; allows `static.exercisedb.dev` imgs,
  `worker-src self`) via `hooks.server.ts` (`sequence`).
- **Rate limiting** (in-memory, per-IP): 30/min auth, 60/min ExerciseDB proxy → 429.
- **adapter-node behind proxy**: `ORIGIN` + `PROTOCOL/HOST/ADDRESS_HEADER` env (compose + `.env.example`).
- **Ingress**: compose `tunnel` profile (`cloudflared` + `TUNNEL_TOKEN`) and `caddy` profile (+ `Caddyfile`);
  app port no longer host-published in prod; Postgres bound to `127.0.0.1`.
- **Backups**: `scripts/backup.sh` (gzipped `pg_dump`, keep 14) + cron + restore in `DEPLOYMENT.md`.
- **Verified locally:** `node build` emits all headers + CSP; full flow drives under CSP with **0 violations**;
  hammering the proxy returns 429s; all compose profiles `config`-validate. `check`/`lint`/`build` green; 43 tests.
- _Runs on your hardware (not verifiable here):_ create the Cloudflare Tunnel / point the domain, launch the
  chosen profile, confirm phone install + Lighthouse PWA, schedule the backup cron. See `DEPLOYMENT.md`.

## Suggested order of first tests to write (TDD seeds)

1. `computeFocusArea` (Phase 5 logic, but pure & quick — good warm-up).
2. Per-type set validators + `validateRange` (Phase 3/4).
3. `workoutDrafts` store behaviour (Phase 4).
4. `mapExerciseDbDetail` (Phase 3).
5. Auth e2e happy path (Phase 2).

## Out of scope for v1 (do not build, keep data-model-compatible)

In-app analytics/charts, workout programming/templates, supersets, RPE/RIR, bodyweight tracking,
sharing, native apps, offline writes, email verification/password reset (can add post-v1).
