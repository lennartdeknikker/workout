/**
 * CLI-only better-auth config.
 *
 * The real instance lives in `src/lib/server/auth.ts`, but the better-auth CLI
 * cannot load that file because of its SvelteKit-only imports ($app/server, $env, $lib).
 * This config mirrors the same database + auth method so that
 * `npx @better-auth/cli migrate` / `generate` can create/update the auth tables.
 *
 * Keep the `database` and `emailAndPassword` settings in sync with src/lib/server/auth.ts.
 */
import { betterAuth } from 'better-auth';
import pg from 'pg';

export const auth = betterAuth({
	database: new pg.Pool({ connectionString: process.env.DATABASE_URL }),
	emailAndPassword: {
		enabled: true
	}
});
