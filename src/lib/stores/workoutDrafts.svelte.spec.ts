import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WorkoutDrafts, type ExercisePick } from './workoutDrafts.svelte';

const benchPick: ExercisePick = {
	exerciseId: 'ex-1',
	name: 'Bench Press',
	routine: 'push',
	measurementType: 'strength'
};

describe('WorkoutDrafts', () => {
	let store: WorkoutDrafts;
	beforeEach(() => {
		store = new WorkoutDrafts();
	});

	it('opens tabs up to MAX_TABS and refuses a 4th', () => {
		expect(store.openTab('a')).not.toBeNull();
		store.openTab('b');
		store.openTab('c');
		expect(store.canAddTab).toBe(false);
		expect(store.openTab('d')).toBeNull();
		expect(store.drafts.length).toBe(3);
	});

	it('selects an exercise and advances to step 2', () => {
		store.openTab('a');
		store.selectExercise('a', benchPick);
		expect(store.active?.exerciseId).toBe('ex-1');
		expect(store.active?.measurementType).toBe('strength');
		expect(store.active?.step).toBe(2);
	});

	it('commits and removes sets', () => {
		store.openTab('a');
		store.selectExercise('a', benchPick);
		store.commitSet('a', { weight: 100, reps: 8 });
		store.commitSet('a', { weight: 100, reps: 7 });
		expect(store.active?.sets.length).toBe(2);
		store.removeSet('a', 0);
		expect(store.active?.sets).toEqual([{ weight: 100, reps: 7 }]);
	});

	it('ignores mutations on a posted draft', () => {
		store.openTab('a');
		store.selectExercise('a', benchPick);
		store.commitSet('a', { weight: 100, reps: 8 });
		store.markPosted('a');
		store.commitSet('a', { weight: 100, reps: 6 });
		expect(store.active?.sets.length).toBe(1);
	});

	it('reports allPosted only when every draft is posted', () => {
		store.openTab('a');
		store.openTab('b');
		store.markPosted('a');
		expect(store.allPosted).toBe(false);
		store.markPosted('b');
		expect(store.allPosted).toBe(true);
	});

	it('closeTab updates the active tab', () => {
		store.openTab('a');
		store.openTab('b');
		expect(store.activeId).toBe('b');
		store.closeTab('b');
		expect(store.activeId).toBe('a');
		store.closeTab('a');
		expect(store.activeId).toBeNull();
	});

	it('persists to and hydrates from localStorage', () => {
		const mem = new Map<string, string>();
		vi.stubGlobal('localStorage', {
			getItem: (k: string) => mem.get(k) ?? null,
			setItem: (k: string, v: string) => void mem.set(k, v),
			removeItem: (k: string) => void mem.delete(k)
		});

		store.openTab('a');
		store.selectExercise('a', benchPick);
		store.commitSet('a', { weight: 80, reps: 10 });

		const restored = new WorkoutDrafts();
		restored.hydrate();
		expect(restored.drafts.length).toBe(1);
		expect(restored.active?.sets).toEqual([{ weight: 80, reps: 10 }]);

		vi.unstubAllGlobals();
	});
});
