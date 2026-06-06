import { listWorkoutDays } from '$lib/server/repositories/history';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return { days: await listWorkoutDays(locals.user!.id) };
};
