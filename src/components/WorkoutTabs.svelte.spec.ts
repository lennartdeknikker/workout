import { render } from 'vitest-browser-svelte';
import { expect, test, vi, beforeEach } from 'vitest';
import WorkoutTabs from './WorkoutTabs.svelte';
import { workoutDrafts } from '$lib/stores/workoutDrafts.svelte';

beforeEach(() => workoutDrafts.reset());

test('renders one tab per draft and hides "+" at the 3-tab limit', () => {
	workoutDrafts.openTab('a');
	workoutDrafts.openTab('b');
	workoutDrafts.openTab('c');
	const screen = render(WorkoutTabs, { onadd: () => {} });
	expect(screen.getByRole('button', { name: 'Add exercise tab' }).elements()).toHaveLength(0);
});

test('"+" calls onadd and a posted draft shows a checkmark', async () => {
	workoutDrafts.openTab('a');
	workoutDrafts.selectExercise('a', {
		exerciseId: 'x',
		name: 'Bench',
		routine: 'push',
		measurementType: 'strength'
	});
	const onadd = vi.fn();
	const screen = render(WorkoutTabs, { onadd });

	await expect.element(screen.getByText('Bench')).toBeVisible();
	await screen.getByRole('button', { name: 'Add exercise tab' }).click();
	expect(onadd).toHaveBeenCalledOnce();

	workoutDrafts.markPosted('a');
	await expect.element(screen.getByText('✓')).toBeVisible();
});
