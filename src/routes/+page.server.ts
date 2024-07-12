/** @type {import('./$types').Actions} */
export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();
    
		const workout = data.get('workout-type');
		const exercise = data.get('exercise');
		const reps = data.getAll('reps');
		const weight = data.getAll('weight');

		return { success: true };
	}
};
