import pg from 'pg';

export const TEST_DB = 'trainmate_test';
export const ADMIN_DB_URL = 'postgres://trainmate:trainmate@localhost:5544/trainmate';
export const TEST_DB_URL = `postgres://trainmate:trainmate@localhost:5544/${TEST_DB}`;

async function withClient<T>(fn: (c: pg.Client) => Promise<T>): Promise<T> {
	const client = new pg.Client({ connectionString: TEST_DB_URL });
	await client.connect();
	try {
		return await fn(client);
	} finally {
		await client.end();
	}
}

/** Truncate all app + auth tables. Call in beforeEach. */
export function resetDb(): Promise<unknown> {
	return withClient((c) =>
		c.query('TRUNCATE set_log, exercise, session, account, verification, "user" CASCADE')
	);
}

export async function getUserId(email: string): Promise<string> {
	return withClient(async (c) => {
		const r = await c.query<{ id: string }>('SELECT id FROM "user" WHERE email = $1', [email]);
		if (!r.rows[0]) throw new Error(`no user ${email}`);
		return r.rows[0].id;
	});
}

export async function countSetLog(userId: string): Promise<number> {
	return withClient(async (c) => {
		const r = await c.query<{ n: string }>('SELECT count(*) n FROM set_log WHERE user_id = $1', [
			userId
		]);
		return Number(r.rows[0].n);
	});
}

export interface SeedExercise {
	name: string;
	routine: string;
	measurementType: string;
	weightMin?: number;
	weightMax?: number;
	repsMin?: number;
	repsMax?: number;
	durationMin?: number;
	durationMax?: number;
}

/** Insert an exercise for a user; returns its id. */
export async function seedExercise(userId: string, ex: SeedExercise): Promise<string> {
	return withClient(async (c) => {
		const r = await c.query<{ id: string }>(
			`INSERT INTO exercise
				(user_id, name, measurement_type, routine, weight_min, weight_max, reps_min, reps_max, duration_min, duration_max)
			 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id`,
			[
				userId,
				ex.name,
				ex.measurementType,
				ex.routine,
				ex.weightMin ?? null,
				ex.weightMax ?? null,
				ex.repsMin ?? null,
				ex.repsMax ?? null,
				ex.durationMin ?? null,
				ex.durationMax ?? null
			]
		);
		return r.rows[0].id;
	});
}

export interface SeedSet {
	weight?: number;
	reps?: number;
	durationSeconds?: number;
	distance?: number;
}

export interface SeedDay {
	workoutDate: string;
	exerciseId?: string | null;
	exerciseName: string;
	routine: string;
	measurementType: string;
	sets: SeedSet[];
}

/** Insert a day's logged sets for a user (set_index 0..n-1). */
export async function seedSetLog(userId: string, day: SeedDay): Promise<void> {
	await withClient(async (c) => {
		for (let i = 0; i < day.sets.length; i++) {
			const s = day.sets[i];
			await c.query(
				`INSERT INTO set_log
					(user_id, exercise_id, performed_at, workout_date, set_index, weight, reps, duration_seconds, distance, exercise_name, routine, measurement_type)
				 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
				[
					userId,
					day.exerciseId ?? null,
					`${day.workoutDate}T10:0${i}:00Z`,
					day.workoutDate,
					i,
					s.weight ?? null,
					s.reps ?? null,
					s.durationSeconds ?? null,
					s.distance ?? null,
					day.exerciseName,
					day.routine,
					day.measurementType
				]
			);
		}
	});
}
