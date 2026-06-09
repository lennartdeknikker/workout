<script lang="ts">
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import ExerciseSearch from './ExerciseSearch.svelte';
	import { MEASUREMENT_TYPES, ROUTINES } from '$lib/schemas/exercise';
	import type { ExerciseDbSnapshot } from '$lib/domain/exercisedb';
	import type { Exercise } from '$lib/server/repositories/exercises';

	interface Props {
		initial?: Exercise | null;
		submitLabel?: string;
		/** Form action target, e.g. '?/update'. Empty = the page's default action. */
		action?: string;
	}

	let { initial = null, submitLabel = 'Save', action = '' }: Props = $props();

	// The form is mounted fresh per exercise, so seed state once from a non-reactive snapshot.
	const seed = untrack(() => initial);

	const num = (v: number | string | null | undefined): number | undefined =>
		v == null ? undefined : Number(v);

	let name = $state(seed?.name ?? '');
	let measurementType = $state<(typeof MEASUREMENT_TYPES)[number]>(
		seed?.measurement_type ?? 'strength'
	);
	let routine = $state<(typeof ROUTINES)[number]>(seed?.routine ?? 'push');
	let formError = $state<string | null>(null);

	let snapshot = $state<ExerciseDbSnapshot | null>(
		seed?.exercise_db_id
			? {
					exerciseId: seed.exercise_db_id,
					name: seed.name,
					gifUrl: seed.gif_url ?? '',
					targetMuscles: seed.target_muscles,
					bodyParts: seed.body_parts,
					equipments: seed.equipments,
					secondaryMuscles: seed.secondary_muscles,
					instructions: seed.instructions
				}
			: null
	);

	let ranges = $state<Record<string, number | undefined>>({
		setsMin: num(seed?.sets_min),
		setsMax: num(seed?.sets_max),
		weightMin: num(seed?.weight_min),
		weightMax: num(seed?.weight_max),
		repsMin: num(seed?.reps_min),
		repsMax: num(seed?.reps_max),
		restMin: num(seed?.rest_min),
		restMax: num(seed?.rest_max),
		durationMin: num(seed?.duration_min),
		durationMax: num(seed?.duration_max),
		distanceMin: num(seed?.distance_min),
		distanceMax: num(seed?.distance_max),
		resistanceMin: num(seed?.resistance_min),
		resistanceMax: num(seed?.resistance_max)
	});

	function onselect(s: ExerciseDbSnapshot) {
		snapshot = s;
		if (!name.trim()) name = s.name;
	}
</script>

{#snippet rangeField(label: string, field: string, step: number)}
	<fieldset class="range">
		<legend>{label}</legend>
		<label
			>min
			<input
				type="number"
				name={`${field}Min`}
				bind:value={ranges[`${field}Min`]}
				min="0"
				{step}
			/></label
		>
		<label
			>max
			<input
				type="number"
				name={`${field}Max`}
				bind:value={ranges[`${field}Max`]}
				min="0"
				{step}
			/></label
		>
	</fieldset>
{/snippet}

<form
	method="POST"
	{action}
	use:enhance={() => {
		formError = null;
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				// result.location is the redirect target from our own server action.
				// eslint-disable-next-line svelte/no-navigation-without-resolve
				await goto(result.location);
			} else if (result.type === 'failure') {
				formError = (result.data?.message as string) ?? 'Please check the form and try again.';
			} else {
				await update();
			}
		};
	}}
>
	<section>
		<ExerciseSearch {onselect} />
		{#if snapshot}
			<p class="picked">
				Linked to <strong>{snapshot.name}</strong> · {snapshot.targetMuscles.join(', ')}
			</p>
			<input type="hidden" name="snapshot" value={JSON.stringify(snapshot)} />
		{/if}
	</section>

	<section>
		<label>
			Name
			<input type="text" name="name" bind:value={name} maxlength="120" required />
		</label>

		<label>
			Measurement type
			<select name="measurementType" bind:value={measurementType}>
				{#each MEASUREMENT_TYPES as t (t)}<option value={t}>{t}</option>{/each}
			</select>
		</label>

		<label>
			Routine
			<select name="routine" bind:value={routine}>
				{#each ROUTINES as r (r)}<option value={r}>{r}</option>{/each}
			</select>
		</label>
	</section>

	<section class="ranges">
		{#if measurementType === 'strength'}
			{@render rangeField('Sets', 'sets', 1)}
			{@render rangeField('Weight (kg)', 'weight', 0.25)}
			{@render rangeField('Reps', 'reps', 1)}
			{@render rangeField('Rest (sec)', 'rest', 5)}
		{:else if measurementType === 'bodyweight'}
			{@render rangeField('Sets', 'sets', 1)}
			{@render rangeField('Reps', 'reps', 1)}
			{@render rangeField('Added weight (kg, optional)', 'weight', 0.25)}
			{@render rangeField('Rest (sec)', 'rest', 5)}
		{:else}
			{@render rangeField('Duration (sec)', 'duration', 5)}
			{@render rangeField('Distance (km, optional)', 'distance', 0.1)}
			{@render rangeField('Resistance (optional)', 'resistance', 1)}
			{@render rangeField('Rest (sec, optional)', 'rest', 5)}
		{/if}
	</section>

	{#if formError}<p class="error">{formError}</p>{/if}
	<button type="submit">{submitLabel}</button>
</form>

<style>
	form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		max-width: 32rem;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	.ranges {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem;
	}
	.range {
		display: flex;
		gap: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		margin: 0;
	}
	.range legend {
		font-size: 0.85rem;
		font-weight: 600;
	}
	.range label {
		flex: 1;
		font-size: 0.85rem;
	}
	.picked {
		margin: 0;
		font-size: 0.9rem;
		text-transform: capitalize;
	}
	.error {
		color: #c00;
		margin: 0;
	}
</style>
