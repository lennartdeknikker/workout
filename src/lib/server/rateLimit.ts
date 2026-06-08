/**
 * Minimal in-memory fixed-window rate limiter (per key). Single-instance only —
 * adequate for a self-hosted Pi; a multi-instance deploy would need a shared store.
 */
interface Window {
	count: number;
	resetAt: number;
}

const windows = new Map<string, Window>();

/** Returns true if the request is allowed, false if the limit is exceeded. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
	const now = Date.now();
	const w = windows.get(key);

	if (!w || w.resetAt <= now) {
		windows.set(key, { count: 1, resetAt: now + windowMs });
		// Opportunistic cleanup so the map doesn't grow unbounded.
		if (windows.size > 5000) {
			for (const [k, v] of windows) if (v.resetAt <= now) windows.delete(k);
		}
		return true;
	}

	if (w.count >= limit) return false;
	w.count += 1;
	return true;
}
