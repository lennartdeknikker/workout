<script lang="ts">
	import ExerciseForm from '$components/ExerciseForm.svelte';
	import pushExercises from '$constants/push-exercises.json';
	import pullExercises from '$constants/pull-exercises.json';
	import legsExercises from '$constants/legs-exercises.json';
	import cardioExercises from '$constants/cardio-exercises.json';

	const exercises = [
		...pushExercises,
		...pullExercises,
		...legsExercises,
		...cardioExercises,
	]
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
