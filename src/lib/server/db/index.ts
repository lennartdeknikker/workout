import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import { env } from '$env/dynamic/private';
import type { AppDB } from './types';

// Keep Postgres `date` (OID 1082) as a plain 'YYYY-MM-DD' string instead of a JS Date,
// matching our types and avoiding timezone shifts when grouping by workout_date.
pg.types.setTypeParser(1082, (value) => value);

/**
 * Single shared Postgres connection pool.
 * better-auth wraps this same pool with its own Kysely instance (see $lib/server/auth),
 * while the app queries its own tables through the typed `db` below.
 */
export const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

export const db = new Kysely<AppDB>({
	dialect: new PostgresDialect({ pool })
});

export type { AppDB } from './types';
