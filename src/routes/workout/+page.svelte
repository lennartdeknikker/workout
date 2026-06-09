<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import ExerciseGroupList from '$components/ExerciseGroupList.svelte';
	import { formatDayLabel } from '$lib/domain/history';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function signOut() {
		await authClient.signOut();
		await goto(resolve('/login'));
	}
</script>

<svelte:head><title>Trainmate · Workout</title></svelte:head>

<header>
	<h1>Today</h1>
	{#if data.focusArea}<span class="focus">{data.focusArea}</span>{/if}
</header>
<p class="date">{formatDayLabel(data.today)}</p>

{#if data.groups.length === 0}
	<div class="zero">
		<p>No exercises logged today.</p>
		<a class="start" href={resolve('/workout/new')}>Start an exercise</a>
	</div>
{:else}
	<ExerciseGroupList groups={data.groups} />
	<a class="start" href={resolve('/workout/new')}>Start an exercise</a>
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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
	.date {
		color: #555;
		margin: 0.25rem 0 1rem;
	}
	.zero {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
		padding: 2rem 0;
	}
	.start {
		display: inline-block;
		background: #000;
		color: #fff;
		padding: 0.75rem 1.25rem;
		border-radius: 12px;
		text-decoration: none;
		font-weight: 600;
		margin-top: 1.5rem;
	}
	.signed-in {
		font-size: 0.9rem;
		color: #555;
		margin-top: 2rem;
	}
	.signed-in button {
		background: none;
		border: none;
		text-decoration: underline;
		cursor: pointer;
		color: inherit;
	}
</style>
