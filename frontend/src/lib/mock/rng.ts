/**
 * Deterministic seeded PRNG (mulberry32).
 * Used so mock data is identical on server and client — no hydration drift.
 */
export function createRng(seed: number) {
  let a = seed >>> 0;
  const next = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    /** Float in [min, max). */
    range: (min: number, max: number) => min + next() * (max - min),
    /** Integer in [min, max]. */
    int: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
    /** Pick a random element. */
    pick: <T>(arr: readonly T[]): T => arr[Math.floor(next() * arr.length)],
    /** True with probability p. */
    chance: (p: number) => next() < p,
    /** Roughly normal-distributed value via averaging. */
    gaussian: () => (next() + next() + next() + next() - 2) / 2,
  };
}

/** Deterministic string hash → seed. */
export function seedFrom(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
