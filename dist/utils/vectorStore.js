"use strict";
/**
 * A simple in-memory vector store for demonstration purposes
 * In a real application, this would use a vector database like Pinecone, Milvus, or Weaviate
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorStore = void 0;
// Store embeddings by course ID
const embeddingsByCourse = {};
exports.vectorStore = {
    /**
     * Generate a dummy embedding vector for text
     * In a real application, this would call an embedding API
     * @param text - The text to generate an embedding for
     * @returns A vector of 1536 dimensions (OpenAI's embedding size)
     */
    async generateEmbedding(text) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 200));
        // Generate a deterministic but unique vector based on the text
        // This is just for demonstration and has no semantic meaning
        const seed = text.length;
        const vector = [];
        // Generate a 1536-dimensional vector (like OpenAI's ada-002)
        for (let i = 0; i < 1536; i++) {
            // Use a simple hash function to generate a value between -1 and 1
            const hash = Math.sin(i * seed) * 10000;
            vector.push(Math.sin(hash) / 2);
        }
        return vector;
    },
    /**
     * Add an embedding to the store
     * @param id - Unique identifier for the embedding
     * @param courseId - The course ID
     * @param vector - The embedding vector
     */
    async addEmbedding(id, courseId, vector) {
        if (!embeddingsByCourse[courseId]) {
            embeddingsByCourse[courseId] = [];
        }
        // Check if ID already exists and replace it
        const existingIndex = embeddingsByCourse[courseId].findIndex(e => e.id === id);
        if (existingIndex >= 0) {
            embeddingsByCourse[courseId][existingIndex] = { id, vector };
        }
        else {
            embeddingsByCourse[courseId].push({ id, vector });
        }
    },
    /**
     * Delete an embedding from the store
     * @param id - The embedding ID to delete
     */
    async deleteEmbedding(id) {
        // Remove from all courses (in a real app we'd have a way to know which course)
        for (const courseId in embeddingsByCourse) {
            embeddingsByCourse[courseId] = embeddingsByCourse[courseId].filter(e => e.id !== id);
        }
    },
    /**
     * Calculate cosine similarity between two vectors
     * @param a - First vector
     * @param b - Second vector
     * @returns Similarity score between -1 and 1
     */
    cosineSimilarity(a, b) {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same dimensions');
        }
        let dotProduct = 0;
        let aMagnitude = 0;
        let bMagnitude = 0;
        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            aMagnitude += a[i] * a[i];
            bMagnitude += b[i] * b[i];
        }
        aMagnitude = Math.sqrt(aMagnitude);
        bMagnitude = Math.sqrt(bMagnitude);
        if (aMagnitude === 0 || bMagnitude === 0) {
            return 0;
        }
        return dotProduct / (aMagnitude * bMagnitude);
    },
    /**
     * Perform a similarity search in the vector store
     * @param courseId - The course ID to search within
     * @param queryVector - The query vector
     * @param topK - Number of results to return
     * @returns Most similar embeddings with their scores
     */
    async similaritySearch(courseId, queryVector, topK = 5) {
        const courseEmbeddings = embeddingsByCourse[courseId] || [];
        // Calculate similarity for each embedding
        const scoredResults = courseEmbeddings.map(entry => ({
            id: entry.id,
            similarity: this.cosineSimilarity(queryVector, entry.vector)
        }));
        // Sort by similarity (descending)
        scoredResults.sort((a, b) => b.similarity - a.similarity);
        // Return top K results
        return scoredResults.slice(0, topK);
    }
};
exports.default = exports.vectorStore;
//# sourceMappingURL=vectorStore.js.map