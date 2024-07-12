<script lang="ts">
	import { onDestroy } from 'svelte';
	import { writable, type Writable } from 'svelte/store';

	let secondsLeft = 0;
	let totalSeconds = 0;
	let interval: number;

	export let percentageDone: Writable<number>;
	export let toggleSidebar: () => void;

	const timer = writable({ secondsLeft, totalSeconds });

	const startCountDownTimer = (timeInSeconds: number, callBack: () => void) => {
		clearInterval(interval);

		totalSeconds = timeInSeconds;
		secondsLeft = timeInSeconds;

		interval = setInterval(() => {
			secondsLeft--;

			timer.set({ secondsLeft, totalSeconds });

			if (secondsLeft <= 0) {
				clearInterval(interval);
				callBack();
			}
		}, 1000);
		toggleSidebar();
	};

	onDestroy(() => {
		clearInterval(interval);
	});

	$: percentageDone.set(100 - Math.round((secondsLeft / totalSeconds) * 100) || 0);
</script>

<div class="timer">
	{#each [1, 2, 3] as timerOption}
		<button
			class:is-active={$timer.secondsLeft && totalSeconds === timerOption * 60}
			on:click={() => startCountDownTimer(timerOption * 60, () => console.log('ended'))}
			>{timerOption}</button
		>
	{/each}
</div>

<style>
	.timer {
		display: flex;
		align-items: center;
		gap: 1rem;
	}
	button {
		font-size: 1rem;
		height: 1.8rem;
		width: 1.8rem;
		border: 1px solid white;
		border-radius: 50%;
		background-color: transparent;
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}

	button.is-active {
		background-color: white;
		color: black;
	}
</style>
