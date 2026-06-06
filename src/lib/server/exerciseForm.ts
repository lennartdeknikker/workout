import { exerciseInputSchema, type ExerciseInput } from '$lib/schemas/exercise';
import type { ExerciseDbSnapshot } from '$lib/domain/exercisedb';

type ParseResult =
	| { ok: true; input: ExerciseInput; snapshot: ExerciseDbSnapshot | null }
	| { ok: false; message: string };

/** Parse + validate the add/edit exercise form. Unknown keys (e.g. `snapshot`) are ignored by the schema. */
export function parseExerciseForm(formData: FormData): ParseResult {
	const raw = Object.fromEntries(formData);
	const parsed = exerciseInputSchema.safeParse(raw);
	if (!parsed.success) {
		const first = parsed.error.issues[0];
		const where = first?.path.join('.') ?? 'form';
		return { ok: false, message: `${where}: ${first?.message ?? 'invalid value'}` };
	}

	let snapshot: ExerciseDbSnapshot | null = null;
	const snap = formData.get('snapshot');
	if (typeof snap === 'string' && snap.length > 0) {
		try {
			snapshot = JSON.parse(snap) as ExerciseDbSnapshot;
		} catch {
			snapshot = null;
		}
	}

	return { ok: true, input: parsed.data, snapshot };
}
