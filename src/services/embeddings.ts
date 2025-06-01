import api from './api';

interface EmbeddingResponse {
  embedding: number[];
}

export const embeddingsService = {
  /**
   * Generate an embedding vector for the provided text
   * @param text - The text to generate an embedding for
   * @returns Promise resolving to an array of floats representing the embedding
   */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await api.post<EmbeddingResponse>('/embeddings/generate', { text });
      return response.data.embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  },

  /**
   * Perform a similarity search using the provided query text
   * @param courseId - The ID of the course to search within
   * @param query - The search query text
   * @param topK - Number of results to return (default: 5)
   * @returns Promise resolving to the search results
   */
  async searchSimilarContent(courseId: string, query: string, topK = 5): Promise<any[]> {
    try {
      const response = await api.post(`/embeddings/${courseId}/search`, { 
        query, 
        topK 
      });
      return response.data.results;
    } catch (error) {
      console.error('Error searching similar content:', error);
      return [];
    }
  }
};

export default embeddingsService; 