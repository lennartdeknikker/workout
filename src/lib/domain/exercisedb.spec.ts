import { describe, it, expect } from 'vitest';
import { stripStepPrefix, mapExerciseDbDetail } from './exercisedb';

describe('stripStepPrefix', () => {
	it('removes a "Step:N " prefix', () => {
		expect(stripStepPrefix('Step:1 Lie face down on the floor.')).toBe(
			'Lie face down on the floor.'
		);
	});

	it('is case-insensitive and tolerates extra spacing', () => {
		expect(stripStepPrefix('step:12   Press up.')).toBe('Press up.');
	});

	it('leaves unprefixed text untouched', () => {
		expect(stripStepPrefix('Just do it')).toBe('Just do it');
	});
});

describe('mapExerciseDbDetail', () => {
	it('maps all fields and strips instruction prefixes', () => {
		const snapshot = mapExerciseDbDetail({
			exerciseId: 'UDm6cGl',
			name: 'kettlebell seesaw press',
			gifUrl: 'https://static.exercisedb.dev/media/UDm6cGl.gif',
			targetMuscles: ['delts'],
			bodyParts: ['shoulders'],
			equipments: ['kettlebell'],
			secondaryMuscles: ['triceps', 'core'],
			instructions: ['Step:1 Stand tall.', 'Step:2 Press overhead.']
		});

		expect(snapshot).toEqual({
			exerciseId: 'UDm6cGl',
			name: 'kettlebell seesaw press',
			gifUrl: 'https://static.exercisedb.dev/media/UDm6cGl.gif',
			targetMuscles: ['delts'],
			bodyParts: ['shoulders'],
			equipments: ['kettlebell'],
			secondaryMuscles: ['triceps', 'core'],
			instructions: ['Stand tall.', 'Press overhead.']
		});
	});

	it('defaults missing optional arrays to empty arrays', () => {
		const snapshot = mapExerciseDbDetail({
			exerciseId: 'x1',
			name: 'mystery move',
			gifUrl: 'https://example.com/x1.gif'
		});

		expect(snapshot.targetMuscles).toEqual([]);
		expect(snapshot.instructions).toEqual([]);
		expect(snapshot.secondaryMuscles).toEqual([]);
	});
});
