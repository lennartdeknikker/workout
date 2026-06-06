<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import ExerciseForm from '$components/ExerciseForm.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head><title>Trainmate · Edit exercise</title></svelte:head>

<p><a href={resolve('/exercises')}>← Exercises</a></p>
<h1>Edit exercise</h1>

<ExerciseForm initial={data.exercise} submitLabel="Save changes" action="?/update" />

<form
	method="POST"
	action="?/delete"
	class="delete"
	use:enhance={() => {
		return async ({ result }) => {
			// result.location is the redirect target from our own server action.
			// eslint-disable-next-line svelte/no-navigation-without-resolve
			if (result.type === 'redirect') await goto(result.location);
		};
	}}
>
	<button type="submit">Delete exercise</button>
</form>

<style>
	.delete {
		margin-top: 2rem;
	}
	.delete button {
		color: #c00;
		background: transparent;
		border: 1px solid #c00;
		border-radius: 8px;
		padding: 0.5rem 1rem;
		cursor: pointer;
	}
</style>
