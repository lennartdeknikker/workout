export interface Exercise {
	type: string;
	id: string;
	label: string;
	sets: {
		min: number;
		max: number;
	};
	reps: {
		min: number;
		max: number;
	};
	rest: {
		min: number;
		max: number;
	};
}
