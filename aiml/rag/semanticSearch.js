import { searchVectorStore } from '../embeddings/vectorStore.js';
import { syncUserKnowledgeBase } from './retrieval.js';

/**
 * Searches the user knowledge base semantically using natural language queries
 * @param {string} userId - User ID
 * @param {string} query - User natural search query (e.g. "AWS expenses above ₹500")
 * @returns {Promise<Array<object>>}
 */
export async function semanticSearch(userId, query) {
  if (!query || query.trim() === '') return [];
  
  // Sync before search to ensure live database consistency
  await syncUserKnowledgeBase(userId);
  
  const searchResults = await searchVectorStore(query, 12);
  
  // Filter search results with score threshold to maintain relevance
  return searchResults
    .filter(res => res.score > 0.15) // Relevance threshold
    .map(res => ({
      id: res.id,
      score: res.score,
      text: res.text,
      type: res.metadata.type,
      data: res.metadata.data
    }));
}
