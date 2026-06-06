# Trainmate — Build Context (Index)

This folder is the **complete, self-contained context** for rebuilding Trainmate, a
personal/multi-user workout-tracking PWA. A competent team (human or AI) should be able to
build the app end-to-end from these documents **without further product clarification**.

Read the documents in order:

| #   | Document                     | What it covers                                                                                  |
| --- | ---------------------------- | ----------------------------------------------------------------------------------------------- |
| 00  | `00-overview.md` (this file) | Summary, locked decisions, glossary                                                             |
| 01  | `01-product-spec.md`         | Vision, users, feature specs, user flows, screen-by-screen behaviour, acceptance criteria       |
| 02  | `02-architecture.md`         | Tech stack, repo structure, deployment (Docker + Raspberry Pi), networking/HTTPS, PWA, security |
| 03  | `03-data-model.md`           | Postgres schema, Drizzle definitions, TypeScript types, validation rules                        |
| 04  | `04-api-and-routes.md`       | SvelteKit routes, server endpoints, ExerciseDB proxy, form actions                              |
| 05  | `05-ui-ux.md`                | Design system, components, the progressive-disclosure multi-tab form, navigation, timer         |
| 06  | `06-testing.md`              | TDD workflow, unit/component/e2e tooling, concrete test inventory                               |
| 07  | `07-roadmap.md`              | Phased milestones and task breakdown                                                            |

The root `CLAUDE.md` holds engineering conventions and points back here.

---

## What Trainmate is

A mobile-first app to **log gym workouts set-by-set** and review history. The user maintains
their **own library of exercises** (seeded by searching the free [ExerciseDB](https://oss.exercisedb.dev)
API, then enriched with personal target ranges). During a workout they pick a routine →
exercise, commit sets, and post them. A flat, analysis-friendly log records every individual
set. A rest timer is always available.

The app is **rebuilt from scratch** — the existing repo (Firebase + Netlify + static JSON
exercises) is a **reference for UI style and the form interaction only**, not a codebase to
extend. See `05-ui-ux.md` for which parts of the old UI to preserve.

---

## Locked product & technical decisions

These were decided with the product owner and are **not open for re-litigation** during the build.

### Product

- **Multi-user** with real accounts. Each user has their **own** exercise library and workout log; data is strictly per-user.
- **Auth:** email + password only, via **better-auth**. No Google/OAuth, no magic links (for v1).
- **Three exercise measurement types**, set explicitly per exercise (`measurementType`):
  - `strength` → logs **weight + reps** (per set).
  - `cardio` → logs **duration** (+ **optional** distance, + **optional** resistance/intensity). **No** sets/reps/weight prompts.
  - `bodyweight` → logs **reps** (+ **optional** added weight). Covers core/calisthenics.
- **Routines:** `push | pull | legs | cardio | core` (organizational tag, independent of measurement type).
- **ExerciseDB GIFs are hotlinked** from `static.exercisedb.dev` (we store the URL, not the file). No local media caching. (Implication: GIFs don't work offline — accepted.)
- **Start fresh:** empty database. No seed data, no migration from the old Firebase app.
- **Cheat-sheet PDFs** stay in `static/documents/` but are **removed from the UI** and **excluded from search-engine indexing**.

### Technical

- **SvelteKit + Svelte 5 + TypeScript** (TS everywhere it's possible).
- **PostgreSQL** as the only datastore.
- **Drizzle ORM** + `drizzle-kit` migrations.
- **better-auth** for authentication (Drizzle adapter).
- **adapter-node** (replacing adapter-netlify) — the app runs as a long-lived Node server.
- Runs **on a Raspberry Pi in Docker** (`docker compose`: app + Postgres). ARM64.
- **Internet-exposed + installable PWA.** Reached via a public hostname over **HTTPS**;
  recommended path is a **Cloudflare Tunnel** (no port-forwarding) — see `02-architecture.md`.
- **Test-driven development.** Unit/component tests with **Vitest** + `vitest-browser-svelte`;
  end-to-end with **Playwright**. Tests are written before/with the implementation.

---

## Glossary

- **Exercise** — a row in the user's library (e.g. "Incline Barbell Bench Press"): the ExerciseDB
  metadata snapshot + the user's target ranges + routine + measurementType.
- **Set** — one performed effort. A `set_log` row. The atomic unit of analysis.
- **Workout day** — all sets a user logged on one calendar date (their local timezone). Derived
  from `set_log`, not a stored entity in v1.
- **Draft / tab** — an in-progress exercise the user is logging but hasn't posted yet. Up to 3
  drafts open simultaneously as tabs. Client-side state, persisted to `localStorage`.
- **Post** — committing all the sets of one draft to the database as `set_log` rows.
- **Focus area** — the label for a past workout day = the routine with the most exercises that day.
