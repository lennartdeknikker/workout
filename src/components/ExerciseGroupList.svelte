<script lang="ts">
	import SetBadge from './SetBadge.svelte';
	import { formatLoggedSet, type ExerciseGroup } from '$lib/domain/history';

	let { groups }: { groups: ExerciseGroup[] } = $props();
</script>

<ul class="groups">
	{#each groups as group (group.key)}
		<li>
			<h3>{group.exerciseName} <span class="tag">{group.routine}</span></h3>
			<div class="sets">
				{#each group.sets as set, i (i)}
					<SetBadge label={formatLoggedSet(set)} />
				{/each}
			</div>
		</li>
	{/each}
</ul>

<style>
	.groups {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	li {
		border: 1px solid #000;
		border-radius: 10px;
		padding: 0.75rem 1rem;
	}
	h3 {
		margin: 0 0 0.5rem;
		text-transform: capitalize;
	}
	.tag {
		font-size: 0.75rem;
		color: #555;
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 0.1rem 0.4rem;
		vertical-align: middle;
	}
	.sets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
</style>
