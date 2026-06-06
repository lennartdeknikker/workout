import type { ColumnType, Generated } from 'kysely';

/** Measurement type drives which fields a logged set carries (see Context/build/03-data-model.md). */
export type MeasurementType = 'strength' | 'cardio' | 'bodyweight';

/** Organisational tag for an exercise / logged set. */
export type Routine = 'push' | 'pull' | 'legs' | 'cardio' | 'core';

/** Postgres `numeric` is returned as a string by the driver to preserve precision. */
type Numeric = ColumnType<string, string | number, string | number>;
type Timestamptz = ColumnType<Date, Date | string | undefined, Date | string>;
/** Postgres `date`, handled as an ISO `YYYY-MM-DD` string. */
type DateString = ColumnType<string, string, string>;

export interface ExerciseTable {
	id: Generated<string>;
	user_id: string;
	name: string;
	measurement_type: MeasurementType;
	routine: Routine;

	// ExerciseDB snapshot (null for custom exercises).
	exercise_db_id: string | null;
	gif_url: string | null;
	target_muscles: string[];
	body_parts: string[];
	equipments: string[];
	secondary_muscles: string[];
	instructions: string[];

	// Personal target ranges (presence depends on measurement_type).
	sets_min: number | null;
	sets_max: number | null;
	weight_min: Numeric | null;
	weight_max: Numeric | null;
	reps_min: number | null;
	reps_max: number | null;
	rest_min: number | null;
	rest_max: number | null;
	duration_min: number | null;
	duration_max: number | null;
	distance_min: Numeric | null;
	distance_max: Numeric | null;
	resistance_min: Numeric | null;
	resistance_max: Numeric | null;

	created_at: Generated<Timestamptz>;
	updated_at: Generated<Timestamptz>;
}

export interface SetLogTable {
	id: Generated<string>;
	user_id: string;
	exercise_id: string | null;
	performed_at: Timestamptz;
	workout_date: DateString;
	set_index: number;

	// Measurement values (unused ones are null, by measurement_type).
	weight: Numeric | null;
	reps: number | null;
	duration_seconds: number | null;
	distance: Numeric | null;
	resistance: Numeric | null;

	// Denormalised snapshot for immutable history.
	exercise_name: string;
	routine: Routine;
	measurement_type: MeasurementType;

	created_at: Generated<Timestamptz>;
}

/** App-owned tables. better-auth manages its own (`user`, `session`, `account`, `verification`). */
export interface AppDB {
	exercise: ExerciseTable;
	set_log: SetLogTable;
}
