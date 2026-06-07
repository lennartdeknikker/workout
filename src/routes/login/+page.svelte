<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { authClient } from '$lib/auth-client';

	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let pending = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		pending = true;
		const { error: err } = await authClient.signIn.email({ email, password });
		pending = false;
		if (err) {
			error = 'Invalid email or password';
			return;
		}
		// Refresh server-loaded layout data (user) before navigating.
		await invalidateAll();
		const redirectTo = page.url.searchParams.get('redirect');
		// redirectTo is a same-origin pathname set by our own auth guard.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto(redirectTo ?? resolve('/workout'));
	}
</script>

<svelte:head><title>Trainmate · Sign in</title></svelte:head>

<main>
	<h1>Sign in</h1>
	<form onsubmit={handleSubmit}>
		<label>
			Email
			<input type="email" bind:value={email} autocomplete="email" required />
		</label>
		<label>
			Password
			<input type="password" bind:value={password} autocomplete="current-password" required />
		</label>
		{#if error}<p class="error">{error}</p>{/if}
		<button type="submit" disabled={pending}>{pending ? 'Signing in…' : 'Sign in'}</button>
	</form>
	<p>No account? <a href={resolve('/signup')}>Create one</a></p>
</main>

<style>
	main {
		max-width: 22rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.error {
		color: #c00;
		margin: 0;
	}
</style>
