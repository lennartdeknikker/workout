import { render } from 'vitest-browser-svelte';
import { expect, test, beforeEach } from 'vitest';
import DraftForm from './DraftForm.svelte';
import { workoutDrafts } from '$lib/stores/workoutDrafts.svelte';
import type { Exercise } from '$lib/server/repositories/exercises';

beforeEach(() => workoutDrafts.reset());

/** Minimal exercise row; nullable range columns default to null. */
function exercise(partial: Partial<Exercise>): Exercise {
	return {
		id: 'ex',
		user_id: 'u',
		name: 'Ex',
		measurement_type: 'strength',
		routine: 'push',
		exercise_db_id: null,
		gif_url: null,
		target_muscles: [],
		body_parts: [],
		equipments: [],
		secondary_muscles: [],
		instructions: [],
		sets_min: null,
		sets_max: null,
		weight_min: null,
		weight_max: null,
		reps_min: null,
		reps_max: null,
		rest_min: null,
		rest_max: null,
		duration_min: null,
		duration_max: null,
		distance_min: null,
		distance_max: null,
		resistance_min: null,
		resistance_max: null,
		created_at: new Date(),
		updated_at: new Date(),
		...partial
	} as Exercise;
}

test('a cardio exercise logs duration, never weight/reps (measurementType drives the UI)', async () => {
	workoutDrafts.openTab('a');
	// routine push (the step-1 default) but cardio measurement, so it's pickable without changing the routine select.
	const treadmill = exercise({
		id: 'c1',
		name: 'Treadmill',
		routine: 'push',
		measurement_type: 'cardio'
	});

	const screen = render(DraftForm, { exercises: [treadmill], onfinished: () => {} });

	await screen.getByRole('button', { name: 'Treadmill' }).click(); // step 1 → step 2
	await expect.element(screen.getByText('Duration (sec)')).toBeVisible();
	expect(screen.getByText('Weight (kg)').elements()).toHaveLength(0);
});

test('a strength exercise commits sets as badges and gates Next on ≥1 set', async () => {
	workoutDrafts.openTab('a');
	const bench = exercise({
		id: 's1',
		name: 'Bench',
		routine: 'push',
		measurement_type: 'strength',
		weight_min: '20',
		weight_max: '100',
		reps_min: 5,
		reps_max: 10
	});

	const screen = render(DraftForm, { exercises: [bench], onfinished: () => {} });
	await screen.getByRole('button', { name: 'Bench' }).click();

	// Next is disabled until a set is committed.
	const next = screen.getByRole('button', { name: 'Next' });
	await expect.element(next).toBeDisabled();

	await screen.getByRole('button', { name: 'Commit set' }).click();
	await screen.getByRole('button', { name: 'Commit set' }).click();
	expect(screen.getByText('20kg | 5x').elements().length).toBeGreaterThan(0);
	await expect.element(next).toBeEnabled();
});
