<script lang="ts">
	import { resolve } from '$app/paths';
	import ExerciseGroupList from '$components/ExerciseGroupList.svelte';
	import { formatDayLabel } from '$lib/domain/history';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Trainmate · {formatDayLabel(data.date)}</title></svelte:head>

<p><a href={resolve('/history')}>← Previous workouts</a></p>
<header>
	<h1>{formatDayLabel(data.date)}</h1>
	{#if data.focusArea}<span class="focus">{data.focusArea}</span>{/if}
</header>

<ExerciseGroupList groups={data.groups} />

<style>
	header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
	}
	h1 {
		margin: 0;
	}
	.focus {
		text-transform: capitalize;
		background: #000;
		color: #fff;
		border-radius: 8px;
		padding: 0.15rem 0.5rem;
		font-size: 0.9rem;
	}
</style>
