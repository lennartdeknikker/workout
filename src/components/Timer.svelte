<script lang="ts">
	let {
		percentageDone = $bindable(0),
		toggleSidebar
	}: {
		percentageDone?: number;
		toggleSidebar: () => void;
	} = $props();

	let secondsLeft = $state(0);
	let totalSeconds = $state(0);
	let interval: ReturnType<typeof setInterval> | undefined;

	const startCountDownTimer = (timeInSeconds: number, callBack: () => void) => {
		clearInterval(interval);

		totalSeconds = timeInSeconds;
		secondsLeft = timeInSeconds;

		interval = setInterval(() => {
			secondsLeft--;

			if (secondsLeft <= 0) {
				clearInterval(interval);
				callBack();
			}
		}, 1000);
		toggleSidebar();
	};

	$effect(() => {
		percentageDone = 100 - Math.round((secondsLeft / totalSeconds) * 100) || 0;
	});

	$effect(() => () => clearInterval(interval));
</script>

<div class="timer">
	{#each [30, 60, 120, 180] as timerOption}
		<button
			class:is-active={secondsLeft && totalSeconds === timerOption}
			class:smaller={timerOption < 60}
			onclick={() => startCountDownTimer(timerOption, () => console.log('ended'))}
			>
			{timerOption < 60 ? `${timerOption}s` : `${timerOption / 60}`}
			</button
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

	button.smaller {
		font-size: .8rem;
	}
</style>
