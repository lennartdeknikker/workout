import { execSync } from 'node:child_process';
import pg from 'pg';
import { ADMIN_DB_URL, TEST_DB, TEST_DB_URL } from './helpers/db';

/** Create the isolated test database (if needed) and run migrations against it. */
export default async function globalSetup() {
	const admin = new pg.Client({ connectionString: ADMIN_DB_URL });
	await admin.connect();
	const exists = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [TEST_DB]);
	if (exists.rowCount === 0) await admin.query(`CREATE DATABASE ${TEST_DB}`);
	await admin.end();

	execSync('node scripts/migrate.js', {
		env: { ...process.env, DATABASE_URL: TEST_DB_URL },
		stdio: 'inherit'
	});
}
