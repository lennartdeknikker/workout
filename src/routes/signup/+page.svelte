<script lang="ts">
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { authClient } from '$lib/auth-client';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state<string | null>(null);
	let pending = $state(false);

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		error = null;
		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}
		pending = true;
		const { error: err } = await authClient.signUp.email({ name, email, password });
		pending = false;
		if (err) {
			error = err.message ?? 'Could not create account';
			return;
		}
		await invalidateAll();
		await goto(resolve('/workout'));
	}
</script>

<svelte:head><title>Trainmate · Sign up</title></svelte:head>

<main>
	<h1>Create account</h1>
	<form onsubmit={handleSubmit}>
		<label>
			Name
			<input type="text" bind:value={name} autocomplete="name" required />
		</label>
		<label>
			Email
			<input type="email" bind:value={email} autocomplete="email" required />
		</label>
		<label>
			Password
			<input type="password" bind:value={password} autocomplete="new-password" required />
		</label>
		{#if error}<p class="error">{error}</p>{/if}
		<button type="submit" disabled={pending}>{pending ? 'Creating…' : 'Create account'}</button>
	</form>
	<p>Already have an account? <a href={resolve('/login')}>Sign in</a></p>
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
