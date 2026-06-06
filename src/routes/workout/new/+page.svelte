<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import WorkoutTabs from '$components/WorkoutTabs.svelte';
	import DraftForm from '$components/DraftForm.svelte';
	import { workoutDrafts } from '$lib/stores/workoutDrafts.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	onMount(() => {
		workoutDrafts.hydrate();
		if (workoutDrafts.drafts.length === 0 || workoutDrafts.allPosted) {
			workoutDrafts.reset();
			workoutDrafts.openTab(crypto.randomUUID());
		}
	});

	function addTab() {
		if (workoutDrafts.canAddTab) workoutDrafts.openTab(crypto.randomUUID());
	}

	function finished() {
		goto(resolve('/workout'));
	}
</script>

<svelte:head><title>Trainmate · Log workout</title></svelte:head>

<p><a href={resolve('/workout')}>← Workout</a></p>
<h1>Log exercise</h1>

<WorkoutTabs onadd={addTab} />
<DraftForm exercises={data.exercises} onfinished={finished} />
