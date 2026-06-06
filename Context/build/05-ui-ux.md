# 05 — UI / UX Specification

The look is **clean, minimal, monochrome** — preserve the current Trainmate aesthetic (see
`Context/current-ui.png`). Mobile-first; everything must be comfortable one-handed.

## 1. Visual language (from the existing app — keep it)

- **Font:** Rubik (Google Fonts), variable weights. Headings heavy/bold.
- **Palette:** black `#000` on white `#fff`. Accents: success green `#00c01a` (post/checkmark),
  muted grey `#888` for disabled. Define as CSS custom properties (design tokens) in the root layout.
- **Cards/fieldsets:** white, `1px solid black`, slightly heavier bottom border (`2px`),
  `border-radius: 10px`, generous padding (~`1rem`), vertical stack with `gap`.
- **Inputs:** pill-ish (`border-radius: 14px`), `min-height: 2.4rem`, `1px solid black`. Number inputs
  paired with a **range slider** (`accent-color: black`).
- **Primary action buttons:** circular FABs, `3.2rem`, centered, overlapping the card bottom edge.
  Black `+` for "commit set"; green ✓/down-arrow for "post" (as in current UI).
- **Set badges:** pill outline buttons showing `{weight}kg | {reps}x` with an ✕ to remove.
- **Rhythm:** `font-size: 10px` root with `rem`-based sizing (current convention); spacing in `rem`.
- **Tone:** lots of whitespace, large tap targets (≥ 44px), no clutter.

> Reuse the existing `ExerciseForm.svelte`, `Timer.svelte`, `TimerBar.svelte`, `Navigation.svelte`
> markup/CSS as the **starting visual reference**. The structure changes (3 screens, tabs, new data),
> but the styling, slider+number pattern, badge pattern, and FAB buttons should feel identical.

## 2. App shell & navigation

- **Header:** "Trainmate" wordmark + dumbbell mark (reuse). Account/profile affordance.
- **Primary nav** (mobile-first): a **bottom tab bar** with: **Workout**, **History**, **Exercises**,
  **Account**. (On wider screens it may move to the top — single responsive component.)
- **Rest timer:** the existing slide-out `TimerBar` stays globally available (anchored right edge),
  with the circular progress indicator. Don't redesign it; port it.

## 3. Screen-by-screen

### Workout (today) — `/workout`

- **Zero state:** centered illustration/empty message ("No exercises logged today") + a large
  **"Start an exercise"** primary button.
- **Populated:** date + focus-area chip at top; a card per exercise logged today with its sets
  summarised as badges; persistent **"Start an exercise"** button at the bottom.

### Logging form — `/workout/new` (the centrepiece)

Implemented as an overlay/page hosting **1–3 draft tabs**.

- **Tab bar (sub-nav):** one chip per open draft + a **"+"** button (disabled at 3 tabs). Each tab
  label shows the exercise name once chosen; a **green ✓** once that draft is posted. Tapping a tab
  switches to it. Posted tabs are read-only.
- **Within a tab — 3 steps (progressive disclosure):**
  1. **Select:** routine `<select>` (push/pull/legs/cardio/core) → exercise picker (searchable list
     filtered to that routine, datalist-style like the current input). "Next" advances.
     Once you advance and add sets, routine/exercise lock (mirror current `disabled` behaviour).
  2. **Log sets:** header shows routine + exercise + small GIF (hotlinked). Inputs **by measurementType**:
     - strength → Weight (number + slider, step 0.25) & Reps (number + slider). Black **+** FAB commits a set.
     - bodyweight → Reps (number + slider), optional Added weight. + FAB commits.
     - cardio → Duration (mm:ss or seconds slider), optional Distance, optional Resistance. + FAB commits.
     - Committed sets show as **removable badges** below ("Sets" card). "Next" enabled once ≥1 set.
  3. **Summary & post:** list committed sets; green **Post** FAB. On success → tab ✓, becomes read-only.
- **Auto-close:** when **all** open tabs are posted, tabs close → return to `/workout` overview.
- **Back/step nav:** allow going back a step within an unposted draft without losing committed sets.
- **Draft persistence:** drafts live in `workoutDrafts` store, mirrored to `localStorage`; restored on load.

### Exercises (library) — `/exercises`

- List grouped by routine; each row: GIF thumb + name + measurementType chip. Tap → edit. FAB/"+" → add.

### Add / edit exercise — `/exercises/new`, `/exercises/[id]/edit`

- **Search card:** text field; live results (debounced) as tappable rows (GIF + name). Picking one
  fills the snapshot + name. A "can't find it? add custom" affordance lets you skip search.
- **Details card(s):** measurementType selector + routine selector, then **conditional range inputs**
  (number-pair min/max with the same input styling) per measurementType (see `01 §5.2`).
- Save (green ✓) / for edit also a Delete (with confirm). Inline validation errors under fields.

### History — `/history`, `/history/[date]`

- **List:** vertical list of day buttons; each label = day (e.g. "Tue 3 Jun") + focus area ("Push").
  Most recent first.
- **Detail:** the day's exercises in performed order, each with its sets as badges/rows.

### Auth — `/login`, `/signup`

- Minimal centered card matching the aesthetic. Email + password (+ confirm on signup). Inline errors.

## 4. Components inventory

- `AppNav` (bottom/top tabs), `Header`, `RestTimerBar` + `Timer` (ported).
- `ExercisePicker` (routine-filtered searchable select).
- `RangeInput` (number + slider pair, reused everywhere).
- `SetBadge` (removable pill).
- `WorkoutTabs` (tab bar + "+", checkmarks) + `DraftForm` (the 3-step machine).
- `ExerciseSearch` (debounced ExerciseDB typeahead with result rows).
- `ExerciseForm` (add/edit, conditional ranges).
- `DayCard` / `ExerciseSummaryCard` (overview + history).
- `EmptyState`.

## 5. Interaction & accessibility details

- Min tap target 44×44px; sliders large enough for thumb use.
- Steppers/sliders update the paired number input live and vice-versa.
- Disable (don't hide) actions that aren't yet valid where it aids clarity (e.g. Post until ≥1 set);
  hide type-irrelevant inputs entirely (cardio shows no reps/weight).
- All interactive elements keyboard-reachable; labels associated with inputs; sufficient contrast
  (the monochrome palette already passes).
- Respect `prefers-reduced-motion` for the timer/tab transitions.
- Loading/disabled states for async (search, post) — never let a double-tap double-post (idempotency
  - disabled-while-pending).

## 6. Responsive

- Design at 360–414px width first. Cards full-width with side padding. On ≥ 768px, constrain content
  width (~`30–40rem`, like the current `max-width: 30rem` form) and center; nav may move to top.
