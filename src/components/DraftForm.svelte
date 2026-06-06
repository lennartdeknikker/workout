<script lang="ts">
	import RangeInput from './RangeInput.svelte';
	import SetBadge from './SetBadge.svelte';
	import { formatSetBadge, type DraftSet } from '$lib/domain/workoutSets';
	import { ROUTINES } from '$lib/schemas/exercise';
	import { workoutDrafts, type Routine } from '$lib/stores/workoutDrafts.svelte';
	import type { Exercise } from '$lib/server/repositories/exercises';

	interface Props {
		exercises: Exercise[];
		/** Called once every open draft has been posted. */
		onfinished: () => void;
	}
	let { exercises, onfinished }: Props = $props();

	const num = (v: number | string | null): number | undefined =>
		v == null ? undefined : Number(v);

	const draft = $derived(workoutDrafts.active);
	const exercise = $derived(exercises.find((e) => e.id === draft?.exerciseId) ?? null);

	// Step 1 selection
	let selectedRoutine = $state<Routine>('push');
	const routineExercises = $derived(exercises.filter((e) => e.routine === selectedRoutine));

	// Step 2 current-set inputs
	let weight = $state<number | undefined>(undefined);
	let reps = $state<number | undefined>(undefined);
	let duration = $state<number | undefined>(undefined);
	let distance = $state<number | undefined>(undefined);
	let resistance = $state<number | undefined>(undefined);
	let postError = $state<string | null>(null);
	let posting = $state(false);

	// Seed the inputs from the exercise's range mins whenever the active exercise changes.
	$effect(() => {
		if (!exercise) return;
		weight = num(exercise.weight_min) ?? 0;
		reps = num(exercise.reps_min) ?? 8;
		duration = num(exercise.duration_min) ?? 300;
		distance = num(exercise.distance_min);
		resistance = num(exercise.resistance_min);
	});

	function pick(e: Exercise) {
		if (!draft) return;
		workoutDrafts.selectExercise(draft.id, {
			exerciseId: e.id,
			name: e.name,
			routine: e.routine,
			measurementType: e.measurement_type
		});
	}

	function commit() {
		if (!draft || !exercise) return;
		const mt = exercise.measurement_type;
		let set: DraftSet | null = null;
		if (mt === 'strength' && weight != null && reps != null) {
			set = { weight, reps };
		} else if (mt === 'bodyweight' && reps != null) {
			set = weight != null ? { reps, weight } : { reps };
		} else if (mt === 'cardio' && duration != null) {
			set = {
				durationSeconds: duration,
				...(distance != null ? { distance } : {}),
				...(resistance != null ? { resistance } : {})
			};
		}
		if (set) workoutDrafts.commitSet(draft.id, set);
	}

	async function post() {
		if (!draft || !exercise || posting) return;
		postError = null;
		posting = true;
		try {
			const res = await fetch('/api/workout', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					draftId: draft.id,
					exerciseId: draft.exerciseId,
					timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					sets: $state.snapshot(draft.sets)
				})
			});
			if (!res.ok) throw new Error('post failed');
			workoutDrafts.markPosted(draft.id);
			if (workoutDrafts.allPosted) {
				workoutDrafts.reset();
				onfinished();
			} else {
				const next = workoutDrafts.drafts.find((d) => !d.posted);
				if (next) workoutDrafts.setActive(next.id);
			}
		} catch {
			postError = 'Could not save. Check your connection and try again.';
		} finally {
			posting = false;
		}
	}
</script>

{#if draft}
	{#if draft.posted}
		<p class="done">✓ Posted — {draft.exerciseName}</p>
	{:else if draft.step === 1}
		<section>
			<label>
				Routine
				<select bind:value={selectedRoutine}>
					{#each ROUTINES as r (r)}<option value={r}>{r}</option>{/each}
				</select>
			</label>

			{#if routineExercises.length === 0}
				<p class="hint">No {selectedRoutine} exercises yet. Add some under Exercises.</p>
			{:else}
				<ul class="pick">
					{#each routineExercises as e (e.id)}
						<li><button type="button" onclick={() => pick(e)}>{e.name}</button></li>
					{/each}
				</ul>
			{/if}
		</section>
	{:else if draft.step === 2 && exercise}
		<section>
			<header>
				<strong class="cap">{draft.routine}</strong> · <span class="cap">{draft.exerciseName}</span>
			</header>

			{#if exercise.measurement_type === 'strength'}
				<RangeInput
					label="Weight (kg)"
					bind:value={weight}
					min={num(exercise.weight_min) ?? 0}
					max={num(exercise.weight_max) ?? 200}
					step={0.25}
				/>
				<RangeInput
					label="Reps"
					bind:value={reps}
					min={num(exercise.reps_min) ?? 0}
					max={num(exercise.reps_max) ?? 30}
				/>
			{:else if exercise.measurement_type === 'bodyweight'}
				<RangeInput
					label="Reps"
					bind:value={reps}
					min={num(exercise.reps_min) ?? 0}
					max={num(exercise.reps_max) ?? 50}
				/>
				<label
					>Added weight (kg, optional) <input
						type="number"
						min="0"
						step="0.25"
						bind:value={weight}
					/></label
				>
			{:else}
				<RangeInput
					label="Duration (sec)"
					bind:value={duration}
					min={num(exercise.duration_min) ?? 0}
					max={num(exercise.duration_max) ?? 3600}
					step={5}
				/>
				<label
					>Distance (km, optional) <input
						type="number"
						min="0"
						step="0.1"
						bind:value={distance}
					/></label
				>
				<label
					>Resistance (optional) <input
						type="number"
						min="0"
						step="1"
						bind:value={resistance}
					/></label
				>
			{/if}

			<button type="button" class="commit" onclick={commit} aria-label="Commit set">+</button>

			{#if draft.sets.length > 0}
				<div class="sets">
					{#each draft.sets as set, i (i)}
						<SetBadge
							label={formatSetBadge(set, exercise.measurement_type)}
							onremove={() => workoutDrafts.removeSet(draft.id, i)}
						/>
					{/each}
				</div>
			{/if}

			<nav>
				<button type="button" onclick={() => workoutDrafts.setStep(draft.id, 1)}>Back</button>
				<button
					type="button"
					disabled={draft.sets.length === 0}
					onclick={() => workoutDrafts.setStep(draft.id, 3)}>Next</button
				>
			</nav>
		</section>
	{:else if draft.step === 3 && exercise}
		<section>
			<header>Summary · <span class="cap">{draft.exerciseName}</span></header>
			<div class="sets">
				{#each draft.sets as set, i (i)}
					<SetBadge label={formatSetBadge(set, exercise.measurement_type)} />
				{/each}
			</div>
			{#if postError}<p class="error">{postError}</p>{/if}
			<nav>
				<button type="button" onclick={() => workoutDrafts.setStep(draft.id, 2)}>Back</button>
				<button type="button" class="post" disabled={posting} onclick={post}>
					{posting ? 'Posting…' : 'Post'}
				</button>
			</nav>
		</section>
	{/if}
{/if}

<style>
	section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		border: 1px solid #000;
		border-top: none;
		border-radius: 0 0 10px 10px;
		padding: 1rem;
	}
	header {
		font-size: 1.1rem;
	}
	.cap {
		text-transform: capitalize;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.pick {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.pick button {
		width: 100%;
		text-align: left;
		padding: 0.5rem 0.7rem;
		border: 1px solid #000;
		border-radius: 10px;
		background: #fff;
		cursor: pointer;
		text-transform: capitalize;
	}
	.sets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.commit {
		align-self: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		border: none;
		background: #000;
		color: #fff;
		font-size: 1.5rem;
		cursor: pointer;
	}
	nav {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	nav button {
		padding: 0.5rem 1rem;
		border-radius: 10px;
		border: 1px solid #000;
		background: #fff;
		cursor: pointer;
	}
	.post {
		background: #00c01a !important;
		color: #fff;
		border-color: #00c01a !important;
	}
	.error {
		color: #c00;
		margin: 0;
	}
	.hint {
		color: #555;
	}
	.done {
		color: #00c01a;
		font-weight: 600;
	}
</style>
