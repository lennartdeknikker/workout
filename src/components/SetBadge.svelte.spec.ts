import { render } from 'vitest-browser-svelte';
import { expect, test, vi } from 'vitest';
import SetBadge from './SetBadge.svelte';

test('renders the label', async () => {
	const screen = render(SetBadge, { label: '120kg | 11x' });
	await expect.element(screen.getByText('120kg | 11x')).toBeVisible();
});

test('the remove button fires onremove', async () => {
	const onremove = vi.fn();
	const screen = render(SetBadge, { label: '12x', onremove });
	await screen.getByRole('button', { name: 'Remove set' }).click();
	expect(onremove).toHaveBeenCalledOnce();
});

test('renders no remove button when onremove is omitted', () => {
	const screen = render(SetBadge, { label: '12x' });
	expect(screen.getByRole('button', { name: 'Remove set' }).elements()).toHaveLength(0);
});
