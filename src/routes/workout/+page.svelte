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
	<p>Today's overview lands here next (Phase 5). For now, start logging:</p>
	<a class="start" href={resolve('/workout/new')}>Start an exercise</a>
	<p class="signed-in">
		Signed in as {data.user?.email} · <button onclick={signOut}>Sign out</button>
	</p>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: flex-start;
	}
	.start {
		display: inline-block;
		background: #000;
		color: #fff;
		padding: 0.75rem 1.25rem;
		border-radius: 12px;
		text-decoration: none;
		font-weight: 600;
	}
	.signed-in {
		font-size: 0.9rem;
		color: #555;
	}
	.signed-in button {
		background: none;
		border: none;
		text-decoration: underline;
		cursor: pointer;
		color: inherit;
	}
</style>
