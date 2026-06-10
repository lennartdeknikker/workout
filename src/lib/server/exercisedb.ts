import { env } from '$env/dynamic/private';
import {
	mapExerciseDbDetail,
	type ExerciseDbSearchResult,
	type ExerciseDbSnapshot,
	type RawExerciseDbDetail
} from '$lib/domain/exercisedb';

/** Server-only ExerciseDB v2 client (via RapidAPI). On any error/timeout returns empty so the UI can degrade. */

const DEFAULT_BASE = 'https://edb-with-videos-and-images-by-ascendapi.p.rapidapi.com/api/v1';
const RAPIDAPI_HOST = 'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const TIMEOUT_MS = 5000;

function baseUrl(): string {
	return env.EXERCISEDB_BASE_URL || DEFAULT_BASE;
}

function apiKey(): string {
	return env.EXERCISEDB_API_KEY ?? '';
}

async function fetchJson(url: string): Promise<unknown | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const res = await fetch(url, {
			headers: {
				'X-RapidAPI-Key': apiKey(),
				'X-RapidAPI-Host': RAPIDAPI_HOST,
				accept: 'application/json'
			},
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

interface RawSearchResult {
	exerciseId: string;
	name: string;
	imageUrl: string;
}

export async function searchExercises(
	query: string,
	limit = 10
): Promise<ExerciseDbSearchResult[]> {
	const url = `${baseUrl()}/exercises/search?search=${encodeURIComponent(query)}&limit=${limit}`;
	const json = (await fetchJson(url)) as { data?: RawSearchResult[] } | null;
	if (!json || !Array.isArray(json.data)) return [];
	return json.data.map((d) => ({ exerciseId: d.exerciseId, name: d.name, gifUrl: d.imageUrl }));
}

export async function getExerciseDetail(id: string): Promise<ExerciseDbSnapshot | null> {
	const url = `${baseUrl()}/exercises/${encodeURIComponent(id)}`;
	const json = (await fetchJson(url)) as { data?: RawExerciseDbDetail } | null;
	if (!json?.data) return null;
	return mapExerciseDbDetail(json.data);
}
