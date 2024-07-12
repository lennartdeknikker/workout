<script lang="ts">
	import Navigation from '../components/Navigation.svelte';
	import TimerBar from '$components/TimerBar.svelte';

	import { onMount } from 'svelte';
	import { session, type SessionState, type User } from '$lib/session';
	import { goto } from '$app/navigation';
	import { signOut } from 'firebase/auth';
	import { auth } from '$lib/firebase.client';

	import type { LayoutData } from './$types';
	export let data: LayoutData;
	let loading: boolean = true;
	let loggedIn: boolean = false;
	let user: User | null = null;

	session.subscribe((cur: SessionState) => {
		loading = cur?.loading ?? false;
		loggedIn = cur?.loggedIn ?? false;
		user = cur?.user ?? null;
	});

	onMount(async () => {
		user = await data.getAuthUser() ?? null;

		const loggedIn = !!user && user?.emailVerified;
		session.update((cur: any) => {
			loading = false;
			return {
				...cur,
				user,
				loggedIn,
				loading: false
			};
		});

		if (loggedIn) {
			goto('/');
		}
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="Layout">
	<header>
		<Navigation />
	</header>
	{#if loading}
		<div>Loading...</div>
	{:else}
		<TimerBar />
		<slot />
	{/if}
</div>

<style>
	:global(html) {
		position: relative;
		font-family: 'Rubik', sans-serif;
		font-size: 10px;
		overflow-x: hidden;
	}

	:global(body) {
		margin: 0 auto;
		overflow-x: hidden;
		width: 100vw;
		position: relative;
	}

	:global(h1) {
		font-size: clamp(2.4rem, 5vw, 3.6rem);
	}
	:global(svg) {
		width: 1em;
	}

	.Layout {
		max-width: 100rem;
		width: fit-content;
		padding: 2.4rem;
		box-sizing: border-box;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	header {
		display: flex;
		justify-content: center;
	}
</style>
