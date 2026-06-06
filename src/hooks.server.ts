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
	const isAuthApi = pathname.startsWith('/api/auth');

	// Guard: unauthenticated users may only reach the better-auth API and public pages.
	if (!isAuthApi && !isPublic(pathname) && !event.locals.user) {
		const target = pathname + event.url.search;
		redirect(303, `/login?redirect=${encodeURIComponent(target)}`);
	}

	// Lets better-auth serve its /api/auth/* endpoints; otherwise resolves normally.
	return svelteKitHandler({ event, resolve, auth, building });
};
