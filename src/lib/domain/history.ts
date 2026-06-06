/** Pure aggregation/grouping for the today + history views. No SvelteKit/DB imports. */
import { formatSetBadge, type MeasurementType } from './workoutSets';

export type Routine = 'push' | 'pull' | 'legs' | 'cardio' | 'core';

/** A logged set, normalised from a `set_log` row (numbers parsed, camelCase). */
export interface LoggedSet {
	exerciseId: string | null;
	exerciseName: string;
	routine: Routine;
	measurementType: MeasurementType;
	setIndex: number;
	weight: number | null;
	reps: number | null;
	durationSeconds: number | null;
	distance: number | null;
	resistance: number | null;
}

export interface ExerciseGroup {
	key: string;
	exerciseId: string | null;
	exerciseName: string;
	routine: Routine;
	measurementType: MeasurementType;
	sets: LoggedSet[];
}

export interface RoutineSummary {
	routine: Routine;
	exerciseCount: number;
	setCount: number;
}

/** Stable identity for an exercise, surviving deletion (FK null) via the snapshot name. */
function identity(set: { exerciseId: string | null; exerciseName: string }): string {
	return set.exerciseId ?? `name:${set.exerciseName}`;
}

/** Group sets by exercise, preserving first-seen (performed) order. */
export function groupSetsByExercise(sets: LoggedSet[]): ExerciseGroup[] {
	const order: string[] = [];
	const groups = new Map<string, ExerciseGroup>();
	for (const set of sets) {
		const key = identity(set);
		let group = groups.get(key);
		if (!group) {
			group = {
				key,
				exerciseId: set.exerciseId,
				exerciseName: set.exerciseName,
				routine: set.routine,
				measurementType: set.measurementType,
				sets: []
			};
			groups.set(key, group);
			order.push(key);
		}
		group.sets.push(set);
	}
	return order.map((k) => groups.get(k)!);
}

/** Per-routine exercise + set counts for a collection of sets. */
export function summariseRoutines(sets: LoggedSet[]): RoutineSummary[] {
	const map = new Map<Routine, { exercises: Set<string>; sets: number }>();
	for (const set of sets) {
		const entry = map.get(set.routine) ?? { exercises: new Set<string>(), sets: 0 };
		entry.exercises.add(identity(set));
		entry.sets += 1;
		map.set(set.routine, entry);
	}
	return [...map].map(([routine, v]) => ({
		routine,
		exerciseCount: v.exercises.size,
		setCount: v.sets
	}));
}

/** The day's focus area: routine with most exercises; tie → most sets → alphabetical. */
export function computeFocusArea(summaries: RoutineSummary[]): Routine | null {
	if (summaries.length === 0) return null;
	return [...summaries].sort(
		(a, b) =>
			b.exerciseCount - a.exerciseCount ||
			b.setCount - a.setCount ||
			a.routine.localeCompare(b.routine)
	)[0].routine;
}

/** Badge label for a logged set (delegates to formatSetBadge by measurement type). */
export function formatLoggedSet(set: LoggedSet): string {
	if (set.measurementType === 'strength') {
		return formatSetBadge({ weight: set.weight ?? 0, reps: set.reps ?? 0 }, 'strength');
	}
	if (set.measurementType === 'bodyweight') {
		const s =
			set.weight != null ? { reps: set.reps ?? 0, weight: set.weight } : { reps: set.reps ?? 0 };
		return formatSetBadge(s, 'bodyweight');
	}
	return formatSetBadge(
		{
			durationSeconds: set.durationSeconds ?? 0,
			...(set.distance != null ? { distance: set.distance } : {}),
			...(set.resistance != null ? { resistance: set.resistance } : {})
		},
		'cardio'
	);
}

/** Human day label, e.g. "Tue 3 Jun" (parsed as a calendar date, tz-stable). */
export function formatDayLabel(workoutDate: string): string {
	const d = new Date(`${workoutDate}T00:00:00Z`);
	return new Intl.DateTimeFormat('en-GB', {
		timeZone: 'UTC',
		weekday: 'short',
		day: 'numeric',
		month: 'short'
	}).format(d);
}
