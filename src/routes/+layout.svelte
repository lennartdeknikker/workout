<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import RestTimer from '$components/RestTimer.svelte';
	import { onMount } from 'svelte';
	import type { LayoutData } from './$types';

	let { children, data }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const showNav = $derived(!!data.user && !['/login', '/signup'].includes(page.url.pathname));

	// Let the server compute "today" in the user's zone for the workout/history views.
	onMount(() => {
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	{#if showNav}
		<nav>
			<strong>Trainmate</strong>
			<a href={resolve('/workout')}>Workout</a>
			<a href={resolve('/history')}>History</a>
			<a href={resolve('/exercises')}>Exercises</a>
		</nav>
	{/if}

	<main>
		{@render children()}
	</main>

	{#if showNav}
		<RestTimer />
	{/if}
</div>

<style>
	.app {
		max-width: 40rem;
		margin: 0 auto;
		padding: 1rem;
	}
	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding-bottom: 1rem;
		margin-bottom: 1rem;
		border-bottom: 1px solid #000;
	}
	nav strong {
		margin-right: auto;
	}
</style>
