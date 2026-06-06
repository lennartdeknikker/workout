import { z } from 'zod';
import type { MeasurementType } from '$lib/domain/workoutSets';

/** Per-measurement-type validation for a single posted set (spec 03 §7). */
const strengthSet = z
	.object({ weight: z.number().nonnegative(), reps: z.number().int().positive() })
	.strict();

const bodyweightSet = z
	.object({ reps: z.number().int().positive(), weight: z.number().nonnegative().optional() })
	.strict();

const cardioSet = z
	.object({
		durationSeconds: z.number().int().positive(),
		distance: z.number().nonnegative().optional(),
		resistance: z.number().nonnegative().optional()
	})
	.strict();

export function setSchemaFor(measurementType: MeasurementType) {
	if (measurementType === 'strength') return strengthSet;
	if (measurementType === 'bodyweight') return bodyweightSet;
	return cardioSet;
}

/** Envelope posted by the client when committing a draft. Sets are validated per type afterwards. */
export const postWorkoutSchema = z.object({
	draftId: z.string().min(1),
	exerciseId: z.string().min(1),
	timeZone: z.string().min(1),
	sets: z.array(z.record(z.string(), z.unknown())).min(1)
});

export type PostWorkoutPayload = z.infer<typeof postWorkoutSchema>;
