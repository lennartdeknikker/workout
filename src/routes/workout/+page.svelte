<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	async function signOut() {
		await authClient.signOut();
		await goto(resolve('/login'));
	}
</script>

<svelte:head><title>Trainmate · Workout</title></svelte:head>

<main>
	<h1>Workout</h1>
	<p>Signed in as <strong>{data.user?.email}</strong>.</p>
	<p>Today's overview and the logging form land here next (Phase 4/5).</p>
	<button onclick={signOut}>Sign out</button>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}
</style>
