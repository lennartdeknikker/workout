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
			imageUrl: 'https://cdn.exercisedb.dev/media/UDm6cGl.jpg',
			videoUrl: 'https://cdn.exercisedb.dev/videos/UDm6cGl.mp4',
			overview: 'A great shoulder exercise.',
			targetMuscles: ['delts'],
			bodyParts: ['shoulders'],
			equipments: ['kettlebell'],
			secondaryMuscles: ['triceps', 'core'],
			instructions: ['Step:1 Stand tall.', 'Step:2 Press overhead.'],
			exerciseTips: ['Keep your core tight.'],
			variations: ['Single arm press'],
			keywords: ['shoulder', 'kettlebell']
		});

		expect(snapshot).toEqual({
			exerciseId: 'UDm6cGl',
			name: 'kettlebell seesaw press',
			gifUrl: 'https://cdn.exercisedb.dev/media/UDm6cGl.jpg',
			videoUrl: 'https://cdn.exercisedb.dev/videos/UDm6cGl.mp4',
			overview: 'A great shoulder exercise.',
			targetMuscles: ['delts'],
			bodyParts: ['shoulders'],
			equipments: ['kettlebell'],
			secondaryMuscles: ['triceps', 'core'],
			instructions: ['Stand tall.', 'Press overhead.'],
			exerciseTips: ['Keep your core tight.'],
			variations: ['Single arm press'],
			keywords: ['shoulder', 'kettlebell']
		});
	});

	it('defaults missing optional arrays to empty arrays', () => {
		const snapshot = mapExerciseDbDetail({
			exerciseId: 'x1',
			name: 'mystery move',
			imageUrl: 'https://example.com/x1.jpg'
		});

		expect(snapshot.targetMuscles).toEqual([]);
		expect(snapshot.instructions).toEqual([]);
		expect(snapshot.secondaryMuscles).toEqual([]);
	});
});
