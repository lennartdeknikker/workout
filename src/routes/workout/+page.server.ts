import { localWorkoutDate } from '$lib/domain/workoutSets';
import { computeFocusArea, groupSetsByExercise, summariseRoutines } from '$lib/domain/history';
import { getDaySets } from '$lib/server/repositories/history';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, cookies }) => {
	const tz = cookies.get('tz') || 'UTC';
	const today = localWorkoutDate(new Date(), tz);

	const sets = await getDaySets(locals.user!.id, today);
	return {
		today,
		focusArea: computeFocusArea(summariseRoutines(sets)),
		groups: groupSetsByExercise(sets)
	};
};
