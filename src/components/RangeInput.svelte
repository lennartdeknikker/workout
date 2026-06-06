<script lang="ts">
	interface Props {
		value: number | undefined;
		label: string;
		name?: string;
		min?: number;
		max?: number;
		step?: number;
	}

	let { value = $bindable(), label, name, min, max, step = 1 }: Props = $props();
</script>

<div class="range-input">
	<label>
		<span>{label}</span>
		<input type="number" {name} bind:value {min} {max} {step} />
	</label>
	<input type="range" bind:value {min} {max} {step} aria-label={label} />
</div>

<style>
	.range-input {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}
	input[type='range'] {
		accent-color: black;
	}
</style>
