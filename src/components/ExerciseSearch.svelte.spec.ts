import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { expect, test, vi, afterEach } from 'vitest';
import ExerciseSearch from './ExerciseSearch.svelte';

afterEach(() => vi.unstubAllGlobals());

function jsonResponse(body: unknown) {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'content-type': 'application/json' }
	});
}

test('searches (debounced), renders results, and pick fires onselect', async () => {
	vi.stubGlobal(
		'fetch',
		vi.fn(async (url: string) =>
			String(url).includes('/api/exercise-search/EX1')
				? jsonResponse({
						exerciseId: 'EX1',
						name: 'bench press',
						gifUrl: 'http://x/EX1.gif',
						targetMuscles: ['chest'],
						bodyParts: [],
						equipments: [],
						secondaryMuscles: [],
						instructions: []
					})
				: jsonResponse({
						results: [{ exerciseId: 'EX1', name: 'bench press', gifUrl: 'http://x/EX1.gif' }]
					})
		)
	);

	const onselect = vi.fn();
	const screen = render(ExerciseSearch, { onselect });
	await userEvent.type(screen.getByPlaceholder('e.g. bench press'), 'bench');

	const result = screen.getByRole('button', { name: /bench press/i });
	await expect.element(result).toBeVisible();
	await result.click();
	expect(onselect).toHaveBeenCalledOnce();
});

test('does not query the proxy below 2 characters', async () => {
	const fetchMock = vi.fn(async () => jsonResponse({ results: [] }));
	vi.stubGlobal('fetch', fetchMock);

	const screen = render(ExerciseSearch, { onselect: () => {} });
	await userEvent.type(screen.getByPlaceholder('e.g. bench press'), 'b');
	await new Promise((r) => setTimeout(r, 400));
	expect(fetchMock).not.toHaveBeenCalled();
});
