import { error, fail, redirect } from '@sveltejs/kit';
import { deleteExercise, getExercise, updateExercise } from '$lib/server/repositories/exercises';
import { parseExerciseForm } from '$lib/server/exerciseForm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const exercise = await getExercise(locals.user!.id, params.id);
	if (!exercise) error(404, 'Exercise not found');
	return { exercise };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const parsed = parseExerciseForm(await request.formData());
		if (!parsed.ok) return fail(400, { message: parsed.message });

		const ok = await updateExercise(locals.user!.id, params.id, parsed.input, parsed.snapshot);
		if (!ok) error(404, 'Exercise not found');
		redirect(303, '/exercises');
	},

	delete: async ({ params, locals }) => {
		await deleteExercise(locals.user!.id, params.id);
		redirect(303, '/exercises');
	}
};
