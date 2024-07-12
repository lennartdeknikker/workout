<script lang="ts">
	import type { Exercise, ExerciseSession, ExerciseSet } from '$interfaces/exercise';

	export let exercises: Exercise[];

	let selectedType: string;
	let selectedExerciseLabel: string;

	let sets: ExerciseSet[] = [];
	let sessions: ExerciseSession[] = [];

	$: filteredExercices = exercises.filter((exercise) => exercise.type === selectedType);
	$: selectedExercise = exercises.find((exercise) => exercise.label === selectedExerciseLabel);

	$: selectedReps = selectedExercise?.reps && selectedExercise.reps.min;
	$: selectedWeight = selectedExercise?.weight && selectedExercise.weight.min;
	$: selectedTime = selectedExercise?.time && selectedExercise.time.min;

	$: addSet = () => {
		if (selectedReps && selectedWeight) {
			sets = [...sets, { reps: selectedReps, weight: selectedWeight }];
		}
	};

	const clearForm = () => {
		sets = [];
		
		selectedExerciseLabel = '';
		selectedReps = selectedExercise?.reps && selectedExercise.reps.min;
		selectedWeight = selectedExercise?.weight && selectedExercise.weight.min;
		selectedTime = selectedExercise?.time && selectedExercise.time.min;
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
			<label for="workout-type"> Workout type </label>
			<select disabled={sets.length > 0} id="workout-type" name="workout-type" bind:value={selectedType} on:change={clearForm}>
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
			<input disabled={sets.length > 0} type="text" list="exercises" bind:value={selectedExerciseLabel} />
			<datalist id="exercises">
				{#each filteredExercices as exercise}
					<option>{exercise.label}</option>
				{/each}
			</datalist>
			<input type="hidden" value={selectedExercise?.id} name="exercise" id="exercise" />
		</div>
	</fieldset>
	{#if selectedExercise && (selectedExercise.type === 'push' || selectedExercise.type === 'pull' || selectedExercise.type === 'legs')}
		<fieldset>
			<div>
				<legend><h2>Set</h2></legend>
			</div>

			<!-- Exercise weight -->
			{#if selectedExercise?.weight}
				<label for="weight">Weight</label>
				<input type="number" min="0" max="200" bind:value={selectedWeight} step="0.25" />
				<input
					type="range"
					step="0.25"
					min={selectedExercise?.weight.min}
					max={selectedExercise?.weight.max}
					bind:value={selectedWeight}
				/>
			{/if}

			<!-- Exercise reps -->
			{#if selectedExercise?.reps}
				<label for="reps">Reps</label>
				<input type="number" bind:value={selectedReps} />
				<input
					type="range"
					min={selectedExercise.reps.min}
					max={selectedExercise.reps.max}
					bind:value={selectedReps}
				/>
			{/if}

			<!-- Exercise time -->
			{#if selectedExercise?.time}
				<label for="reps">Time</label>
				<input type="number" bind:value={selectedTime} />
				<input
					type="range"
					min={selectedExercise.time.min}
					max={selectedExercise.time.max}
					bind:value={selectedTime}
				/>
			{/if}

			<button class="button-add" on:click|preventDefault={addSet}>
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
					><path
						d="M11.5 19V4M19 11.5H4"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
					/></svg
				>
			</button>
		</fieldset>
	{/if}
	{#if selectedExercise  && (selectedExercise.type === 'cardio' )}
		<fieldset>
			<div>
				<legend><h2>Session</h2></legend>
			</div>

			<!-- Exercise time -->
			{#if selectedExercise?.time}
				<label for="reps">Time</label>
				<input type="number" bind:value={selectedTime} />
				<input
					type="range"
					min={selectedExercise.time.min}
					max={selectedExercise.time.max}
					bind:value={selectedTime}
				/>
			{/if}

			<button class="button-submit" type="submit" aria-label="save">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
					><path
						d="M11.293 19.707a1 1 0 0 0 1.414 0l6.364-6.364a1 1 0 0 0-1.414-1.414L12 17.586l-5.657-5.657a1 1 0 0 0-1.414 1.414l6.364 6.364ZM13 4a1 1 0 1 0-2 0h2Zm0 15V4h-2v15h2Z"
						fill="currentColor"
					/></svg
				>
			</button>
		</fieldset>
	{/if}
	{#if sets.length > 0}
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
						<button
							class="button-remove"
							on:click|preventDefault={() => {
								sets = sets.filter((s) => s !== set);
							}}
						>
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
			<button class="button-submit" type="submit" aria-label="save">
				<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
					><path
						d="M11.293 19.707a1 1 0 0 0 1.414 0l6.364-6.364a1 1 0 0 0-1.414-1.414L12 17.586l-5.657-5.657a1 1 0 0 0-1.414 1.414l6.364 6.364ZM13 4a1 1 0 1 0-2 0h2Zm0 15V4h-2v15h2Z"
						fill="currentColor"
					/></svg
				>
			</button>
		</fieldset>
	{/if}
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 2.4rem;
		max-width: 30rem;
	}

	fieldset {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border-radius: 10px;
		border: 1px solid black;
		border-bottom: 2px solid black;
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

	input[type='number'],
	input[type='text'],
	select {
		border-radius: 14px;
		min-height: 2.4rem;
		border: 1px solid black;
		margin: 0;
		padding: 0 0.6rem;
		box-sizing: content-box;
	}

	input[type='range'] {
		margin: 0;
		accent-color: black;
		background-color: white;
	}

	select:disabled,
	input:disabled {
		color: #888888;
		background-color: white;
		opacity: 1;
	}

	.form-item {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	ul {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.button-remove {
		display: flex;
		align-items: center;
		gap: 1rem;
		font-size: 1rem;
		border: 1px solid black;
		border-radius: 14px;
		background: transparent;
		height: 2.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		min-height: 2.4rem;
		box-sizing: content-box;
	}

	.button-add,
	.button-submit {
		border: none;
		display: flex;
		justify-content: center;
		align-items: center;
		align-self: center;
		background-color: transparent;
		padding: 0;
		background-color: black;
		border-radius: 50%;
		font-size: 2rem;
		width: 3.2rem;
		height: 3.2rem;
		color: white;
		transform: translateY(calc(50% + 1rem));
		cursor: pointer;
		margin-top: -2.4rem;
	}

	.button-add {
		background-color: black;
		color: white;
	}

	.button-submit {
		background-color: #00c01a;
		color: white;
	}
</style>
