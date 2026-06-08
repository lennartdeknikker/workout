import type { Page } from '@playwright/test';

/**
 * Choose a `<select name=…>` option by firing a real `change` event — exactly what a human's
 * dropdown selection produces. (Playwright's `selectOption` doesn't reliably update Svelte 5
 * state for a select that drives a conditional re-render; a real change event does.)
 */
export async function chooseSelect(page: Page, name: string, value: string): Promise<void> {
	await page.locator(`select[name="${name}"]`).evaluate((el, v) => {
		(el as HTMLSelectElement).value = v;
		el.dispatchEvent(new Event('change', { bubbles: true }));
	}, value);
}
