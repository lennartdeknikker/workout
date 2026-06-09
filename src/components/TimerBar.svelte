<script lang="ts">
	import Timer from './Timer.svelte';

	let percentageDone = $state(0);
	let open = $state(false);

	const toggleSidebar = () => {
		open = !open;
	};

	const openSidebar = () => {
		if (open) {
			percentageDone = 0;
		}
		open = !open;
	};
</script>

<aside
	class:is-open={open}
	style={`--percentage-done: ${percentageDone}%; --degrees-done: ${Math.floor((percentageDone / 100) * 360)}deg`}
>
	<div>
		<Timer bind:percentageDone {toggleSidebar} />
		<button onclick={openSidebar}>
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<circle cx="12" cy="12" r="8.5" stroke="currentColor" />
				<path d="M12 7V12" stroke="currentColor" stroke-linecap="round" />
				<path class="arrow" d="M12 7V12" stroke="currentColor" stroke-linecap="round" />
			</svg>
		</button>
	</div>
</aside>

<style>
	aside {
		--percentage-done: 0;
		--degrees-done: 0deg;
		--background-color: hsl(
			350,
			calc(var(--percentage-done, 0) / 2),
			calc(var(--percentage-done, 0) / 2)
		);
		position: absolute;
		right: calc(100vw - 100svw);
		top: 0;
		z-index: 10;
		height: 100vh;
		display: flex;
		align-items: center;
	}

	div {
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: pink;
		background-color: var(--background-color);
		transform: translateX(100%);
		transition: transform 0.2s ease-in-out;
		padding: 0 2.4rem;
		min-height: 3.2rem;
		height: fit-content;
	}

	aside.is-open div {
		transform: translateX(0);
	}

	button {
		position: absolute;
		left: 1px;
		transform: translateX(-100%);
		border: none;
		background-color: var(--background-color);
		height: 3.2rem;
		border-radius: 50% 0 0 50%;
		color: white;
		width: 3.2rem;
		cursor: pointer;
		padding: 0;
		font-size: 2.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}

	button .arrow {
		transform: rotate(var(--degrees-done));
		transform-origin: center center;
	}
</style>
