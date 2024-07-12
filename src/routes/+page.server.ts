/** @type {import('./$types').Actions} */
export const actions = {
	submit: async ({ request }) => {
		const data = await request.formData();
    // console.log("💬 ~ data:", data)
    
		const workout = data.get('workout-type');
		console.log("💬 ~ workout:", workout)
		const exercise = data.get('exercise');
		const reps = data.getAll('reps');
		const weight = data.getAll('weight');

		return { success: true };
	}
};
