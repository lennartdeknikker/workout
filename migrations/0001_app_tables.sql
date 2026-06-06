-- App-owned tables. Runs AFTER better-auth has created its tables
-- (set_log / exercise reference better-auth's "user" table).

CREATE TYPE measurement_type AS ENUM ('strength', 'cardio', 'bodyweight');
CREATE TYPE routine_type AS ENUM ('push', 'pull', 'legs', 'cardio', 'core');

CREATE TABLE exercise (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
	name text NOT NULL,
	measurement_type measurement_type NOT NULL,
	routine routine_type NOT NULL,

	-- ExerciseDB snapshot (null for custom exercises)
	exercise_db_id text,
	gif_url text,
	target_muscles text[] NOT NULL DEFAULT '{}',
	body_parts text[] NOT NULL DEFAULT '{}',
	equipments text[] NOT NULL DEFAULT '{}',
	secondary_muscles text[] NOT NULL DEFAULT '{}',
	instructions text[] NOT NULL DEFAULT '{}',

	-- Personal target ranges (presence depends on measurement_type)
	sets_min integer,
	sets_max integer,
	weight_min numeric(6, 2),
	weight_max numeric(6, 2),
	reps_min integer,
	reps_max integer,
	rest_min integer,
	rest_max integer,
	duration_min integer,
	duration_max integer,
	distance_min numeric(8, 2),
	distance_max numeric(8, 2),
	resistance_min numeric(6, 2),
	resistance_max numeric(6, 2),

	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX exercise_user_idx ON exercise (user_id);
CREATE INDEX exercise_user_routine_idx ON exercise (user_id, routine);

CREATE TABLE set_log (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	user_id text NOT NULL REFERENCES "user" (id) ON DELETE CASCADE,
	exercise_id uuid REFERENCES exercise (id) ON DELETE SET NULL,
	performed_at timestamptz NOT NULL,
	workout_date date NOT NULL,
	set_index integer NOT NULL,

	-- Measurement values (unused ones null, by measurement_type)
	weight numeric(6, 2),
	reps integer,
	duration_seconds integer,
	distance numeric(8, 2),
	resistance numeric(6, 2),

	-- Denormalised snapshot for immutable history
	exercise_name text NOT NULL,
	routine routine_type NOT NULL,
	measurement_type measurement_type NOT NULL,

	created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX set_log_user_date_idx ON set_log (user_id, workout_date);
CREATE INDEX set_log_user_exercise_idx ON set_log (user_id, exercise_id);
CREATE INDEX set_log_user_performed_idx ON set_log (user_id, performed_at);
