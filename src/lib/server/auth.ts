import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { env } from '$env/dynamic/private';
import { pool } from './db';

/**
 * better-auth instance. It manages its own tables (`user`, `session`, `account`,
 * `verification`) on the shared Postgres pool via its built-in Kysely adapter.
 * Auth method: email + password (multi-user). See Context/build/02-architecture.md.
 *
 * Schema is created/updated with the better-auth CLI against `better-auth.config.ts`
 * (the CLI cannot load this file because of the SvelteKit-only imports above).
 */
export const auth = betterAuth({
	database: pool,
	secret: env.BETTER_AUTH_SECRET,
	baseURL: env.BETTER_AUTH_URL,
	emailAndPassword: {
		enabled: true
	},
	plugins: [sveltekitCookies(getRequestEvent)]
});

export type Auth = typeof auth;
