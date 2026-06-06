import { error } from '@sveltejs/kit';
import { computeFocusArea, groupSetsByExercise, summariseRoutines } from '$lib/domain/history';
import { getDaySets } from '$lib/server/repositories/history';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) error(404, 'Not found');

	const sets = await getDaySets(locals.user!.id, params.date);
	if (sets.length === 0) error(404, 'No workout logged on this day');

	return {
		date: params.date,
		focusArea: computeFocusArea(summariseRoutines(sets)),
		groups: groupSetsByExercise(sets)
	};
};
