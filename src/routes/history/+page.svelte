<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDayLabel } from '$lib/domain/history';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Trainmate · Previous workouts</title></svelte:head>

<h1>Previous workouts</h1>

{#if data.days.length === 0}
	<p class="empty">No workouts logged yet.</p>
{:else}
	<ul>
		{#each data.days as day (day.workoutDate)}
			<li>
				<a href={resolve('/history/[date]', { date: day.workoutDate })}>
					<span class="day">{formatDayLabel(day.workoutDate)}</span>
					{#if day.focusArea}<span class="focus">{day.focusArea}</span>{/if}
					<span class="meta">{day.exerciseCount} exercises · {day.setCount} sets</span>
				</a>
			</li>
		{/each}
	</ul>
{/if}

<style>
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	a {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border: 1px solid #000;
		border-radius: 10px;
		text-decoration: none;
		color: inherit;
	}
	.day {
		font-weight: 600;
	}
	.focus {
		text-transform: capitalize;
		background: #000;
		color: #fff;
		border-radius: 8px;
		padding: 0.1rem 0.5rem;
		font-size: 0.85rem;
	}
	.meta {
		margin-left: auto;
		color: #555;
		font-size: 0.85rem;
	}
	.empty {
		color: #555;
	}
</style>
