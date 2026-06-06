import { error, json } from '@sveltejs/kit';
import { localWorkoutDate } from '$lib/domain/workoutSets';
import { postWorkoutSchema, setSchemaFor } from '$lib/schemas/workout';
import { getExercise } from '$lib/server/repositories/exercises';
import {
	insertSets,
	markRecentlyPosted,
	wasRecentlyPosted,
	type SetLogInsert
} from '$lib/server/repositories/setLog';
import type { RequestHandler } from './$types';

/** POST /api/workout — persist all sets of one posted draft (auth-required). */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const parsed = postWorkoutSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) error(400, 'Invalid payload');
	const { draftId, exerciseId, timeZone, sets } = parsed.data;

	// Idempotency: a duplicate post of the same draft is a no-op success.
	if (wasRecentlyPosted(draftId)) return json({ ok: true, duplicate: true });

	const exercise = await getExercise(locals.user.id, exerciseId);
	if (!exercise) error(404, 'Exercise not found');

	// Validate each set against the exercise's measurement type.
	const setSchema = setSchemaFor(exercise.measurement_type);
	const validated = sets.map((s) => {
		const r = setSchema.safeParse(s);
		if (!r.success) error(400, 'Invalid set for this exercise type');
		return r.data as Record<string, number | undefined>;
	});

	// Server derives the workout day from the client's time zone (authoritative, no future dates).
	let workoutDate: string;
	try {
		workoutDate = localWorkoutDate(new Date(), timeZone);
	} catch {
		error(400, 'Invalid time zone');
	}
	const performedAt = new Date();

	const rows: SetLogInsert[] = validated.map((s, index) => ({
		user_id: locals.user!.id,
		exercise_id: exerciseId,
		performed_at: performedAt,
		workout_date: workoutDate,
		set_index: index,
		weight: s.weight ?? null,
		reps: s.reps ?? null,
		duration_seconds: s.durationSeconds ?? null,
		distance: s.distance ?? null,
		resistance: s.resistance ?? null,
		exercise_name: exercise.name,
		routine: exercise.routine,
		measurement_type: exercise.measurement_type
	}));

	await insertSets(rows);
	markRecentlyPosted(draftId);

	return json({ ok: true, count: rows.length });
};
