<script lang="ts">
	import type { ExerciseDbSearchResult, ExerciseDbSnapshot } from '$lib/domain/exercisedb';
	import { lazysrc } from '$lib/actions/lazysrc';

	interface Props {
		onselect: (snapshot: ExerciseDbSnapshot) => void;
	}

	let { onselect }: Props = $props();

	let query = $state('');
	let results = $state<ExerciseDbSearchResult[]>([]);
	let loading = $state(false);
	let message = $state<string | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function onInput() {
		clearTimeout(timer);
		const q = query.trim();
		if (q.length < 2) {
			results = [];
			message = null;
			return;
		}
		timer = setTimeout(() => runSearch(q), 300);
	}

	async function runSearch(q: string) {
		loading = true;
		message = null;
		try {
			const res = await fetch(`/api/exercise-search?q=${encodeURIComponent(q)}`);
			const data = (await res.json()) as { results?: ExerciseDbSearchResult[] };
			results = data.results ?? [];
			if (results.length === 0) message = 'No matches — add a custom exercise below.';
		} catch {
			results = [];
			message = 'Search unavailable — add a custom exercise below.';
		} finally {
			loading = false;
		}
	}

	async function pick(result: ExerciseDbSearchResult) {
		try {
			const res = await fetch(`/api/exercise-search/${result.exerciseId}`);
			if (!res.ok) throw new Error('detail failed');
			const snapshot = (await res.json()) as ExerciseDbSnapshot;
			onselect(snapshot);
			query = result.name;
			results = [];
			message = null;
		} catch {
			message = 'Could not load that exercise. Try again or add it manually.';
		}
	}
</script>

<div class="search">
	<label>
		<span>Search ExerciseDB</span>
		<input
			type="search"
			placeholder="e.g. bench press"
			bind:value={query}
			oninput={onInput}
			autocomplete="off"
		/>
	</label>

	{#if loading}<p class="hint">Searching…</p>{/if}
	{#if message}<p class="hint">{message}</p>{/if}

	{#if results.length > 0}
		<ul>
			{#each results as result (result.exerciseId)}
				<li>
					<button type="button" onclick={() => pick(result)}>
						<img use:lazysrc={result.gifUrl} alt="" />
						<span>{result.name}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.search {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.hint {
		margin: 0;
		font-size: 0.9rem;
		color: #555;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		max-height: 16rem;
		overflow-y: auto;
		border: 1px solid #ddd;
		border-radius: 8px;
	}
	li button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		padding: 0.4rem 0.6rem;
		background: transparent;
		border: none;
		border-bottom: 1px solid #eee;
		cursor: pointer;
		text-align: left;
		text-transform: capitalize;
	}
	li button img {
		width: 2.5rem;
		height: 2.5rem;
		object-fit: cover;
		border-radius: 6px;
		background: #f3f3f3;
	}
</style>
