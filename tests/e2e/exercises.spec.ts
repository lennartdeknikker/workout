import { test, expect, type Page } from '@playwright/test';
import { resetDb } from './helpers/db';
import { signUp } from './helpers/auth';
import { chooseSelect } from './helpers/ui';

test.beforeEach(resetDb);

/** Stub our ExerciseDB proxy so tests never hit the real CDN. */
async function stubExerciseDb(page: Page) {
	await page.route(/\/api\/exercise-search\?/, (route) =>
		route.fulfill({
			json: {
				results: [{ exerciseId: 'EX1', name: 'barbell bench press', gifUrl: 'http://x/EX1.gif' }]
			}
		})
	);
	await page.route(/\/api\/exercise-search\/EX1$/, (route) =>
		route.fulfill({
			json: {
				exerciseId: 'EX1',
				name: 'barbell bench press',
				gifUrl: 'http://x/EX1.gif',
				targetMuscles: ['pectorals'],
				bodyParts: ['chest'],
				equipments: ['barbell'],
				secondaryMuscles: ['triceps'],
				instructions: ['Lie on the bench and press.']
			}
		})
	);
}

test('add an exercise from ExerciseDB search (criterion #2)', async ({ page }) => {
	await signUp(page, 'lib@example.com');
	await stubExerciseDb(page);

	await page.goto('/exercises/new');
	// Type character-by-character so the debounced search fires.
	const box = page.getByPlaceholder('e.g. bench press');
	await box.click();
	await box.pressSequentially('bench', { delay: 50 });
	await page.getByRole('button', { name: /barbell bench press/i }).click();
	await expect(page.getByText(/Linked to/)).toBeVisible();

	await page.getByRole('button', { name: 'Add exercise' }).click();
	await expect(page).toHaveURL(/\/exercises$/);
	await expect(page.getByText('barbell bench press')).toBeVisible();
});

test('add a custom exercise and a cardio exercise (criterion #3)', async ({ page }) => {
	await signUp(page, 'custom@example.com');

	// Custom bodyweight/pull exercise, no search.
	await page.goto('/exercises/new');
	await page.getByLabel('Name').fill('My Custom Pull-up');
	await chooseSelect(page, 'measurementType', 'bodyweight');
	await chooseSelect(page, 'routine', 'pull');
	await page.getByRole('button', { name: 'Add exercise' }).click();
	await expect(page).toHaveURL(/\/exercises$/);
	await expect(page.getByText('My Custom Pull-up')).toBeVisible();

	// Cardio exercise — shows duration, never weight/reps.
	await page.goto('/exercises/new');
	await page.getByLabel('Name').fill('Treadmill Run');
	await chooseSelect(page, 'measurementType', 'cardio');
	await chooseSelect(page, 'routine', 'cardio');
	await expect(page.getByText('Duration (sec)')).toBeVisible();
	await expect(page.getByText('Reps', { exact: true })).toHaveCount(0);
	await page.getByRole('button', { name: 'Add exercise' }).click();
	await expect(page.getByText('Treadmill Run')).toBeVisible();
});
