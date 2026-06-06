import { describe, it, expect } from 'vitest';
import { formatDuration, formatSetBadge, localWorkoutDate } from './workoutSets';

describe('formatDuration', () => {
	it('formats minutes and zero-padded seconds', () => {
		expect(formatDuration(300)).toBe('5:00');
		expect(formatDuration(65)).toBe('1:05');
		expect(formatDuration(9)).toBe('0:09');
	});
});

describe('formatSetBadge', () => {
	it('formats strength sets', () => {
		expect(formatSetBadge({ weight: 120, reps: 11 }, 'strength')).toBe('120kg | 11x');
	});

	it('formats bodyweight sets with and without added weight', () => {
		expect(formatSetBadge({ reps: 12 }, 'bodyweight')).toBe('12x');
		expect(formatSetBadge({ reps: 12, weight: 10 }, 'bodyweight')).toBe('+10kg · 12x');
	});

	it('formats cardio sets with optional distance', () => {
		expect(formatSetBadge({ durationSeconds: 300 }, 'cardio')).toBe('5:00');
		expect(formatSetBadge({ durationSeconds: 300, distance: 1.2 }, 'cardio')).toBe('5:00 | 1.20km');
	});
});

describe('localWorkoutDate', () => {
	it('returns the calendar date in the given time zone', () => {
		// 2026-06-06T02:00:00Z is still 2026-06-05 in Los Angeles, already 2026-06-06 in Tokyo.
		const d = new Date('2026-06-06T02:00:00Z');
		expect(localWorkoutDate(d, 'America/Los_Angeles')).toBe('2026-06-05');
		expect(localWorkoutDate(d, 'Asia/Tokyo')).toBe('2026-06-06');
		expect(localWorkoutDate(d, 'UTC')).toBe('2026-06-06');
	});
});
