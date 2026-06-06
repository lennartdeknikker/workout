<script lang="ts">
	import { workoutDrafts } from '$lib/stores/workoutDrafts.svelte';

	interface Props {
		onadd: () => void;
	}
	let { onadd }: Props = $props();
</script>

<div class="tabs">
	{#each workoutDrafts.drafts as draft, i (draft.id)}
		<button
			type="button"
			class="tab"
			class:active={draft.id === workoutDrafts.activeId}
			class:posted={draft.posted}
			onclick={() => workoutDrafts.setActive(draft.id)}
		>
			{#if draft.posted}<span class="check" aria-label="posted">✓</span>{/if}
			{draft.exerciseName || `Exercise ${i + 1}`}
		</button>
	{/each}

	{#if workoutDrafts.canAddTab}
		<button type="button" class="add" aria-label="Add exercise tab" onclick={onadd}>+</button>
	{/if}
</div>

<style>
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
	}
	.tab {
		border: 1px solid #000;
		border-radius: 14px 14px 0 0;
		background: #fff;
		padding: 0.4rem 0.8rem;
		cursor: pointer;
		text-transform: capitalize;
	}
	.tab.active {
		background: #000;
		color: #fff;
	}
	.tab.posted {
		border-color: #00c01a;
	}
	.check {
		color: #00c01a;
		font-weight: 700;
	}
	.tab.active .check {
		color: #fff;
	}
	.add {
		border: 1px solid #000;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		font-size: 1.2rem;
		cursor: pointer;
		background: #fff;
	}
</style>
