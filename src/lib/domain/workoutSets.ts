/** Pure helpers + types for performed sets. No SvelteKit/DB imports. */

export type MeasurementType = 'strength' | 'cardio' | 'bodyweight';

export interface StrengthSet {
	weight: number;
	reps: number;
}
export interface BodyweightSet {
	reps: number;
	weight?: number;
}
export interface CardioSet {
	durationSeconds: number;
	distance?: number;
	resistance?: number;
}
export type DraftSet = StrengthSet | BodyweightSet | CardioSet;

/** Seconds → "m:ss" (e.g. 300 → "5:00", 65 → "1:05"). */
export function formatDuration(totalSeconds: number): string {
	const m = Math.floor(totalSeconds / 60);
	const s = totalSeconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Badge label for a committed set, e.g. "120kg | 11x", "+10kg · 12x", "5:00 | 1.20km". */
export function formatSetBadge(set: DraftSet, measurementType: MeasurementType): string {
	if (measurementType === 'strength') {
		const s = set as StrengthSet;
		return `${s.weight}kg | ${s.reps}x`;
	}
	if (measurementType === 'bodyweight') {
		const s = set as BodyweightSet;
		return s.weight != null ? `+${s.weight}kg · ${s.reps}x` : `${s.reps}x`;
	}
	const s = set as CardioSet;
	let label = formatDuration(s.durationSeconds);
	if (s.distance != null) label += ` | ${s.distance.toFixed(2)}km`;
	if (s.resistance != null) label += ` · R${s.resistance}`;
	return label;
}

/** Calendar date (YYYY-MM-DD) for `date` in the given IANA time zone. */
export function localWorkoutDate(date: Date, timeZone: string): string {
	// en-CA formats as YYYY-MM-DD.
	return new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(date);
}
