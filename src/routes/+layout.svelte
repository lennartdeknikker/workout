<script>
	import Navigation from '../components/Navigation.svelte';
	import TimerBar from '$components/TimerBar.svelte';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
<div class="Layout">
	<header>
		<Navigation />
	</header>
	<TimerBar />
	<slot />
</div>

<style>
	:global(html) {
    position: relative;
		font-family: 'Rubik', sans-serif;
		font-size: 10px;
		overflow-x: hidden;
	}

	:global(body) {
		margin: 0 auto;
		overflow-x: hidden;
		width: 100vw;
    position: relative;
	}

	:global(h1) {
		font-size: clamp(2.4rem, 5vw, 3.6rem);
	}
	:global(svg) {
		width: 1em;
	}

	.Layout {
		max-width: 100rem;
		width: fit-content;
		padding: 2.4rem;
		box-sizing: border-box;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}
</style>
