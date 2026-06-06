# 01 — Product Specification

## 1. Vision & goals

Trainmate lets a lifter **log every set with minimal friction** during a workout and **review
progress over time**. It optimises for _speed of logging mid-session_ (big touch targets,
sliders, few taps) and _clean, honest data_ (a flat per-set log that's trivial to analyse later).

**Primary goal:** never lose a set; logging a set should take seconds.
**Secondary goal:** the log is structured so future analytics/visualisations are easy to add.

**Non-goals (v1):** social features, workout _planning_/programming, in-app charts/analytics,
nutrition, wearables, native apps, offline writes (online required to post). These are explicitly
out of scope but the data model must not preclude them.

## 2. Users & personas

- **The lifter (primary).** Trains push/pull/legs + core + cardio. Logs on a phone, one-handed,
  in a gym, often with sweaty hands and spotty Wi-Fi/cellular. Wants to glance at last time's
  numbers and beat them.
- **Account model:** multiple independent users may use the same deployment; each sees only their
  own library and history. No sharing between users in v1.

## 3. Feature list

1. **Auth** — email/password sign-up, sign-in, sign-out, session persistence. (better-auth)
2. **Exercise library management (CRUD)** — list, add (with ExerciseDB search), edit, delete.
3. **External exercise search** — search ExerciseDB, pick a result, enrich with personal data.
4. **Workout logging** — progressive 3-screen form, up to 3 concurrent exercises (tabs), per-set commit, post.
5. **Today / Workout view** — overview of today's logged exercises + zero state + "start" button.
6. **History / Previous workouts** — list of past days with focus-area labels; per-day detail.
7. **Rest timer** — always-available 1/2/3-minute countdown with circular progress (port existing).
8. **PWA** — installable, app-like, offline shell.

## 4. Information architecture & navigation

Top-level navigation (mobile bottom-nav or top tabs — see `05-ui-ux.md`) with these destinations:

- **Workout** (`/workout`) — _default landing after login._ Today's overview. Zero state when
  nothing logged yet. Always shows a prominent **"Start an exercise"** button.
- **History** (`/history`) — "Previous workouts". List of past days.
- **Exercises** (`/exercises`) — manage the personal exercise library.
- **Account** (`/account`) — profile, sign-out. (Minimal.)

The brand is **"Trainmate"** with the dumbbell mark (reuse from current header).

## 5. Detailed flows & screen behaviour

### 5.1 Auth

- **Sign up:** email, password, password confirm. Validate email format, password ≥ 8 chars.
  On success → logged in → `/workout`.
- **Sign in:** email + password. On success → `/workout`. On failure → inline error, no field-specific leakage ("Invalid email or password").
- **Guarded routes:** everything except `/login` and `/signup` requires a session. Unauthenticated
  access redirects to `/login?redirect=<path>`.
- **Sign out:** clears session → `/login`.

### 5.2 Exercise library — `/exercises`

- **List:** the user's exercises, grouped by routine (push/pull/legs/cardio/core). Each item shows
  name, a small GIF thumbnail (hotlinked), routine tag, and measurement type. Tap → edit.
- **Add (`/exercises/new`):**
  1. A **search field** ("Search ExerciseDB…"). As the user types (debounced ≥ 300 ms, min 2 chars),
     results stream from our server proxy (`/api/exercise-search?q=`). Each result shows name + GIF.
  2. User **picks one** result → we fetch full detail (`/api/exercise-search/[id]`) and pre-fill the
     metadata snapshot (name, gifUrl, targetMuscles, bodyParts, equipments, secondaryMuscles, instructions).
  3. User may **also add a custom exercise** without picking a result (the ExerciseDB snapshot is then null/empty; name is required and entered manually).
  4. User fills the **personal properties** in the _same form_ (this mirrors the old `ExerciseForm` inputs — see `05-ui-ux.md`):
     - **measurementType** (required): strength | cardio | bodyweight.
     - **routine** (required): push | pull | legs | cardio | core.
     - Range fields, shown conditionally by measurementType:
       - strength → sets {min,max}, weight {min,max}, reps {min,max}, rest {min,max sec}
       - bodyweight → sets {min,max}, reps {min,max}, rest {min,max sec}, weight {min,max} optional (added weight)
       - cardio → duration {min,max sec}, distance {min,max} optional, resistance {min,max} optional, rest {min,max sec} optional
  5. **Save** → row created → back to list with the new exercise visible.
- **Edit (`/exercises/[id]/edit`):** same form pre-filled; can change ranges/routine/measurementType
  and re-search to replace the ExerciseDB snapshot. Save updates the row. **Changing an exercise
  must not mutate already-logged sets** (history is immutable — see data model snapshotting).
- **Delete:** confirm dialog. Deleting an exercise **must not delete or corrupt** its past `set_log`
  rows; those keep their snapshotted name/routine. (FK `ON DELETE SET NULL`, see `03-data-model.md`.)

### 5.3 Workout logging — the progressive form

This is the heart of the app. It reproduces and extends the existing interaction.

**Entry:** from `/workout`, tapping "Start an exercise" opens the logging form (route `/workout/new`
or an overlay — see `05-ui-ux.md`). The form supports **up to 3 concurrent exercise drafts as tabs**.

**Per-draft, three screens (progressive disclosure):**

- **Screen 1 — Select.**
  - Pick **routine** (push/pull/legs/cardio/core).
  - Pick **exercise** from the user's library filtered to that routine (searchable list / datalist).
  - Continue → Screen 2. The chosen routine+exercise is now locked for this draft (changing it
    requires discarding the draft, matching the old "disabled once sets exist" behaviour).

- **Screen 2 — Log sets.** Header shows routine + exercise (+ small GIF). Inputs depend on measurementType:
  - **strength:** Weight (number input + slider, step 0.25) and Reps (number input + slider).
    A **"+" (commit set)** button adds `{weight, reps}` to this draft's set list. Sliders default
    to the exercise's range min and are bounded by min/max where defined.
  - **bodyweight:** Reps (input + slider), optional Added weight (input). Commit adds `{reps, weight?}`.
  - **cardio:** Duration (input + slider, mm:ss or seconds), optional Distance, optional Resistance.
    Commit adds `{durationSeconds, distance?, resistance?}`. _Typically one entry, but multiple allowed._
  - Committed sets render as **removable badges** (e.g. `43.25kg | 12x`, or `5:00 | 1.2km` for cardio),
    each with an ✕ to remove. (Exactly like the current "Sets" card.)
  - Continue → Screen 3 (enabled once ≥ 1 set committed).

- **Screen 3 — Summary & post.**
  - Lists all committed sets for this exercise.
  - **Post** button. On post:
    - All sets are written to `set_log` (one row per set) with `performedAt = now`,
      `workoutDate = today (user tz)`, incrementing `setIndex`, and a snapshot of exercise name/routine/measurementType.
    - The draft's **tab shows a green checkmark** and becomes read-only.
  - After posting, behaviour per the multi-tab rules below.

**Multi-tab rules:**

- A **sub-nav with a "+" button** lets the user open another draft tab (max 3 total). Each tab is an
  independent draft at its own screen/step. The user can switch between tabs freely.
- When a draft is **posted**, its tab gets a **green checkmark** and is locked.
- When **all open tabs are posted**, the tabs close automatically and the user returns to the
  **Workout (today) overview**, which now shows the just-logged exercises.
- The "Start an exercise" affordance from the overview opens the form again (fresh single tab).

**Draft persistence:** in-progress drafts (selections + committed-but-unposted sets) persist to
`localStorage` so a refresh, backgrounding, or accidental navigation does not lose data. Drafts clear
on successful post or explicit discard.

### 5.4 Workout (today) overview — `/workout`

- **Zero state** (nothing logged today): a friendly empty state + big **"Start an exercise"** button.
- **Populated:** today's date + focus area, then a list/cards of each exercise logged today with its
  sets summarised (e.g. "Bench Press — 120kg×11, 117.5kg×10, …"). A **"Start an exercise"** button
  remains available to add more.

### 5.5 History / Previous workouts — `/history`

- **List:** one button/card **per past day that has logged sets** (most recent first). Label = the
  **day** (e.g. "Tue 3 Jun") + **focus area** (the routine with the highest exercise count that day,
  e.g. "Push"). Tie-break: if two routines tie, pick the one with the most _sets_, then alphabetical.
- **Day detail (`/history/[date]`):** the exercises done that day, each with sets (weights/reps or
  duration/distance), in performed order.

### 5.6 Rest timer (port existing)

- Always reachable: a slide-out control (the current `TimerBar` pattern) with **1 / 2 / 3 minute**
  buttons and a **circular progress** fill as it counts down. Behaviour and look match the current app.
- **Enhancement (optional, low priority):** when a strength/bodyweight exercise is active in the form,
  the timer may pre-select a duration from that exercise's `rest` range. Not required for v1 — port the
  existing timer first.

## 6. Validation & edge cases (product-level)

- Ranges: `min ≤ max` for every range; non-negative; weight allows decimals (step 0.25), reps/sets
  are positive integers, durations are seconds (positive int).
- Posting with zero committed sets is blocked (Post disabled).
- An exercise with `measurementType = cardio` **never** prompts for sets/reps/weight.
- Searching ExerciseDB with no/too-short query shows nothing (no request fired).
- ExerciseDB unavailable (timeout/error/empty): the search field shows a non-blocking message and the
  user can still add a **custom** exercise manually.
- Time zone: "today" and day grouping use the **user's local timezone** (sent from the client; store
  UTC timestamps + a stored `workoutDate` date computed in the user's tz at post time).
- Deleting an exercise keeps history intact (snapshotted fields on `set_log`).

## 7. Acceptance criteria (high-level, testable)

These map to Playwright e2e specs (see `06-testing.md`):

1. A new user can sign up, land on an empty `/workout` zero state.
2. The user can search ExerciseDB, pick "bench press", set it as strength/push with ranges, and save it; it appears in `/exercises`.
3. The user can add a **custom** exercise (no ExerciseDB match) and a **cardio** exercise (duration/distance, no reps/weight prompts).
4. From `/workout`, the user can log a strength exercise: select → commit 3 sets → post → see it in today's overview; `set_log` has 3 rows.
5. The user can open a 2nd tab, log a cardio exercise (duration only), post it; when both tabs are posted the tabs close and both appear in today's overview.
6. A posted draft's tab shows a green checkmark; an unposted one does not.
7. After logging across two different days, `/history` lists both days with correct focus-area labels; the older day's detail shows its sets.
8. Deleting an exercise leaves its past sets visible in history (name preserved).
9. Drafts survive a page reload before posting.
10. Two different users never see each other's exercises or logs.
