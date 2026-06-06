import { render } from 'vitest-browser-svelte';
import { expect, test } from 'vitest';
import RangeInput from './RangeInput.svelte';

test('renders a labelled number + range pair sharing the value', async () => {
	const screen = render(RangeInput, {
		value: 20,
		label: 'Weight',
		name: 'weightMin',
		min: 0,
		max: 120,
		step: 0.25
	});

	const number = screen.getByRole('spinbutton', { name: 'Weight' });
	const slider = screen.getByRole('slider', { name: 'Weight' });

	await expect.element(number).toHaveValue(20);
	await expect.element(slider).toHaveValue('20');
});
