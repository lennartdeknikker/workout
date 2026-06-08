import { test, expect } from '@playwright/test';
import { resetDb, getUserId, countSetLog, seedExercise } from './helpers/db';
import { signUp } from './helpers/auth';

test.beforeEach(resetDb);

const strength = {
	routine: 'push',
	measurementType: 'strength',
	weightMin: 20,
	weightMax: 100,
	repsMin: 5,
	repsMax: 12
};
const cardio = {
	routine: 'cardio',
	measurementType: 'cardio',
	durationMin: 300,
	durationMax: 1800
};

test('log a strength workout → today overview + 3 set_log rows (criterion #4)', async ({
	page
}) => {
	await signUp(page, 's@example.com');
	const uid = await getUserId('s@example.com');
	await seedExercise(uid, { name: 'Bench', ...strength });

	await page.goto('/workout/new');
	await page.getByRole('button', { name: 'Bench' }).click();
	const commit = page.getByRole('button', { name: 'Commit set' });
	await commit.click();
	await commit.click();
	await commit.click();
	await expect(page.locator('.badge')).toHaveCount(3);

	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Post', exact: true }).click();

	await expect(page).toHaveURL(/\/workout$/);
	await expect(page.getByText('Bench')).toBeVisible();
	expect(await countSetLog(uid)).toBe(3);
});

test('multi-tab: log two exercises, checkmark + auto-close (criteria #5, #6)', async ({ page }) => {
	await signUp(page, 'm@example.com');
	const uid = await getUserId('m@example.com');
	await seedExercise(uid, { name: 'Bench', ...strength });
	await seedExercise(uid, { name: 'Rower', ...cardio });

	await page.goto('/workout/new');

	// Tab 1: strength, commit a set but don't post yet.
	await page.getByRole('button', { name: 'Bench' }).click();
	await page.getByRole('button', { name: 'Commit set' }).click();

	// Open a 2nd tab and log cardio.
	await page.getByRole('button', { name: 'Add exercise tab' }).click();
	await page.getByRole('combobox').selectOption('cardio');
	await page.getByRole('button', { name: 'Rower' }).click();
	await page.getByRole('button', { name: 'Commit set' }).click();
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Post', exact: true }).click();

	// Tab 2 posted → its tab shows a checkmark; tab 1 still open.
	await expect(page.locator('.tab.posted')).toHaveCount(1);
	await expect(page).toHaveURL(/\/workout\/new$/);

	// Finish tab 1 → all posted → return to overview.
	await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Post', exact: true }).click();
	await expect(page).toHaveURL(/\/workout$/);
	await expect(page.getByText('Bench')).toBeVisible();
	await expect(page.getByText('Rower')).toBeVisible();
});

test('in-progress draft survives a reload (criterion #9)', async ({ page }) => {
	await signUp(page, 'd@example.com');
	const uid = await getUserId('d@example.com');
	await seedExercise(uid, { name: 'Bench', ...strength });

	await page.goto('/workout/new');
	await page.getByRole('button', { name: 'Bench' }).click();
	await page.getByRole('button', { name: 'Commit set' }).click();
	await expect(page.locator('.badge')).toHaveCount(1);

	await page.reload();
	await expect(page.locator('.badge')).toHaveCount(1);
	// The draft's tab (with the chosen exercise) is restored.
	await expect(page.getByRole('button', { name: 'Bench', exact: true })).toBeVisible();
});
