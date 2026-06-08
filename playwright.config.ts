import { defineConfig } from '@playwright/test';
import { TEST_DB_URL } from './tests/e2e/helpers/db';

const PORT = 4173;
const ORIGIN = `http://localhost:${PORT}`;

export default defineConfig({
	testDir: 'tests/e2e',
	globalSetup: './tests/e2e/global-setup.ts',
	// One worker + a shared test DB that's truncated between tests.
	fullyParallel: false,
	workers: 1,
	use: { baseURL: ORIGIN },
	expect: { timeout: 10_000 },
	webServer: {
		// Production build + preview: no on-demand compilation (stable) and exercises the real CSP.
		command: `npm run build && npm run preview -- --port ${PORT} --strictPort`,
		port: PORT,
		reuseExistingServer: false,
		timeout: 120_000,
		stdout: 'pipe',
		env: {
			DATABASE_URL: TEST_DB_URL,
			BETTER_AUTH_SECRET: 'e2e-secret-000000000000000000000000000000',
			BETTER_AUTH_URL: ORIGIN,
			PUBLIC_APP_URL: ORIGIN,
			// Point the proxy at an unreachable host so a forgotten stub fails fast (never the real CDN).
			EXERCISEDB_BASE_URL: 'http://exercisedb.invalid/api/v1',
			RATE_LIMIT_DISABLED: 'true'
		}
	}
});
