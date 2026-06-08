import { test, expect } from '@playwright/test';
import { resetDb } from './helpers/db';

test.beforeEach(resetDb);

test('sign up → zero state → sign out → sign in (criterion #1)', async ({ page }) => {
	await page.goto('/signup');
	await page.getByLabel('Name').fill('Ada Lifter');
	await page.getByLabel('Email').fill('ada@example.com');
	await page.getByLabel('Password').fill('supersecret');
	await page.getByRole('button', { name: 'Create account' }).click();

	await expect(page).toHaveURL(/\/workout$/);
	await expect(page.getByText('No exercises logged today.')).toBeVisible();

	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/login$/);

	await page.getByLabel('Email').fill('ada@example.com');
	await page.getByLabel('Password').fill('supersecret');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page).toHaveURL(/\/workout$/);
});

test('rejects wrong password', async ({ page }) => {
	await page.goto('/signup');
	await page.getByLabel('Name').fill('Bo');
	await page.getByLabel('Email').fill('bo@example.com');
	await page.getByLabel('Password').fill('supersecret');
	await page.getByRole('button', { name: 'Create account' }).click();
	await expect(page).toHaveURL(/\/workout$/);
	await page.getByRole('button', { name: 'Sign out' }).click();

	await page.getByLabel('Email').fill('bo@example.com');
	await page.getByLabel('Password').fill('wrongpassword');
	await page.getByRole('button', { name: 'Sign in' }).click();
	await expect(page.getByText('Invalid email or password')).toBeVisible();
});

test('unauthenticated access redirects to login', async ({ page }) => {
	await page.goto('/exercises');
	await expect(page).toHaveURL(/\/login\?redirect=/);
});
