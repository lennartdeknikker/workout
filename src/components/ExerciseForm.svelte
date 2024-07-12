<script lang="ts">
	import type { Exercise } from '$interfaces/exercise';

	export let exercises: Exercise[];

	let selectedType: string;
	let selectedExerciseLabel: string;
	let selectedWeight: number = 10;

	let sets: {
		reps: number;
		weight: number;
	}[] = [];

	$: filteredExercices = exercises.filter((exercise) => exercise.type === selectedType);
	$: selectedExercise = filteredExercices.find(
		(exercise) => exercise.label === selectedExerciseLabel
	);

	$: selectedReps = selectedExercise?.reps.min;

	$: addSet = () => {
		if (selectedReps && selectedWeight) {
			console.log('adding set', selectedReps, selectedWeight);
			sets = [...sets, { reps: selectedReps, weight: selectedWeight }];
		}
	};
</script>

<form method="POST" action="?/submit">
	<!-- workout time -->

	<fieldset>
		<div>
			<legend><h2>Exercise</h2></legend>
		</div>
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
			<label for="exercise">Exercise</label>
			<input list="exercises" bind:value={selectedExerciseLabel} />
			<datalist id="exercises">
				{#each filteredExercices as exercise}
					<option>{exercise.label}</option>
				{/each}
			</datalist>
			<input type="hidden" value={selectedExercise?.id} name="exercise" id="exercise" />
		</div>
	</fieldset>
	<fieldset>
		<div>
			<legend><h2>Set</h2></legend>
		</div>

		<!-- Exercise weight -->
		<label for="weight">Weight</label>
		<input type="number" bind:value={selectedWeight} step="0.25" />

		<!-- reps -->
		<label for="reps">Reps</label>
		<input
			type="range"
			min={selectedExercise?.reps.min ?? 5}
			max={selectedExercise?.reps.max ?? 20}
			bind:value={selectedReps}
		/>
		<input type="number" bind:value={selectedReps} />
		<button on:click|preventDefault={addSet}>Add</button>
	</fieldset>

	<fieldset>
		<div>
			<legend><h2>Sets</h2></legend>
		</div>
		{selectedExercise?.label}
		<ul>
			{#each sets as set}
				<li>
					<input type="hidden" value={set.reps} name="reps" />
					<input type="hidden" value={set.weight} name="weight" />
					<button class="button-remove">
						{set.weight}kg | {set.reps}x
						<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path
								d="M5 5L19.1421 19.1421"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
							<path
								d="M5 19.1422L19.1421 5.00001"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
							/>
						</svg>
					</button>
				</li>
			{/each}
		</ul>
		<button class="button-submit" type="submit">
			Save
		</button>
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
		border-radius: 10px;
		border: 2px solid black;
		padding: 1rem;
		margin: 0;
	}

	legend {
		display: flex;
		padding: 0;
	}

	h2 {
		margin: 0;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	ul {
		list-style: none;
		padding: 0;
	}

	.button-remove {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 1rem;
		border: 1px solid black;
		border-radius: 10px;
		background: transparent;
		height: 2.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
