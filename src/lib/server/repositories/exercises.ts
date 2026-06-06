import { sql } from 'kysely';
import type { Selectable } from 'kysely';
import { db } from '$lib/server/db';
import type { ExerciseTable } from '$lib/server/db/types';
import type { ExerciseInput } from '$lib/schemas/exercise';
import type { ExerciseDbSnapshot } from '$lib/domain/exercisedb';

export type Exercise = Selectable<ExerciseTable>;

/** Map validated form input + optional ExerciseDB snapshot to a DB row (snake_case columns). */
function toRow(input: ExerciseInput, snapshot: ExerciseDbSnapshot | null) {
	return {
		name: input.name,
		measurement_type: input.measurementType,
		routine: input.routine,

		exercise_db_id: snapshot?.exerciseId ?? null,
		gif_url: snapshot?.gifUrl ?? null,
		target_muscles: snapshot?.targetMuscles ?? [],
		body_parts: snapshot?.bodyParts ?? [],
		equipments: snapshot?.equipments ?? [],
		secondary_muscles: snapshot?.secondaryMuscles ?? [],
		instructions: snapshot?.instructions ?? [],

		sets_min: input.setsMin ?? null,
		sets_max: input.setsMax ?? null,
		weight_min: input.weightMin ?? null,
		weight_max: input.weightMax ?? null,
		reps_min: input.repsMin ?? null,
		reps_max: input.repsMax ?? null,
		rest_min: input.restMin ?? null,
		rest_max: input.restMax ?? null,
		duration_min: input.durationMin ?? null,
		duration_max: input.durationMax ?? null,
		distance_min: input.distanceMin ?? null,
		distance_max: input.distanceMax ?? null,
		resistance_min: input.resistanceMin ?? null,
		resistance_max: input.resistanceMax ?? null
	};
}

export function listExercises(userId: string): Promise<Exercise[]> {
	return db
		.selectFrom('exercise')
		.selectAll()
		.where('user_id', '=', userId)
		.orderBy('routine')
		.orderBy('name')
		.execute();
}

export function getExercise(userId: string, id: string): Promise<Exercise | undefined> {
	return db
		.selectFrom('exercise')
		.selectAll()
		.where('user_id', '=', userId)
		.where('id', '=', id)
		.executeTakeFirst();
}

export async function createExercise(
	userId: string,
	input: ExerciseInput,
	snapshot: ExerciseDbSnapshot | null
): Promise<string> {
	const row = await db
		.insertInto('exercise')
		.values({ user_id: userId, ...toRow(input, snapshot) })
		.returning('id')
		.executeTakeFirstOrThrow();
	return row.id;
}

/** Update an exercise the user owns. Does NOT touch logged sets (history is immutable). */
export async function updateExercise(
	userId: string,
	id: string,
	input: ExerciseInput,
	snapshot: ExerciseDbSnapshot | null
): Promise<boolean> {
	const res = await db
		.updateTable('exercise')
		.set({ ...toRow(input, snapshot), updated_at: sql`now()` })
		.where('user_id', '=', userId)
		.where('id', '=', id)
		.executeTakeFirst();
	return (res.numUpdatedRows ?? 0n) > 0n;
}

/** Delete an exercise the user owns. set_log rows keep their snapshot (FK ON DELETE SET NULL). */
export async function deleteExercise(userId: string, id: string): Promise<void> {
	await db
		.deleteFrom('exercise')
		.where('user_id', '=', userId)
		.where('id', '=', id)
		.executeTakeFirst();
}
