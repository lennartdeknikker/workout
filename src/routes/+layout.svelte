<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import TimerBar from '$components/TimerBar.svelte';
	import { onMount } from 'svelte';
	import { pwaInfo } from 'virtual:pwa-info';
	import { authClient } from '$lib/auth-client';
	import type { LayoutData } from './$types';

	async function signOut() {
		await authClient.signOut();
		goto('/login');
	}

	let { children, data }: { data: LayoutData; children: import('svelte').Snippet } = $props();

	const showNav = $derived(!!data.user && !['/login', '/signup'].includes(page.url.pathname));
	const webManifestLink = pwaInfo ? pwaInfo.webManifest.linkTag : '';

	let showFullFooter = $derived(!!data.user && page.url.pathname === '/workout');

	onMount(() => {
		// Let the server compute "today" in the user's zone for the workout/history views.
		const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
		document.cookie = `tz=${encodeURIComponent(tz)}; path=/; max-age=31536000; samesite=lax`;

		// Register the service worker (auto-updates in the background).
		import('virtual:pwa-register').then(({ registerSW }) => registerSW({ immediate: true }));
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html webManifestLink}
</svelte:head>

<div class="app">
	{#if showNav}
		<nav>
			<strong> Trainmate </strong>
			<div class="nav-links">
				<a href={resolve('/workout')}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M3 10h3v4H3zM18 10h3v4h-3zM6 8h12v8H6z" />
					</svg>
					Workout
				</a>
				<a href={resolve('/history')}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<circle cx="12" cy="12" r="8" />
						<path d="M12 8v4h3" />
					</svg>
					History
				</a>
				<a href={resolve('/exercises')}>
					<svg viewBox="0 0 24 24" aria-hidden="true">
						<path d="M7 8h11M7 12h11M7 16h11" />
						<circle cx="4" cy="8" r="1.5" />
						<circle cx="4" cy="12" r="1.5" />
						<circle cx="4" cy="16" r="1.5" />
					</svg>
					Exercises
				</a>
			</div>
		</nav>
	{/if}

	<main>
		{@render children()}
	</main>

	{#if showNav}
		<TimerBar />
	{/if}

	<footer class:full={showFullFooter}>
		<button id="settings-button" onclick={() => (showFullFooter = !showFullFooter)}>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<path
					fill="currentColor"
					fill-rule="evenodd"
					d="m10.65 3-.71837.53449-.60409 2.01363-1.85103-.99671-.88591.13002-1.90919 1.90919-.13002.8859.99671 1.85103-2.01361.60408L3 10.65v2.7l.53449.7184 2.01362.6041-.99669 1.851.13002.8859 1.90919 1.9092.8859.13 1.85101-.9967.60409 2.0136L10.65 21h2.7l.7184-.5345.6041-2.0136 1.851.9967.8859-.1301 1.9092-1.9091.13-.8859-.9967-1.8511 2.0136-.604L21 13.35v-2.7l-.5345-.71837-2.0136-.60409.9967-1.851-.13-.88591-1.9092-1.90919-.8859-.13002-1.851.9967-.6041-2.01363L13.35 3zm-.1808 3.96284L11.208 4.5h1.584l.7388 2.46284.3445.13176c.0901.03448.179.07137.2667.1106l.3369.15078 2.2644-1.2193 1.12 1.12003-1.2193 2.2644.1508.33692c.0392.08767.0761.17657.1106.26667l.1318.3445 2.4628.7388v1.584l-2.4628.7388-.1318.3445c-.0345.0901-.0714.179-.1106.2666l-.1508.337 1.2193 2.2644-1.12 1.12-2.2644-1.2193-.3369.1508c-.0877.0392-.1766.0761-.2667.1106l-.3445.1318L12.792 19.5h-1.584l-.7388-2.4628-.3445-.1318a5.267 5.267 0 0 1-.26667-.1106l-.33692-.1508-2.2644 1.2193-1.12003-1.12 1.21929-2.2644-.15077-.3369a5.237 5.237 0 0 1-.1106-.2667l-.13176-.3445L4.5 12.792v-1.584l2.46284-.7388.13176-.3445a5.21 5.21 0 0 1 .11059-.26665l.15077-.33692-1.2193-2.26443 1.12002-1.12003L9.5211 7.35598l.33693-.15078a5.225 5.225 0 0 1 .26667-.1106zM14.25 12c0 1.2426-1.0074 2.25-2.25 2.25S9.75 13.2426 9.75 12 10.7574 9.75 12 9.75s2.25 1.0074 2.25 2.25m1.5 0c0 2.0711-1.6789 3.75-3.75 3.75-2.07107 0-3.75-1.6789-3.75-3.75 0-2.07107 1.67893-3.75 3.75-3.75 2.0711 0 3.75 1.67893 3.75 3.75"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
		<p class="signed-in">
			Signed in as {data.user?.email}
		</p>

		<div class="settings">
			<button onclick={signOut}>
				<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						fill-rule="evenodd"
						d="M6 3C4.34315 3 3 4.34315 3 6v12c0 1.6569 1.34315 3 3 3h11c.5523 0 1-.4477 1-1s-.4477-1-1-1H6c-.55228 0-1-.4477-1-1V6c0-.55228.44772-1 1-1h11c.5523 0 1-.44772 1-1s-.4477-1-1-1zm9.7071 4.29289c-.3905-.39052-1.0237-.39052-1.4142 0-.3905.39053-.3905 1.02369 0 1.41422L16.5858 11H8c-.55228 0-1 .4477-1 1s.44772 1 1 1h8.5858l-2.2929 2.2929c-.3905.3905-.3905 1.0237 0 1.4142s1.0237.3905 1.4142 0l4-4c.3905-.3905.3905-1.0237 0-1.4142z"
						clip-rule="evenodd"
					/>
				</svg>
				Sign out
			</button>
		</div>
	</footer>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
	}

	.app {
		max-width: 40rem;
		margin: 0 auto;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
	nav {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0.2rem 0 0.5rem;
		justify-content: center;
		width: 100%;
		align-items: center;
		margin-bottom: 1rem;
		border-bottom: 1px solid #000;
		background: #000;
		color: #fff;
	}
	nav strong {
		font-family: 'Notable', system-ui;
		font-size: 2rem;
		font-style: normal;
		gap: 0.4rem;
	}

	.nav-links {
		display: flex;
		gap: 1rem;
	}

	.nav-links a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Elms Sans', sans-serif;
		text-decoration: none;
		color: #fff;
		font-weight: bold;
	}

	.nav-links svg {
		width: 1.25rem;
		height: 1.25rem;
		flex-shrink: 0;
		stroke: currentColor;
		stroke-width: 2;
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	main {
		padding: 1rem;
		flex-grow: 1;
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 0.5rem 1rem 4.8rem;
		background: #f9f9f9;
		font-size: 0.9rem;
		color: #555;
		position: relative;
		transform: translateY(4.8rem);
		transition: transform 0.3s ease;
	}

	footer .settings {
		padding: 0.5rem 1rem;
		display: block;
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 4.8rem;
		box-sizing: border-box;
	}

	footer.full {
		transform: translateY(0);
		#settings-button {
			transform: rotate(90deg);
		}
	}

	footer #settings-button {
		background: none;
		border: none;
		text-decoration: none;
		cursor: pointer;
		color: #555;
		width: 1.5rem;
		height: 1.5rem;
		padding: 0;
		position: absolute;
		left: 1rem;
		transition: transform 0.3s ease;
		transform: rotate(0deg);
	}

	footer .settings button {
		background: black;
		border: none;
		text-decoration: none;
		cursor: pointer;
		color: white;
		border-radius: 8px;
		padding: 0.75rem 1.25rem;
		font-weight: 600;
		font-size: 1rem;
		max-height: 4.8rem;
		display: inline-flex;
		gap: 0.5rem;

		svg {
			height: 1.2em;
			width: 1.2em;
		}
	}
</style>
