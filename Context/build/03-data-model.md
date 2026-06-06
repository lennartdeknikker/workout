# 03 — Data Model

PostgreSQL, accessed via **Kysely** (typed query builder — no ORM). Schema is defined as plain SQL in
`migrations/*.sql`; Kysely table **interfaces** in `src/lib/server/db/types.ts` give queries their
types. All app tables carry `user_id` and are queried scoped to the authenticated user. History is
**immutable**: `set_log` snapshots the exercise's display fields so editing/deleting an exercise never
rewrites the past.

## 1. Entity overview

- **better-auth tables** — `user`, `session`, `account`, `verification` (managed by better-auth).
- **exercise** — the user's library entry (ExerciseDB snapshot + personal ranges + routine + type).
- **set_log** — one row per performed set (the flat analysis log).

No separate "workout"/"session" table in v1 — a _workout day_ is derived from `set_log` grouped by
`workout_date`. (A future `workout` table for per-day notes is non-breaking.)

## 2. Enums

```sql
CREATE TYPE measurement_type AS ENUM ('strength', 'cardio', 'bodyweight');
CREATE TYPE routine_type     AS ENUM ('push', 'pull', 'legs', 'cardio', 'core');
```

## 3. `exercise` table

| Column                                                                          | Type                                  | Null              | Notes                                          |
| ------------------------------------------------------------------------------- | ------------------------------------- | ----------------- | ---------------------------------------------- |
| id                                                                              | uuid PK (default gen_random_uuid)     | no                |                                                |
| user_id                                                                         | text FK → user.id (ON DELETE CASCADE) | no                | owner                                          |
| name                                                                            | text                                  | no                | display name (from ExerciseDB or custom)       |
| measurement_type                                                                | measurement_type                      | no                | strength \| cardio \| bodyweight               |
| routine                                                                         | routine_type                          | no                | push \| pull \| legs \| cardio \| core         |
| **ExerciseDB snapshot**                                                         |                                       |                   | null for custom exercises                      |
| exercise_db_id                                                                  | text                                  | yes               | upstream `exerciseId`                          |
| gif_url                                                                         | text                                  | yes               | hotlinked URL                                  |
| target_muscles                                                                  | text[]                                | no (default `{}`) |                                                |
| body_parts                                                                      | text[]                                | no (default `{}`) |                                                |
| equipments                                                                      | text[]                                | no (default `{}`) |                                                |
| secondary_muscles                                                               | text[]                                | no (default `{}`) |                                                |
| instructions                                                                    | text[]                                | no (default `{}`) | step strings                                   |
| **Personal target ranges** (all nullable; presence depends on measurement_type) |                                       |                   |                                                |
| sets_min / sets_max                                                             | integer                               | yes               | strength/bodyweight                            |
| weight_min / weight_max                                                         | numeric(6,2)                          | yes               | strength; optional added weight for bodyweight |
| reps_min / reps_max                                                             | integer                               | yes               | strength/bodyweight                            |
| rest_min / rest_max                                                             | integer                               | yes               | seconds                                        |
| duration_min / duration_max                                                     | integer                               | yes               | seconds — cardio                               |
| distance_min / distance_max                                                     | numeric(8,2)                          | yes               | optional — cardio (unit: km, see §6)           |
| resistance_min / resistance_max                                                 | numeric(6,2)                          | yes               | optional — cardio intensity/hardness           |
| created_at                                                                      | timestamptz default now()             | no                |                                                |
| updated_at                                                                      | timestamptz default now()             | no                |                                                |

Indexes: `(user_id)`, `(user_id, routine)`.

> Rationale for flat min/max columns (vs the nested JSON in the original sketch): they're typed,
> validatable, and queryable. The immutable ExerciseDB metadata is kept as arrays/columns; if you
> prefer the exact nested shape from `opzetje.md`, a single `exercise_db_data jsonb` column is an
> acceptable alternative — but ranges should stay as columns.

## 4. `set_log` table — the flat log

One row per performed set. This is the analysis-critical table; keep it append-only in normal use.

| Column                                             | Type                                           | Null | Notes                                               |
| -------------------------------------------------- | ---------------------------------------------- | ---- | --------------------------------------------------- |
| id                                                 | uuid PK                                        | no   |                                                     |
| user_id                                            | text FK → user.id (ON DELETE CASCADE)          | no   |                                                     |
| exercise_id                                        | uuid FK → exercise.id (**ON DELETE SET NULL**) | yes  | null if exercise later deleted                      |
| performed_at                                       | timestamptz                                    | no   | exact timestamp                                     |
| workout_date                                       | date                                           | no   | calendar day in user's tz (grouping key)            |
| set_index                                          | integer                                        | no   | order within this exercise's posted batch (0-based) |
| **measurement values** (by type; unused ones null) |                                                |      |                                                     |
| weight                                             | numeric(6,2)                                   | yes  | strength / bodyweight added weight                  |
| reps                                               | integer                                        | yes  | strength / bodyweight                               |
| duration_seconds                                   | integer                                        | yes  | cardio                                              |
| distance                                           | numeric(8,2)                                   | yes  | cardio (optional)                                   |
| resistance                                         | numeric(6,2)                                   | yes  | cardio (optional)                                   |
| **denormalised snapshot** (for immutable history)  |                                                |      |                                                     |
| exercise_name                                      | text                                           | no   | name at time of logging                             |
| routine                                            | routine_type                                   | no   | routine at time of logging                          |
| measurement_type                                   | measurement_type                               | no   | type at time of logging                             |
| created_at                                         | timestamptz default now()                      | no   |                                                     |

Indexes: `(user_id, workout_date)`, `(user_id, exercise_id)`, `(user_id, performed_at)`.

The snapshot columns (`exercise_name`, `routine`, `measurement_type`) make the log
self-describing for analytics and preserve history when an exercise is edited/deleted.

## 5. Schema & Kysely types

The schema is **plain SQL** (the source of truth), already implemented:

- `migrations/0000_auth.sql` — better-auth's `user`/`session`/`account`/`verification` (captured DDL).
- `migrations/0001_app_tables.sql` — the `measurement_type` / `routine_type` enums and the `exercise`
  and `set_log` tables exactly as specified in §2–§4 (with the indexes and the `ON DELETE` rules).

Kysely queries are typed from `src/lib/server/db/types.ts`, which declares an `AppDB` interface with
`exercise` and `set_log` table types (see the implemented file for the canonical version):

```ts
import type { ColumnType, Generated } from 'kysely';

export type MeasurementType = 'strength' | 'cardio' | 'bodyweight';
export type Routine = 'push' | 'pull' | 'legs' | 'cardio' | 'core';

// Postgres numeric/date come back as strings from the pg driver.
type Numeric = ColumnType<string, string | number, string | number>;

export interface ExerciseTable {
	id: Generated<string>;
	user_id: string;
	name: string;
	measurement_type: MeasurementType;
	routine: Routine;
	// …ExerciseDB snapshot (text[] / nullable) + nullable range columns (see §3)…
}

export interface SetLogTable {
	id: Generated<string>;
	user_id: string;
	exercise_id: string | null;
	performed_at: ColumnType<Date, Date | string, Date | string>;
	workout_date: ColumnType<string, string, string>;
	set_index: number;
	weight: Numeric | null;
	reps: number | null;
	duration_seconds: number | null;
	distance: Numeric | null;
	resistance: Numeric | null;
	exercise_name: string;
	routine: Routine;
	measurement_type: MeasurementType;
	created_at: Generated<ColumnType<Date, Date | string, Date | string>>;
}

export interface AppDB {
	exercise: ExerciseTable;
	set_log: SetLogTable;
}
```

The `db` instance (`new Kysely<AppDB>({ dialect: new PostgresDialect({ pool }) })`) lives in
`src/lib/server/db/index.ts` and shares the `pg` Pool with better-auth.

> Note: `numeric` and `date` come back as **strings** from the `pg` driver — convert at the domain
> boundary (parse to number for sliders/maths, format for display). Keep this in `src/lib/domain`.

## 6. Units & conventions

- **Weight:** kilograms, step 0.25 (matches current UI). `numeric(6,2)`.
- **Distance:** kilometres (default). If you'd rather store metres, keep it consistent and document
  it; the UI label must state the unit. v1 default = **km**.
- **Duration / rest:** **seconds** (integer). The UI may present mm:ss for duration.
- **Resistance:** unitless number (e.g. machine level / RPE-like). Optional.
- **workout_date:** computed at post time from `performed_at` in the **user's local timezone**
  (client sends tz / local date). Grouping and "today" use this column.

## 7. Validation rules (enforced via Zod in `src/lib/schemas`, server + client)

- For every range: both bounds optional, but if both present `min ≤ max`; values ≥ 0.
- `reps`, `sets`, `*_seconds` are positive integers; `weight`, `distance`, `resistance` are ≥ 0 numbers.
- `name` required, 1–120 chars.
- **Cross-field by measurementType** (for a posted set):
  - `strength`: `weight` and `reps` required; cardio fields must be null.
  - `bodyweight`: `reps` required; `weight` optional (added weight); cardio fields null.
  - `cardio`: `duration_seconds` required; `distance`/`resistance` optional; `weight`/`reps` null.
- Ownership: server always sets `user_id` from the session, never from the request body.

## 8. better-auth tables

better-auth creates and owns `user`, `session`, `account`, `verification`. Their DDL was produced by
`@better-auth/cli migrate` (against `better-auth.config.ts`) and committed verbatim as
`migrations/0000_auth.sql` so the runtime needs no CLI. `user.id` is `text`; app tables FK to
`"user"(id)` (the name is a reserved word, so it's quoted). When you change the auth config or upgrade
better-auth, regenerate that file (migrate against a scratch DB, re-dump the four tables) — don't
hand-edit it. App code should not write to these tables directly; go through better-auth.
