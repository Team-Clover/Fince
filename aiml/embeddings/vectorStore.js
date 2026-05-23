import { generateEmbedding, cosineSimilarity } from './embeddingGenerator.js';

// Simple in-memory document storage with embeddings for instant low-latency indexing
const store = new Map();

/**
 * Indexes an item in the Vector Store.
 * @param {string} id - Database Record ID
 * @param {string} text - Text to embed and index
 * @param {object} metadata - Document data payload (e.g. Transaction, Invoice details)
 */
export async function indexDocument(id, text, metadata = {}) {
  const vector = await generateEmbedding(text);
  store.set(id, { id, text, vector, metadata });
}

/**
 * Searches the store using Cosine Similarity on query embeddings.
 * @param {string} queryText - User natural query text
 * @param {number} limit - Maximum matches to return
 * @returns {Promise<Array<{id: string, text: string, score: number, metadata: object}>>}
 */
export async function searchVectorStore(queryText, limit = 10) {
  const queryVector = await generateEmbedding(queryText);
  const results = [];

  for (const doc of store.values()) {
    const score = cosineSimilarity(queryVector, doc.vector);
    results.push({
      id: doc.id,
      text: doc.text,
      score,
      metadata: doc.metadata
    });
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Clears the cache memory.
 */
export function clearStore() {
  store.clear();
}
