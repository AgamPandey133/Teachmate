/**
 * RAG (Retrieval-Augmented Generation) Utilities
 *
 * This module handles:
 * 1. Generating vector embeddings from text using the Gemini Embedding API.
 * 2. Computing Cosine Similarity between two vectors to find semantically
 *    related vocabulary words for a given user prompt.
 */

/**
 * Generates a vector embedding for a given text string using the
 * Gemini embedding model.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - A high-dimensional float array (the embedding vector).
 */
export async function generateEmbedding(text) {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = "models/gemini-embedding-001"; // Google's Gemini embedding model

  const url = `https://generativelanguage.googleapis.com/v1beta/${model}:embedContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      content: {
        parts: [{ text }],
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `Embedding API Error: ${data.error?.message || "Unknown error"}`
    );
  }

  return data.embedding?.values;
}

/**
 * Computes the Cosine Similarity between two vectors.
 * Returns a value between -1 (opposite) and 1 (identical).
 * Used to find vocabulary words most semantically relevant to a user's prompt.
 *
 * Formula: cos(θ) = (A · B) / (||A|| * ||B||)
 *
 * @param {number[]} vecA
 * @param {number[]} vecB
 * @returns {number}
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Retrieves the top-N most relevant vocabulary words for a given prompt
 * by computing cosine similarity against stored embeddings.
 *
 * @param {number[]} promptEmbedding - The embedding vector of the user's prompt.
 * @param {Array} vocabularyDocs - Array of Vocabulary Mongoose documents (must have .embedding field).
 * @param {number} topN - Number of top results to return.
 * @returns {Array} - Sorted array of { word, translation, similarity } objects.
 */
export function retrieveRelevantVocabulary(
  promptEmbedding,
  vocabularyDocs,
  topN = 5
) {
  const scored = vocabularyDocs
    .filter((doc) => doc.embedding && doc.embedding.length > 0)
    .map((doc) => ({
      word: doc.word,
      translation: doc.translation || "",
      originalContext: doc.originalContext || "",
      similarity: cosineSimilarity(promptEmbedding, doc.embedding),
    }));

  // Sort descending by similarity and return the top N
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, topN);
}
