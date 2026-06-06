import { z } from 'zod';
import { validateRange } from '$lib/domain/ranges';

export const MEASUREMENT_TYPES = ['strength', 'cardio', 'bodyweight'] as const;
export const ROUTINES = ['push', 'pull', 'legs', 'cardio', 'core'] as const;

const emptyToUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);
const optInt = z.preprocess(emptyToUndefined, z.coerce.number().int().nonnegative().optional());
const optNum = z.preprocess(emptyToUndefined, z.coerce.number().nonnegative().optional());

/** Range field pairs validated for min ≤ max. */
const RANGE_FIELDS = [
	'sets',
	'weight',
	'reps',
	'rest',
	'duration',
	'distance',
	'resistance'
] as const;

/** Scalar fields of the add/edit exercise form (FormData strings are coerced). */
export const exerciseInputSchema = z
	.object({
		name: z.string().trim().min(1).max(120),
		measurementType: z.enum(MEASUREMENT_TYPES),
		routine: z.enum(ROUTINES),

		setsMin: optInt,
		setsMax: optInt,
		weightMin: optNum,
		weightMax: optNum,
		repsMin: optInt,
		repsMax: optInt,
		restMin: optInt,
		restMax: optInt,
		durationMin: optInt,
		durationMax: optInt,
		distanceMin: optNum,
		distanceMax: optNum,
		resistanceMin: optNum,
		resistanceMax: optNum
	})
	.superRefine((val, ctx) => {
		for (const field of RANGE_FIELDS) {
			const min = val[`${field}Min`];
			const max = val[`${field}Max`];
			if (!validateRange(min, max)) {
				ctx.addIssue({
					code: 'custom',
					path: [`${field}Max`],
					message: `${field} max must be ≥ min`
				});
			}
		}
	});

export type ExerciseInput = z.infer<typeof exerciseInputSchema>;
