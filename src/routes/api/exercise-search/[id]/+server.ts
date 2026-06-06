import { error, json } from '@sveltejs/kit';
import { getExerciseDetail } from '$lib/server/exercisedb';
import type { RequestHandler } from './$types';

/** GET /api/exercise-search/[id] — full ExerciseDB detail to pre-fill the add form (auth-required). */
export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const detail = await getExerciseDetail(params.id);
	if (!detail) error(404, 'Exercise not found');

	return json(detail);
};
