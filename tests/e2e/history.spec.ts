import { test, expect } from '@playwright/test';
import { resetDb, getUserId, seedExercise, seedSetLog } from './helpers/db';
import { signUp } from './helpers/auth';

test.beforeEach(resetDb);

test('history lists past days with focus + shows detail (criterion #7)', async ({ page }) => {
	await signUp(page, 'h@example.com');
	const uid = await getUserId('h@example.com');
	await seedSetLog(uid, {
		workoutDate: '2026-06-01',
		exerciseName: 'Old Squat',
		routine: 'legs',
		measurementType: 'strength',
		sets: [
			{ weight: 80, reps: 10 },
			{ weight: 80, reps: 8 }
		]
	});
	await seedSetLog(uid, {
		workoutDate: '2026-06-03',
		exerciseName: 'Incline Bench',
		routine: 'push',
		measurementType: 'strength',
		sets: [{ weight: 60, reps: 10 }]
	});

	await page.goto('/history');
	await expect(page.getByText('1 Jun')).toBeVisible();
	await expect(page.getByText('3 Jun')).toBeVisible();
	await expect(page.getByText('legs')).toBeVisible();

	await page.getByRole('link', { name: /1 Jun/ }).click();
	await expect(page).toHaveURL(/\/history\/2026-06-01$/);
	await expect(page.getByText('Old Squat')).toBeVisible();
	await expect(page.getByText('80kg | 10x')).toBeVisible();
});

test('deleting an exercise keeps its logged history (criterion #8)', async ({ page }) => {
	await signUp(page, 'del@example.com');
	const uid = await getUserId('del@example.com');
	const exId = await seedExercise(uid, {
		name: 'Bench',
		routine: 'push',
		measurementType: 'strength'
	});
	await seedSetLog(uid, {
		workoutDate: '2026-06-02',
		exerciseId: exId,
		exerciseName: 'Bench',
		routine: 'push',
		measurementType: 'strength',
		sets: [{ weight: 60, reps: 10 }]
	});

	await page.goto(`/exercises/${exId}/edit`);
	await page.getByRole('button', { name: 'Delete exercise' }).click();
	await expect(page).toHaveURL(/\/exercises$/);

	await page.goto('/history/2026-06-02');
	await expect(page.getByText('Bench')).toBeVisible();
	await expect(page.getByText('60kg | 10x')).toBeVisible();
});
