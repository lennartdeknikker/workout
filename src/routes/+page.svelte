<script lang="ts">
	import ExerciseForm from '$components/ExerciseForm.svelte';
	import exercises from '$constants/exercises.json';
</script>

<div class="Page">
	<main>
		<ExerciseForm {exercises} />
	</main>
</div>

<style>
	.Page {
		position: relative;
	}
</style>
