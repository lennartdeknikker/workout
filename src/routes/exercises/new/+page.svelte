<script lang="ts">
	import { resolve } from '$app/paths';
	import ExerciseForm from '$components/ExerciseForm.svelte';
</script>

<svelte:head><title>Trainmate · Add exercise</title></svelte:head>

<p><a href={resolve('/exercises')}>← Exercises</a></p>
<h1>Add exercise</h1>

<ExerciseForm submitLabel="Add exercise" />
