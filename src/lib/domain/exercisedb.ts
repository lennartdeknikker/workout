/** Pure mapping/types for the external ExerciseDB API. No SvelteKit/DB imports. */

/** Abbreviated result returned by the search endpoint. */
export interface ExerciseDbSearchResult {
	exerciseId: string;
	name: string;
	gifUrl: string;
}

/** Full exercise detail we snapshot into the user's library. */
export interface ExerciseDbSnapshot {
	exerciseId: string;
	name: string;
	gifUrl: string;
	videoUrl: string;
	overview: string;
	targetMuscles: string[];
	bodyParts: string[];
	equipments: string[];
	secondaryMuscles: string[];
	instructions: string[];
	exerciseTips: string[];
	variations: string[];
	keywords: string[];
}

/** Loose shape of the upstream detail payload from EDB v2 (optional arrays may be absent). */
export interface RawExerciseDbDetail {
	exerciseId: string;
	name: string;
	imageUrl: string;
	videoUrl?: string;
	overview?: string;
	targetMuscles?: string[];
	bodyParts?: string[];
	equipments?: string[];
	secondaryMuscles?: string[];
	instructions?: string[];
	exerciseTips?: string[];
	variations?: string[];
	keywords?: string[];
}

/** Upstream instructions arrive prefixed like "Step:1 …" — strip that for display. */
export function stripStepPrefix(instruction: string): string {
	return instruction.replace(/^step:\s*\d+\s*/i, '').trim();
}

/** Normalise an upstream detail payload into our snapshot (strips Step prefixes, defaults arrays). */
export function mapExerciseDbDetail(raw: RawExerciseDbDetail): ExerciseDbSnapshot {
	return {
		exerciseId: raw.exerciseId,
		name: raw.name,
		gifUrl: raw.imageUrl,
		videoUrl: raw.videoUrl ?? '',
		overview: raw.overview ?? '',
		targetMuscles: raw.targetMuscles ?? [],
		bodyParts: raw.bodyParts ?? [],
		equipments: raw.equipments ?? [],
		secondaryMuscles: raw.secondaryMuscles ?? [],
		instructions: (raw.instructions ?? []).map(stripStepPrefix),
		exerciseTips: raw.exerciseTips ?? [],
		variations: raw.variations ?? [],
		keywords: raw.keywords ?? []
	};
}
