import { env } from '$env/dynamic/private';
import {
	mapExerciseDbDetail,
	type ExerciseDbSearchResult,
	type ExerciseDbSnapshot,
	type RawExerciseDbDetail
} from '$lib/domain/exercisedb';

/**
 * Server-only ExerciseDB client. The browser never calls ExerciseDB directly:
 * the upstream 403s without a browser-like User-Agent and its search param is `search` (not `q`).
 * On any error/timeout these return an empty result so the UI can degrade to "add custom".
 */

const DEFAULT_BASE = 'https://oss.exercisedb.dev/api/v1';
const USER_AGENT = 'Mozilla/5.0 (compatible; Trainmate/1.0)';
const TIMEOUT_MS = 5000;

function baseUrl(): string {
	return env.EXERCISEDB_BASE_URL || DEFAULT_BASE;
}

async function fetchJson(url: string): Promise<unknown | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			headers: { 'user-agent': USER_AGENT, accept: 'application/json' },
			signal: controller.signal
		});
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

export async function searchExercises(
	query: string,
	limit = 10
): Promise<ExerciseDbSearchResult[]> {
	const url = `${baseUrl()}/exercises/search?search=${encodeURIComponent(query)}&limit=${limit}`;
	const json = (await fetchJson(url)) as { data?: ExerciseDbSearchResult[] } | null;
	if (!json || !Array.isArray(json.data)) return [];
	return json.data.map((d) => ({ exerciseId: d.exerciseId, name: d.name, gifUrl: d.gifUrl }));
}

export async function getExerciseDetail(id: string): Promise<ExerciseDbSnapshot | null> {
	const url = `${baseUrl()}/exercises/${encodeURIComponent(id)}`;
	const json = (await fetchJson(url)) as { data?: RawExerciseDbDetail } | null;
	if (!json?.data) return null;
	return mapExerciseDbDetail(json.data);
}
