import { redirect } from '@sveltejs/kit';

/** Root redirects to the workout view (the guard sends unauthenticated users to /login). */
export function load() {
	redirect(307, '/workout');
}
