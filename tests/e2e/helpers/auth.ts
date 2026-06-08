import type { Page } from '@playwright/test';

/**
 * Programmatic sign-up via the better-auth API. The session cookie lands in the
 * page's browser context, so subsequent navigations are authenticated.
 */
export async function signUp(
	page: Page,
	email: string,
	password = 'supersecret',
	name = 'Test User'
): Promise<void> {
	const res = await page.request.post('/api/auth/sign-up/email', {
		data: { name, email, password }
	});
	if (!res.ok()) throw new Error(`sign-up failed (${res.status()}): ${await res.text()}`);
}
