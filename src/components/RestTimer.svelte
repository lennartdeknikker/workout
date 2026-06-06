<script lang="ts">
	import { onDestroy } from 'svelte';

	let total = $state(0);
	let left = $state(0);
	let interval: ReturnType<typeof setInterval> | undefined;

	const pct = $derived(total > 0 ? (left / total) * 100 : 0);

	function start(minutes: number) {
		clearInterval(interval);
		total = minutes * 60;
		left = total;
		interval = setInterval(() => {
			left -= 1;
			if (left <= 0) {
				clearInterval(interval);
				left = 0;
				total = 0;
			}
		}, 1000);
	}

	function stop() {
		clearInterval(interval);
		left = 0;
		total = 0;
	}

	function fmt(s: number): string {
		return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
	}

	onDestroy(() => clearInterval(interval));
</script>

<div class="rest" style={`--pct:${pct}%`}>
	<span class="label">Rest</span>
	{#each [1, 2, 3] as m (m)}
		<button type="button" class:active={total === m * 60 && left > 0} onclick={() => start(m)}>
			{m}
		</button>
	{/each}
	{#if left > 0}
		<span class="count">{fmt(left)}</span>
		<button type="button" class="stop" aria-label="Stop timer" onclick={stop}>✕</button>
	{/if}
</div>

<style>
	.rest {
		position: sticky;
		bottom: 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.75rem;
		margin-top: 1.5rem;
		border-top: 1px solid #000;
		background: linear-gradient(to right, #eee var(--pct), #fff var(--pct));
	}
	.label {
		font-weight: 600;
		margin-right: auto;
	}
	button {
		width: 1.9rem;
		height: 1.9rem;
		border: 1px solid #000;
		border-radius: 50%;
		background: #fff;
		cursor: pointer;
	}
	button.active {
		background: #000;
		color: #fff;
	}
	.count {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.stop {
		border-color: #c00;
		color: #c00;
	}
</style>
