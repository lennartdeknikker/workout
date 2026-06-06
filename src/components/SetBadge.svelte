<script lang="ts">
	interface Props {
		label: string;
		onremove?: () => void;
	}
	let { label, onremove }: Props = $props();
</script>

<span class="badge">
	{label}
	{#if onremove}
		<button type="button" aria-label="Remove set" onclick={onremove}>✕</button>
	{/if}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		border: 1px solid #000;
		border-radius: 14px;
		padding: 0.25rem 0.6rem;
		font-size: 0.95rem;
	}
	button {
		border: none;
		background: transparent;
		cursor: pointer;
		font-size: 0.85rem;
		line-height: 1;
		padding: 0;
	}
</style>
