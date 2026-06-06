import { error, json } from '@sveltejs/kit';
import { searchExercises } from '$lib/server/exercisedb';
import type { RequestHandler } from './$types';

/** GET /api/exercise-search?q=<term> — proxied ExerciseDB search (auth-required). */
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) error(401, 'Unauthorized');

	const q = (url.searchParams.get('q') ?? '').trim();
	if (q.length < 2) return json({ results: [] });

	const results = await searchExercises(q);
	return json({ results });
};
