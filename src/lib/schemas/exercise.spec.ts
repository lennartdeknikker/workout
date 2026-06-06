import { describe, it, expect } from 'vitest';
import { exerciseInputSchema } from './exercise';

const base = { name: 'Bench Press', measurementType: 'strength', routine: 'push' };

describe('exerciseInputSchema', () => {
	it('accepts a minimal valid exercise', () => {
		const result = exerciseInputSchema.safeParse(base);
		expect(result.success).toBe(true);
	});

	it('coerces numeric range strings (FormData) to numbers', () => {
		const result = exerciseInputSchema.safeParse({
			...base,
			weightMin: '20',
			weightMax: '120.5',
			repsMin: '6',
			repsMax: '10'
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.weightMin).toBe(20);
			expect(result.data.weightMax).toBe(120.5);
			expect(result.data.repsMin).toBe(6);
		}
	});

	it('treats empty strings as absent (optional)', () => {
		const result = exerciseInputSchema.safeParse({ ...base, weightMin: '', repsMax: '' });
		expect(result.success).toBe(true);
		if (result.success) expect(result.data.weightMin).toBeUndefined();
	});

	it('rejects a missing name', () => {
		const result = exerciseInputSchema.safeParse({ ...base, name: '' });
		expect(result.success).toBe(false);
	});

	it('rejects an unknown measurement type', () => {
		const result = exerciseInputSchema.safeParse({ ...base, measurementType: 'plyo' });
		expect(result.success).toBe(false);
	});

	it('rejects a range where min > max', () => {
		const result = exerciseInputSchema.safeParse({ ...base, repsMin: '12', repsMax: '8' });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues.some((i) => i.path.includes('repsMax'))).toBe(true);
		}
	});

	it('rejects negative values', () => {
		const result = exerciseInputSchema.safeParse({ ...base, weightMin: '-5' });
		expect(result.success).toBe(false);
	});

	it('rejects non-integer reps', () => {
		const result = exerciseInputSchema.safeParse({ ...base, repsMin: '6.5' });
		expect(result.success).toBe(false);
	});
});
