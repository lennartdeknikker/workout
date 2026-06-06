import { describe, it, expect } from 'vitest';
import { setSchemaFor, postWorkoutSchema } from './workout';

describe('setSchemaFor', () => {
	it('strength requires weight + reps and rejects cardio fields', () => {
		expect(setSchemaFor('strength').safeParse({ weight: 100, reps: 8 }).success).toBe(true);
		expect(setSchemaFor('strength').safeParse({ reps: 8 }).success).toBe(false);
		expect(
			setSchemaFor('strength').safeParse({ weight: 100, reps: 8, durationSeconds: 60 }).success
		).toBe(false);
	});

	it('bodyweight requires reps; weight optional', () => {
		expect(setSchemaFor('bodyweight').safeParse({ reps: 12 }).success).toBe(true);
		expect(setSchemaFor('bodyweight').safeParse({ reps: 12, weight: 10 }).success).toBe(true);
		expect(setSchemaFor('bodyweight').safeParse({ weight: 10 }).success).toBe(false);
	});

	it('cardio requires duration; distance/resistance optional; rejects reps/weight', () => {
		expect(setSchemaFor('cardio').safeParse({ durationSeconds: 300 }).success).toBe(true);
		expect(setSchemaFor('cardio').safeParse({ durationSeconds: 300, distance: 1.2 }).success).toBe(
			true
		);
		expect(setSchemaFor('cardio').safeParse({ durationSeconds: 300, reps: 5 }).success).toBe(false);
		expect(setSchemaFor('cardio').safeParse({ distance: 1.2 }).success).toBe(false);
	});

	it('rejects zero/negative reps', () => {
		expect(setSchemaFor('strength').safeParse({ weight: 100, reps: 0 }).success).toBe(false);
	});
});

describe('postWorkoutSchema', () => {
	it('accepts a valid envelope', () => {
		const r = postWorkoutSchema.safeParse({
			draftId: 'd1',
			exerciseId: 'ex1',
			timeZone: 'Europe/Amsterdam',
			sets: [{ weight: 100, reps: 8 }]
		});
		expect(r.success).toBe(true);
	});

	it('rejects an empty set list', () => {
		const r = postWorkoutSchema.safeParse({
			draftId: 'd1',
			exerciseId: 'ex1',
			timeZone: 'UTC',
			sets: []
		});
		expect(r.success).toBe(false);
	});
});
