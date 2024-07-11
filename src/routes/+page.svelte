<script lang="ts">
	import exercises from '$constants/exercises.json';

	let selectedType: string;
	let selectedExercise: string;
	let selectedWeight: number = 10;

	let sets: {
		reps: number;
		weight: number;
	}[] = [];

	$: filteredExercices = exercises.filter((exercise) => exercise.type === selectedType);
	$: currentExercise = filteredExercices.find((exercise) => exercise.label === selectedExercise);

	$: selectedReps = currentExercise?.reps.min;

	$: addSet = () => {
		if (selectedReps && selectedWeight) {
			console.log('adding set', selectedReps, selectedWeight);
			sets = [...sets, { reps: selectedReps, weight: selectedWeight }];
		}
	};

  $: submit = (event: Event) => {
    event.preventDefault();
    console.log('submitting', sets);
    const data = {
      date: new Date(),
      
    }
  }
</script>

<form on:submit={submit}>
	<!-- workout time -->

	<fieldset>
		<legend>Exercise</legend>
		<input type="hidden" value={new Date()} />

		<!-- workout type -->
		<div class="form-item">
			<label for="type"> Workout type </label>
			<select id="workout-type" name="workout-type" bind:value={selectedType}>
				<option value="push">Push</option>
				<option value="pull">Pull</option>
				<option value="legs">Legs</option>
				<option value="core">Core</option>
				<option value="cardio">Cardio</option>
			</select>
		</div>

		<!-- workout exercise -->
		<div class="form-item">
			<label for="ice-cream-choice">Exercise</label>
			<input
				list="ice-cream-flavors"
				id="ice-cream-choice"
				name="ice-cream-choice"
				bind:value={selectedExercise}
			/>
			<datalist id="ice-cream-flavors">
				{#each filteredExercices as exercise}
					<option value={exercise.label}></option>
				{/each}
			</datalist>
		</div>
	</fieldset>
	<fieldset>
		<legend>Set</legend>

		<!-- Exercise weight -->
		<label for="weight">Weight</label>
		<input type="number" bind:value={selectedWeight} step="0.25" />

		<!-- reps -->
		<label for="reps">Reps</label>
		<input
			type="range"
			min={currentExercise?.reps.min ?? 5}
			max={currentExercise?.reps.max ?? 20}
			bind:value={selectedReps}
		/>
		<input type="number" bind:value={selectedReps} />
		<button on:click={addSet}>Add</button>
	</fieldset>

	<fieldset>
		<legend>Overview</legend>
		{currentExercise?.label}
		<ul>
			{#each sets as set}
				<li>{set.reps}X - {set.weight}kg</li>
			{/each}
		</ul>
		<button type="submit">Submit</button>
	</fieldset>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: 30rem;
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
