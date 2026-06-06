import { listExercises } from '$lib/server/repositories/exercises';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const exercises = await listExercises(locals.user!.id);
	return { exercises };
};
