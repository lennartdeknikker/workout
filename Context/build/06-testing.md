# 06 — Testing Strategy (TDD)

Development is **test-driven**: for each unit of behaviour, write a failing test, implement to green,
refactor. Aim for fast feedback (unit/component) plus confidence on the real flows (e2e). The flat
data model and pure `src/lib/domain` functions are designed to make this cheap.

## 1. Tooling

| Layer       | Tool                                                                             | Scope                                                                                |
| ----------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Unit        | **Vitest**                                                                       | Pure domain logic, Zod schemas, stores, ExerciseDB mapping                           |
| Component   | **Vitest browser mode + `vitest-browser-svelte`** (real Chromium via Playwright) | Individual Svelte components (RangeInput, SetBadge, DraftForm steps, ExerciseSearch) |
| E2E         | **Playwright**                                                                   | Full user journeys against a running app + real Postgres                             |
| Lint/format | ESLint + Prettier (already configured)                                           | CI gate                                                                              |
| Types       | `svelte-check` / `tsc`                                                           | CI gate                                                                              |

Add npm scripts: `test` (vitest run), `test:watch`, `test:e2e` (playwright), `test:all`, plus keep
`check`, `lint`.

## 2. The TDD loop (per feature)

1. Write the unit/component test(s) for the smallest behaviour. Run → red.
2. Implement minimally. Run → green.
3. Refactor with tests green.
4. Once a flow is assembled, add/extend the Playwright spec for the acceptance criterion.

Pull pure logic into `src/lib/domain` so it can be tested without SvelteKit/DB.

## 3. Unit tests (Vitest) — concrete inventory

- **`computeFocusArea`**: single routine; clear majority; tie broken by set count; tie broken by alpha; empty.
- **Range validation**: `min ≤ max`; negatives rejected; one-sided ranges allowed; non-integers where disallowed.
- **Per-type set validators**:
  - strength requires weight+reps, rejects cardio fields;
  - bodyweight requires reps, allows optional weight;
  - cardio requires duration, optional distance/resistance, rejects reps/weight.
- **`formatSetBadge`**: strength `120kg | 11x`; bodyweight `12x` / `+10kg · 12x`; cardio `5:00`, `5:00 | 1.20km`.
- **`localWorkoutDate(date, tz)`**: correct calendar date across tz boundaries; rejects future dates.
- **`mapExerciseDbDetail`**: strips `Step:N ` prefixes; tolerates missing optional arrays; maps fields.
- **`groupSetsByExercise`**: preserves performed order; groups correctly; handles deleted-exercise (null id) rows using snapshot name.
- **`workoutDrafts` store**: open/close tab (max 3), commit/remove set, mark posted, localStorage round-trip, auto-close when all posted.

## 4. Component tests (`vitest-browser-svelte`, browser mode)

Component specs are named `*.svelte.spec.ts` and run in the Vitest **client** project (real Chromium).
Use `render()` from `vitest-browser-svelte` and the `page`/locator API for queries/interaction.

- **RangeInput**: number↔slider sync; respects min/max/step; emits value.
- **SetBadge**: renders label; ✕ fires remove.
- **ExerciseSearch**: debounces; no fetch under min length; renders result rows; pick fires event;
  shows graceful "unavailable / add custom" on error (mock the proxy).
- **DraftForm**: step gating (can't reach screen 2 without exercise; Post disabled with 0 sets);
  cardio hides reps/weight; posting marks read-only.
- **WorkoutTabs**: "+" disabled at 3; checkmark on posted tab; switching tabs.

Mock network (`/api/exercise-search`) and the drafts store as needed.

## 5. E2E tests (Playwright) — map to acceptance criteria (`01 §7`)

Run against a built app pointed at an **isolated Postgres test database**; reset between specs.

1. **Auth:** sign up → land on `/workout` zero state; sign out → `/login`; sign in again.
2. **Add from ExerciseDB:** search "press" (proxy may be **mocked/stubbed** for determinism — see §6),
   pick a result, set strength/push + ranges, save → appears in `/exercises`.
3. **Add custom + cardio:** create a custom exercise (no search) and a cardio exercise; verify the
   cardio add/log UI shows duration (no reps/weight).
4. **Log strength:** select → commit 3 sets → post → today's overview shows it; (assert 3 `set_log` rows via a test API or DB check).
5. **Multi-tab:** open 2nd tab, log a cardio exercise, post both; tabs auto-close → both in overview.
6. **Checkmark:** posted tab shows ✓, unposted doesn't.
7. **History:** seed two days (via DB/test helper); `/history` lists both with correct focus labels; detail shows sets.
8. **Delete keeps history:** delete an exercise; its past sets still render in history with the name.
9. **Draft persistence:** commit sets, reload, drafts restored.
10. **Multi-user isolation:** user A's exercises/logs invisible to user B.

## 6. Test infrastructure

- **Test DB:** a dedicated Postgres (a `docker compose` test service or **Testcontainers**). Run
  `node scripts/migrate.js` against it before the suite. Truncate app tables between tests for isolation.
- **Auth in e2e:** prefer a programmatic login helper (API sign-up/sign-in + storageState) over
  driving the UI in every spec; have one spec exercise the real auth UI.
- **ExerciseDB in e2e:** **do not hit the live OSS API in CI** — stub `/api/exercise-search*` (Playwright
  route interception or an env-flagged fake client) with the fixed sample payloads in `04 §3`. Keep
  one optional, non-CI "live" smoke test if desired.
- **Seeding:** expose a guarded test-only helper (or direct Kysely inserts) to create users, exercises,
  and historical `set_log` rows for history/isolation specs.
- **CI gate:** `lint` + `check` + `test` (unit/component) on every push; `test:e2e` on PRs.

## 7. Coverage intent

Not a percentage target — instead: **every `src/lib/domain` function and every acceptance criterion
in `01 §7` has a test.** Validation logic and the post/idempotency path are the highest-risk areas and
must be covered first.
