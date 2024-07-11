<script>
	import Navigation from '../components/Navigation.svelte';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,300..900;1,300..900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<header>
  <Navigation />
</header>
<main>
	<slot />
</main>

<style>
	:global(html) {
    font-family: "Rubik", sans-serif;
		font-size: 10px;
	}

  :global(h1) {
    font-size: 2rem;
  }
</style>
