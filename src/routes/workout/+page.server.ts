import type { PageServerLoad } from './$types';

/**
 * Placeholder for the "today" workout overview (see Context/build/01-product-spec.md §5.4).
 * The route guard in hooks.server.ts guarantees a logged-in user here.
 */
export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user };
};
