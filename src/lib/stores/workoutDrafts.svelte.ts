import type { DraftSet, MeasurementType } from '$lib/domain/workoutSets';

export type Routine = 'push' | 'pull' | 'legs' | 'cardio' | 'core';

/** The library exercise chosen for a draft. */
export interface ExercisePick {
	exerciseId: string;
	name: string;
	routine: Routine;
	measurementType: MeasurementType;
}

/** One in-progress exercise being logged (a tab). */
export interface Draft {
	id: string;
	exerciseId: string | null;
	exerciseName: string;
	routine: Routine | null;
	measurementType: MeasurementType | null;
	step: 1 | 2 | 3;
	sets: DraftSet[];
	posted: boolean;
}

export const MAX_TABS = 3;
const STORAGE_KEY = 'trainmate:drafts';

function emptyDraft(id: string): Draft {
	return {
		id,
		exerciseId: null,
		exerciseName: '',
		routine: null,
		measurementType: null,
		step: 1,
		sets: [],
		posted: false
	};
}

/**
 * Client-side state for the multi-tab logging form (up to 3 concurrent drafts),
 * mirrored to localStorage so in-progress sets survive a reload (spec 01 §5.3).
 */
export class WorkoutDrafts {
	drafts = $state<Draft[]>([]);
	activeId = $state<string | null>(null);

	get active(): Draft | null {
		return this.drafts.find((d) => d.id === this.activeId) ?? null;
	}
	get canAddTab(): boolean {
		return this.drafts.length < MAX_TABS;
	}
	get allPosted(): boolean {
		return this.drafts.length > 0 && this.drafts.every((d) => d.posted);
	}

	#find(id: string): Draft | undefined {
		return this.drafts.find((d) => d.id === id);
	}

	openTab(id: string): Draft | null {
		if (!this.canAddTab) return null;
		const draft = emptyDraft(id);
		this.drafts.push(draft);
		this.activeId = id;
		this.#persist();
		return draft;
	}

	setActive(id: string): void {
		if (this.#find(id)) this.activeId = id;
	}

	selectExercise(id: string, pick: ExercisePick): void {
		const d = this.#find(id);
		if (!d || d.posted) return;
		d.exerciseId = pick.exerciseId;
		d.exerciseName = pick.name;
		d.routine = pick.routine;
		d.measurementType = pick.measurementType;
		d.step = 2;
		this.#persist();
	}

	setStep(id: string, step: 1 | 2 | 3): void {
		const d = this.#find(id);
		if (!d || d.posted) return;
		d.step = step;
		this.#persist();
	}

	commitSet(id: string, set: DraftSet): void {
		const d = this.#find(id);
		if (!d || d.posted) return;
		d.sets.push(set);
		this.#persist();
	}

	removeSet(id: string, index: number): void {
		const d = this.#find(id);
		if (!d || d.posted) return;
		d.sets.splice(index, 1);
		this.#persist();
	}

	markPosted(id: string): void {
		const d = this.#find(id);
		if (!d) return;
		d.posted = true;
		this.#persist();
	}

	closeTab(id: string): void {
		this.drafts = this.drafts.filter((d) => d.id !== id);
		if (this.activeId === id) this.activeId = this.drafts[0]?.id ?? null;
		this.#persist();
	}

	reset(): void {
		this.drafts = [];
		this.activeId = null;
		this.#persist();
	}

	/** Load persisted drafts (client only). Call from onMount. */
	hydrate(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return;
			const parsed = JSON.parse(raw) as Draft[];
			if (Array.isArray(parsed) && parsed.length > 0) {
				this.drafts = parsed;
				this.activeId = parsed[0].id;
			}
		} catch {
			/* ignore corrupt storage */
		}
	}

	#persist(): void {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(this.drafts));
		} catch {
			/* ignore quota/serialisation errors */
		}
	}
}

export const workoutDrafts = new WorkoutDrafts();
