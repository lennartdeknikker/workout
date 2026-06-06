# 04 — Routes, Endpoints & Server Logic

SvelteKit: prefer **`load` functions + form actions** for app data (progressive enhancement, no
hand-rolled fetch where avoidable). Use **`+server.ts` endpoints** only where the client needs live
JSON (the ExerciseDB typeahead). Everything is auth-guarded except `(auth)` routes.

## 1. Route map

| Path                        | Kind                               | Purpose                                |
| --------------------------- | ---------------------------------- | -------------------------------------- |
| `/`                         | redirect                           | → `/workout` if authed, else `/login`  |
| `/login`                    | page + action                      | email/password sign-in (better-auth)   |
| `/signup`                   | page + action                      | account creation                       |
| `/account`                  | page + action                      | profile + sign-out                     |
| `/workout`                  | page (`+page.server.ts` load)      | today's overview / zero state          |
| `/workout/new`              | page                               | the progressive multi-tab logging form |
| `/history`                  | page (load)                        | list of past workout days              |
| `/history/[date]`           | page (load)                        | one day's detail                       |
| `/exercises`                | page (load)                        | library list                           |
| `/exercises/new`            | page + actions                     | add (search + create)                  |
| `/exercises/[id]/edit`      | page + actions                     | edit / delete                          |
| `/api/exercise-search`      | `+server.ts` GET                   | proxy: search ExerciseDB               |
| `/api/exercise-search/[id]` | `+server.ts` GET                   | proxy: ExerciseDB detail               |
| `/workout/post`             | action (or part of `/workout/new`) | persist a posted draft                 |

## 2. Auth (better-auth)

- `src/lib/server/auth.ts` exports the configured better-auth instance (email+password, shared `pg` pool → built-in Kysely adapter).
- better-auth's request handler is mounted (its catch-all route, e.g. `/api/auth/[...all]/+server.ts`)
  per better-auth's SvelteKit guide.
- `/login` and `/signup` `+page.server.ts` actions call better-auth's sign-in/sign-up APIs, set the
  session cookie, and redirect to `redirect` param or `/workout`.
- `hooks.server.ts` populates `event.locals.user`/`session` and guards routes (see `02-architecture.md §4`).
- `app.d.ts` declares `App.Locals = { user: User | null; session: Session | null }`.

## 3. ExerciseDB proxy endpoints

`src/lib/server/exercisedb.ts` (server-only) — must set a browser-like `User-Agent` (upstream 403s
otherwise) and use `search=` (not `q=`).

### `GET /api/exercise-search?q=<term>&limit=10`

- Auth required. If `term.length < 2` → `200 { results: [] }` (no upstream call).
- Calls `GET {BASE}/exercises/search?search=<term>&limit=<limit>`.
- Returns `{ results: { exerciseId, name, gifUrl }[] }`.
- On upstream error/timeout → `200 { results: [], error: 'unavailable' }` (UI degrades gracefully).

### `GET /api/exercise-search/[id]`

- Auth required. Calls `GET {BASE}/exercises/{id}`.
- Returns the full DTO:
  `{ exerciseId, name, gifUrl, targetMuscles[], bodyParts[], equipments[], secondaryMuscles[], instructions[] }`.
- 404 if upstream not found.

Confirmed upstream shapes (verified against the live OSS instance):

```
GET /exercises/search?search=press&limit=1
→ { "success": true, "data": [ { "exerciseId":"UDm6cGl", "name":"kettlebell seesaw press", "gifUrl":"https://static.exercisedb.dev/media/UDm6cGl.gif" } ] }

GET /exercises/UDm6cGl
→ { "success": true, "data": { "exerciseId":"UDm6cGl", "name":"...", "gifUrl":"...",
     "targetMuscles":["delts"], "bodyParts":["shoulders"], "equipments":["kettlebell"],
     "secondaryMuscles":["triceps","core"], "instructions":["Step:1 ...", ...] } }
```

(Instructions arrive prefixed `Step:N `; strip the prefix for display, keep raw in DB or strip on ingest — pick one and be consistent. Recommended: strip on ingest.)

## 4. Exercise CRUD (form actions on `/exercises/*`)

- **create** (`/exercises/new?/create`): validate with Zod (`exerciseSchema`); insert with
  `user_id = locals.user.id`. The ExerciseDB snapshot fields come from a hidden payload populated
  when the user picked a search result (or empty for custom). Redirect to `/exercises`.
- **update** (`/exercises/[id]/edit?/update`): verify the row belongs to the user, then update.
  Does **not** touch `set_log` rows.
- **delete** (`/exercises/[id]/edit?/delete`): verify ownership, delete; FK `ON DELETE SET NULL`
  leaves history intact. Redirect to `/exercises`.

All actions return typed validation errors for inline display (use `fail(400, { errors })`).

## 5. Posting a workout draft

The form is client-stateful (drafts/tabs in a store). Posting one draft:

- **Action `/workout/post`** receives the draft payload: `{ exerciseId, sets: [...] }` where each set
  carries the type-appropriate values, plus the client's **local date + timezone**.
- Server:
  1. Load the exercise (verify ownership) to snapshot `name`, `routine`, `measurement_type`.
  2. Validate each set against `measurement_type` (Zod, see `03 §7`).
  3. Compute `workout_date` from the client local date (validate it's "today" within tz tolerance;
     reject future dates).
  4. Insert N `set_log` rows in **one transaction**, `set_index` 0..N-1, `performed_at = now()`.
  5. Return success; the client marks the tab ✓ and clears that draft from `localStorage`.
- Idempotency: include a client-generated `draftId`; ignore/reject a duplicate post of the same
  draftId (guards double-tap / retry). Simple approach: unique `(user_id, draft_id)` guard table or
  an in-memory short TTL set; document whichever is implemented.

## 6. Data loads

### `/workout` (`+page.server.ts`)

- Query `set_log` where `user_id = me AND workout_date = today(tz)`, ordered by `performed_at, set_index`.
- Group by `exercise_id`/`exercise_name` in the domain layer → today's exercises with their sets.
- Compute today's focus area (most-logged routine). Empty result → zero state.

### `/history` (`+page.server.ts`)

- `SELECT workout_date, count(distinct exercise_id) ..., array_agg(routine) ...` grouped by
  `workout_date`, ordered desc. For each day compute focus area in the domain layer
  (`computeFocusArea(routinesWithCounts)`).

### `/history/[date]`

- Validate `date` param; query `set_log` for that `(user, workout_date)`; group → exercises + sets,
  performed order. 404/empty-state if none.

## 7. Pure domain functions (`src/lib/domain`, unit-tested)

These hold the logic that must be correct and are tested in isolation (see `06-testing.md`):

- `computeFocusArea(routineCounts): routine` — highest exercise count; tie-break by set count then alpha.
- `validateRange(min, max)` and per-type set validators.
- `groupSetsByExercise(rows): ExerciseGroup[]`.
- `formatSetBadge(set, measurementType): string` — e.g. `120kg | 11x`, `5:00 | 1.20km`.
- `localWorkoutDate(date, tz): string` — derive `workout_date`.
- `mapExerciseDbDetail(upstream): ExerciseDbSnapshot` — strip `Step:N` prefixes, etc.

Keep these **free of SvelteKit/DB imports** so they're trivially unit-testable.
