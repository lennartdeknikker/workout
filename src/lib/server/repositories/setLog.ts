import type { Insertable } from 'kysely';
import { db } from '$lib/server/db';
import type { SetLogTable } from '$lib/server/db/types';

export type SetLogInsert = Insertable<SetLogTable>;

/** Insert all sets of one posted draft atomically. */
export async function insertSets(rows: SetLogInsert[]): Promise<void> {
	if (rows.length === 0) return;
	await db.transaction().execute(async (trx) => {
		await trx.insertInto('set_log').values(rows).execute();
	});
}

/**
 * In-memory idempotency guard against double-posting the same draft (e.g. double-tap / retry).
 * Single-instance only — fine for a self-hosted Pi. Multi-instance would need a shared store.
 */
const TTL_MS = 2 * 60 * 1000;
const recent = new Map<string, number>();

export function wasRecentlyPosted(draftId: string): boolean {
	const expiry = recent.get(draftId);
	if (expiry === undefined) return false;
	if (expiry < Date.now()) {
		recent.delete(draftId);
		return false;
	}
	return true;
}

export function markRecentlyPosted(draftId: string): void {
	const now = Date.now();
	recent.set(draftId, now + TTL_MS);
	// Opportunistic cleanup of expired entries.
	for (const [id, expiry] of recent) {
		if (expiry < now) recent.delete(id);
	}
}
