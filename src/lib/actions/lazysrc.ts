import type { Action } from 'svelte/action';

/**
 * Lazily set an <img> src only once it scrolls into view, so off-screen images
 * never hit the (third-party) CDN until they're actually needed.
 *
 * Usage: <img use:lazysrc={url} alt="…" />  (do NOT also set `src`).
 */
export const lazysrc: Action<HTMLImageElement, string> = (node, url) => {
	let current = url;
	let loaded = false;

	const observer = new IntersectionObserver(
		(entries, obs) => {
			if (entries.some((e) => e.isIntersecting)) {
				node.src = current;
				loaded = true;
				obs.disconnect();
			}
		},
		// Start loading just before it enters the viewport for a smooth scroll.
		{ rootMargin: '150px' }
	);
	observer.observe(node);

	return {
		update(next: string) {
			current = next;
			if (loaded) node.src = next;
		},
		destroy() {
			observer.disconnect();
		}
	};
};
