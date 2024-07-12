export interface Exercise {
	type: string;
	id: string;
	label: string;
	sets?: {
		min: number;
		max: number;
	};
	weight?: {
		min: number;
		max: number;
	};
	reps?: {
		min: number;
		max: number;
	};
	rest?: {
		min: number;
		max: number;
	};
	time?: {
		min: number;
		max: number;
	};
}

export interface ExerciseSet {
	weight: number;
	reps: number;
}

export interface ExerciseSession {
	time: number;
}