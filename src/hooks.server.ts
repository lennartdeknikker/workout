import { building } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';

/** Routes reachable without a session. Everything else requires login. */
const PUBLIC_PATHS = ['/login', '/signup'];

function isPublic(pathname: string): boolean {
	return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

export const handle: Handle = async ({ event, resolve }) => {
	// Resolve the session once per request and expose it to load functions / actions.
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;

	const { pathname } = event.url;
	// API routes enforce auth themselves (returning 401) rather than redirecting.
	const isApi = pathname.startsWith('/api');

	// Guard: unauthenticated users may only reach API routes and public pages.
	if (!isApi && !isPublic(pathname) && !event.locals.user) {
		const target = pathname + event.url.search;
		redirect(303, `/login?redirect=${encodeURIComponent(target)}`);
	}

	// Lets better-auth serve its /api/auth/* endpoints; otherwise resolves normally.
	return svelteKitHandler({ event, resolve, auth, building });
};
