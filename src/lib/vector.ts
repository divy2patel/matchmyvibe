// ─── Vector Utilities ─────────────────────────────────────────────────────────
// Pure math functions for cosine similarity & top-K ranking.
// No external dependencies — operates on plain number arrays.

export interface ScoredItem<T> {
  item: T;
  score: number;
}

/**
 * Compute the dot product of two vectors.
 */
function dotProduct(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}

/**
 * Compute the L2 (Euclidean) magnitude of a vector.
 */
function magnitude(v: number[]): number {
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return Math.sqrt(sum);
}

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1, where 1 = identical direction.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector dimension mismatch: ${a.length} vs ${b.length}`
    );
  }
  const magA = magnitude(a);
  const magB = magnitude(b);
  if (magA === 0 || magB === 0) return 0;
  return dotProduct(a, b) / (magA * magB);
}

/**
 * Rank items by cosine similarity to a query vector and return the top K.
 * Items must provide an embedding via the `getEmbedding` accessor.
 */
export function topK<T>(
  queryEmbedding: number[],
  items: T[],
  getEmbedding: (item: T) => number[],
  k: number
): ScoredItem<T>[] {
  const scored: ScoredItem<T>[] = items.map((item) => ({
    item,
    score: cosineSimilarity(queryEmbedding, getEmbedding(item)),
  }));

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
