import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

/**
 * Generates vector embeddings for a given text input.
 * Falls back to a local token frequency vector if the API fails or is not configured.
 * @param {string} text 
 * @returns {Promise<Array<number>>}
 */
export async function generateEmbedding(text) {
  if (!text || typeof text !== 'string') return new Array(768).fill(0);
  
  try {
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
      const result = await model.embedContent(text);
      if (result && result.embedding && result.embedding.values) {
        return result.embedding.values;
      }
    }
  } catch (error) {
    console.warn("Gemini embedding generation failed, using local fallback token vector:", error.message);
  }

  // Local token overlap vector simulation (768 dimensions)
  const vector = new Array(768).fill(0);
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 2);
  
  words.forEach((word, idx) => {
    // Generate a simple deterministic hash for the word to map to a dimension [0, 767]
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = (hash << 5) - hash + word.charCodeAt(i);
      hash |= 0;
    }
    const dim = Math.abs(hash) % 768;
    vector[dim] += 1;
  });

  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < 768; i++) {
      vector[i] /= magnitude;
    }
  }

  return vector;
}

/**
 * Calculates cosine similarity between two vectors.
 * @param {Array<number>} vecA 
 * @param {Array<number>} vecB 
 * @returns {number}
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  const magA = Math.sqrt(normA);
  const magB = Math.sqrt(normB);
  
  if (magA === 0 || magB === 0) return 0;
  return dotProduct / (magA * magB);
}
