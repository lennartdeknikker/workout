/** A {min, max} pair is valid when either bound is absent, or min ≤ max. */
export function validateRange(
	min: number | null | undefined,
	max: number | null | undefined
): boolean {
	if (min == null || max == null) return true;
	return min <= max;
}
