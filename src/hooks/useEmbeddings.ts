import { useState, useCallback } from 'react';
import { api } from '../services/api';
import { embeddingsService } from '../services/embeddings';

interface UseEmbeddingsResult {
  generateEmbeddings: (text: string) => Promise<number[]>;
  similaritySearch: (query: string, topK?: number) => Promise<any[]>;
  isLoading: boolean;
  error: string | null;
}

export const useEmbeddings = (courseId: string): UseEmbeddingsResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateEmbeddings = useCallback(async (text: string): Promise<number[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await embeddingsService.generateEmbedding(text);
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const similaritySearch = useCallback(async (query: string, topK = 5): Promise<any[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/embeddings/${courseId}/search`, { 
        query, 
        topK 
      });
      
      setIsLoading(false);
      return response.data.results;
    } catch (err) {
      setIsLoading(false);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return [];
    }
  }, [courseId]);

  return {
    generateEmbeddings,
    similaritySearch,
    isLoading,
    error
  };
}; 