<script lang="ts">
	import { resolve } from '$app/paths';
	import { ROUTINES } from '$lib/schemas/exercise';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const byRoutine = $derived(
		ROUTINES.map((routine) => ({
			routine,
			items: data.exercises.filter((e) => e.routine === routine)
		})).filter((group) => group.items.length > 0)
	);
</script>

<svelte:head><title>Trainmate · Exercises</title></svelte:head>

<header>
	<h1>Exercises</h1>
	<a class="add" href={resolve('/exercises/new')}>+ Add</a>
</header>

{#if data.exercises.length === 0}
	<p class="empty">No exercises yet. <a href={resolve('/exercises/new')}>Add your first one.</a></p>
{:else}
	{#each byRoutine as group (group.routine)}
		<section>
			<h2>{group.routine}</h2>
			<ul>
				{#each group.items as exercise (exercise.id)}
					<li>
						<a href={resolve('/exercises/[id]/edit', { id: exercise.id })}>
							{#if exercise.gif_url}<img src={exercise.gif_url} alt="" loading="lazy" />{/if}
							<span class="name">{exercise.name}</span>
							<span class="tag">{exercise.measurement_type}</span>
						</a>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.add {
		font-weight: 600;
	}
	h2 {
		text-transform: capitalize;
		margin-bottom: 0.5rem;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	li a {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.4rem 0.6rem;
		border: 1px solid #000;
		border-radius: 10px;
		text-decoration: none;
		color: inherit;
		text-transform: capitalize;
	}
	li img {
		width: 2.5rem;
		height: 2.5rem;
		object-fit: cover;
		border-radius: 6px;
		background: #f3f3f3;
	}
	.name {
		flex: 1;
	}
	.tag {
		font-size: 0.8rem;
		color: #555;
	}
	.empty {
		color: #555;
	}
</style>
