<script lang="ts">
	import { session } from '$lib/session';
</script>

<nav>
	<a href="/profile">
		<figure class="profile-picture">
			<img src={$session?.user?.photoURL} alt="Profile" />
		</figure>
	</a>
	<h1>Trainmate</h1>
	<a href="/">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" xml:space="preserve"
			><path
				d="M27 9h-1c0-1.65-1.35-3-3-3h-1c-1.65 0-3 1.35-3 3v4h-6V9c0-1.65-1.35-3-3-3H9C7.35 6 6 7.35 6 9H5c-1.65 0-3 1.35-3 3v8c0 1.65 1.35 3 3 3h1c0 1.65 1.35 3 3 3h1c1.65 0 3-1.35 3-3v-4h6v4c0 1.65 1.35 3 3 3h1c1.65 0 3-1.35 3-3h1c1.65 0 3-1.35 3-3v-8c0-1.65-1.35-3-3-3zM5 21c-.55 0-1-.45-1-1v-8c0-.55.45-1 1-1h1v10H5zm6 2c0 .55-.45 1-1 1H9c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h1c.55 0 1 .45 1 1v14zm2-6v-2h6v2h-6zm11 6c0 .55-.45 1-1 1h-1c-.55 0-1-.45-1-1V9c0-.55.45-1 1-1h1c.55 0 1 .45 1 1v14zm4-3c0 .55-.45 1-1 1h-1V11h1c.55 0 1 .45 1 1v8z"
			/></svg
		>
	</a>
</nav>

<style>
	nav {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.2rem;
	}

	h1 {
		margin: 0;
	}

	a {
		height: 3rem;
		font-size: 3rem;
	}

	.profile-picture {
		border-radius: 50%;
		overflow: hidden;
		width: 3rem;
		height: 3rem;
		margin: 0;

		img {
			width: 100%;
			height: 100%;
		}
	}
</style>
