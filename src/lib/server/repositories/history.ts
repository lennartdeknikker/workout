import { sql } from 'kysely';
import type { Selectable } from 'kysely';
import { db } from '$lib/server/db';
import type { SetLogTable } from '$lib/server/db/types';
import {
	computeFocusArea,
	type LoggedSet,
	type Routine,
	type RoutineSummary
} from '$lib/domain/history';

function mapSetRow(r: Selectable<SetLogTable>): LoggedSet {
	return {
		exerciseId: r.exercise_id,
		exerciseName: r.exercise_name,
		routine: r.routine,
		measurementType: r.measurement_type,
		setIndex: r.set_index,
		weight: r.weight == null ? null : Number(r.weight),
		reps: r.reps,
		durationSeconds: r.duration_seconds,
		distance: r.distance == null ? null : Number(r.distance),
		resistance: r.resistance == null ? null : Number(r.resistance)
	};
}

/** All sets logged on one calendar day, in performed order. */
export async function getDaySets(userId: string, workoutDate: string): Promise<LoggedSet[]> {
	const rows = await db
		.selectFrom('set_log')
		.selectAll()
		.where('user_id', '=', userId)
		.where('workout_date', '=', workoutDate)
		.orderBy('performed_at')
		.orderBy('set_index')
		.execute();
	return rows.map(mapSetRow);
}

export interface WorkoutDaySummary {
	workoutDate: string;
	focusArea: Routine | null;
	exerciseCount: number;
	setCount: number;
}

/** One entry per past workout day (most recent first) with its focus area + totals. */
export async function listWorkoutDays(userId: string): Promise<WorkoutDaySummary[]> {
	const rows = await db
		.selectFrom('set_log')
		.select([
			'workout_date',
			'routine',
			sql<string>`count(distinct coalesce(exercise_id::text, 'name:' || exercise_name))`.as(
				'exercises'
			),
			sql<string>`count(*)`.as('sets')
		])
		.where('user_id', '=', userId)
		.groupBy(['workout_date', 'routine'])
		.execute();

	const byDate = new Map<string, RoutineSummary[]>();
	for (const r of rows) {
		const list = byDate.get(r.workout_date) ?? [];
		list.push({ routine: r.routine, exerciseCount: Number(r.exercises), setCount: Number(r.sets) });
		byDate.set(r.workout_date, list);
	}

	return [...byDate]
		.map(([workoutDate, summaries]) => ({
			workoutDate,
			focusArea: computeFocusArea(summaries),
			exerciseCount: summaries.reduce((n, s) => n + s.exerciseCount, 0),
			setCount: summaries.reduce((n, s) => n + s.setCount, 0)
		}))
		.sort((a, b) => b.workoutDate.localeCompare(a.workoutDate));
}
