import { fail, redirect } from '@sveltejs/kit';
import { createExercise } from '$lib/server/repositories/exercises';
import { parseExerciseForm } from '$lib/server/exerciseForm';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const parsed = parseExerciseForm(await request.formData());
		if (!parsed.ok) return fail(400, { message: parsed.message });

		await createExercise(locals.user!.id, parsed.input, parsed.snapshot);
		redirect(303, '/exercises');
	}
};
