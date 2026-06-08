import { test, expect } from '@playwright/test';
import { resetDb, getUserId, seedExercise } from './helpers/db';
import { signUp } from './helpers/auth';

const ORIGIN = 'http://localhost:4173';

test.beforeEach(resetDb);

test('users cannot see each other’s data (criterion #10)', async ({ browser }) => {
	const ctxA = await browser.newContext({ baseURL: ORIGIN });
	const a = await ctxA.newPage();
	await signUp(a, 'alice@example.com');
	const aliceId = await getUserId('alice@example.com');
	await seedExercise(aliceId, {
		name: 'Alice Only Bench',
		routine: 'push',
		measurementType: 'strength'
	});

	const ctxB = await browser.newContext({ baseURL: ORIGIN });
	const b = await ctxB.newPage();
	await signUp(b, 'bob@example.com');

	// Bob sees an empty library; Alice's exercise is not visible to him.
	await b.goto('/exercises');
	await expect(b.getByText('No exercises yet.')).toBeVisible();
	await expect(b.getByText('Alice Only Bench')).toHaveCount(0);

	// Alice still sees her own.
	await a.goto('/exercises');
	await expect(a.getByText('Alice Only Bench')).toBeVisible();

	await ctxA.close();
	await ctxB.close();
});
