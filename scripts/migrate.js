/**
 * Minimal forward-only SQL migration runner for the app-owned tables.
 *
 * Applies every `migrations/*.sql` file (sorted by name) that hasn't been applied yet,
 * each in its own transaction, tracked in the `_app_migrations` table.
 *
 * Run with env loaded, e.g.:  node --env-file=.env scripts/migrate.js
 * (In Docker the env vars are already present in the environment.)
 *
 * NOTE: this runs AFTER `better-auth migrate` — app tables reference the auth `user` table.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

async function main() {
	const connectionString = process.env.DATABASE_URL;
	if (!connectionString) throw new Error('DATABASE_URL is not set');

	const client = new pg.Client({ connectionString });
	await client.connect();

	try {
		await client.query(`
			CREATE TABLE IF NOT EXISTS _app_migrations (
				name text PRIMARY KEY,
				applied_at timestamptz NOT NULL DEFAULT now()
			)
		`);

		const applied = new Set(
			(await client.query('SELECT name FROM _app_migrations')).rows.map((r) => r.name)
		);

		const files = readdirSync(migrationsDir)
			.filter((f) => f.endsWith('.sql'))
			.sort();

		let count = 0;
		for (const file of files) {
			if (applied.has(file)) continue;
			const sql = readFileSync(join(migrationsDir, file), 'utf8');
			console.log(`applying ${file}…`);
			await client.query('BEGIN');
			try {
				await client.query(sql);
				await client.query('INSERT INTO _app_migrations (name) VALUES ($1)', [file]);
				await client.query('COMMIT');
				count++;
			} catch (err) {
				await client.query('ROLLBACK');
				throw err;
			}
		}

		console.log(count === 0 ? 'no pending migrations' : `applied ${count} migration(s)`);
	} finally {
		await client.end();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
