import { building, dev } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { auth } from '$lib/server/auth';
import { rateLimit } from '$lib/server/rateLimit';

/** Routes reachable without a session. Everything else requires login. */
const PUBLIC_PATHS = ['/login', '/signup'];

function isPublic(pathname: string): boolean {
	return PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));
}

/** Adds baseline security headers to every response. */
const securityHeaders: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set(
		'Permissions-Policy',
		'geolocation=(), camera=(), microphone=(), browsing-topics=()'
	);
	// Only meaningful (and safe) over HTTPS in production behind the reverse proxy / tunnel.
	if (!dev) {
		response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
	}
	return response;
};

/** Per-IP rate limiting for the sensitive endpoints (auth + the ExerciseDB proxy). */
const rateLimiter: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	const isAuth = pathname.startsWith('/api/auth');
	const isSearch = pathname.startsWith('/api/exercise-search');

	if (isAuth || isSearch) {
		const ip = event.getClientAddress();
		const bucket = isAuth ? 'auth' : 'search';
		const limit = isAuth ? 30 : 60; // requests per minute, per IP
		if (!rateLimit(`${bucket}:${ip}`, limit, 60_000)) {
			return new Response('Too many requests', {
				status: 429,
				headers: { 'retry-after': '60' }
			});
		}
	}
	return resolve(event);
};

/** Session resolution, route guard, and the better-auth request handler. */
const authHandle: Handle = async ({ event, resolve }) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	event.locals.user = session?.user ?? null;
	event.locals.session = session?.session ?? null;

	const { pathname } = event.url;
	// API routes enforce auth themselves (returning 401) rather than redirecting.
	const isApi = pathname.startsWith('/api');

	if (!isApi && !isPublic(pathname) && !event.locals.user) {
		const target = pathname + event.url.search;
		redirect(303, `/login?redirect=${encodeURIComponent(target)}`);
	}

	// Lets better-auth serve its /api/auth/* endpoints; otherwise resolves normally.
	return svelteKitHandler({ event, resolve, auth, building });
};

export const handle = sequence(securityHeaders, rateLimiter, authHandle);
