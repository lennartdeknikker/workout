import { describe, it, expect } from 'vitest';
import {
	computeFocusArea,
	formatDayLabel,
	formatLoggedSet,
	groupSetsByExercise,
	summariseRoutines,
	type LoggedSet
} from './history';

function set(partial: Partial<LoggedSet>): LoggedSet {
	return {
		exerciseId: 'x',
		exerciseName: 'Ex',
		routine: 'push',
		measurementType: 'strength',
		setIndex: 0,
		weight: null,
		reps: null,
		durationSeconds: null,
		distance: null,
		resistance: null,
		...partial
	};
}

describe('groupSetsByExercise', () => {
	it('groups by exercise preserving first-seen order', () => {
		const groups = groupSetsByExercise([
			set({ exerciseId: 'a', exerciseName: 'Bench', setIndex: 0 }),
			set({ exerciseId: 'a', exerciseName: 'Bench', setIndex: 1 }),
			set({ exerciseId: 'b', exerciseName: 'Fly', setIndex: 0 })
		]);
		expect(groups.map((g) => g.exerciseName)).toEqual(['Bench', 'Fly']);
		expect(groups[0].sets.length).toBe(2);
	});

	it('groups deleted exercises (null id) by snapshot name', () => {
		const groups = groupSetsByExercise([
			set({ exerciseId: null, exerciseName: 'Gone' }),
			set({ exerciseId: null, exerciseName: 'Gone' })
		]);
		expect(groups.length).toBe(1);
		expect(groups[0].exerciseName).toBe('Gone');
	});
});

describe('summariseRoutines', () => {
	it('counts distinct exercises and total sets per routine', () => {
		const summaries = summariseRoutines([
			set({ exerciseId: 'a', routine: 'push' }),
			set({ exerciseId: 'a', routine: 'push' }),
			set({ exerciseId: 'b', routine: 'push' }),
			set({ exerciseId: 'c', routine: 'legs' })
		]);
		const push = summaries.find((s) => s.routine === 'push');
		expect(push).toEqual({ routine: 'push', exerciseCount: 2, setCount: 3 });
	});
});

describe('computeFocusArea', () => {
	it('returns null when empty', () => {
		expect(computeFocusArea([])).toBeNull();
	});

	it('picks the routine with the most exercises', () => {
		expect(
			computeFocusArea([
				{ routine: 'push', exerciseCount: 3, setCount: 9 },
				{ routine: 'legs', exerciseCount: 1, setCount: 4 }
			])
		).toBe('push');
	});

	it('breaks an exercise-count tie by set count', () => {
		expect(
			computeFocusArea([
				{ routine: 'push', exerciseCount: 2, setCount: 5 },
				{ routine: 'pull', exerciseCount: 2, setCount: 8 }
			])
		).toBe('pull');
	});

	it('breaks a full tie alphabetically', () => {
		expect(
			computeFocusArea([
				{ routine: 'pull', exerciseCount: 2, setCount: 5 },
				{ routine: 'legs', exerciseCount: 2, setCount: 5 }
			])
		).toBe('legs');
	});
});

describe('formatLoggedSet', () => {
	it('formats by measurement type', () => {
		expect(formatLoggedSet(set({ measurementType: 'strength', weight: 100, reps: 8 }))).toBe(
			'100kg | 8x'
		);
		expect(
			formatLoggedSet(set({ measurementType: 'cardio', durationSeconds: 600, distance: 2.5 }))
		).toBe('10:00 | 2.50km');
	});
});

describe('formatDayLabel', () => {
	it('renders a tz-stable weekday/day/month label', () => {
		expect(formatDayLabel('2026-06-01')).toBe('Mon 1 Jun');
	});
});
