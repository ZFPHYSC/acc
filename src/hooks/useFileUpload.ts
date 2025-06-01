import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export const useFileUpload = (courseId: string) => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadFileMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const results = [];
      for (const file of files) {
        try {
          setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
          const result = await api.uploadFile(courseId, file);
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
          results.push(result);
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          setUploadProgress(prev => ({ ...prev, [file.name]: -1 }));
        }
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      // Clear progress after a delay
      setTimeout(() => setUploadProgress({}), 2000);
    },
  });

  const uploadYouTubeMutation = useMutation({
    mutationFn: (url: string) => api.processYouTubeLink(courseId, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', courseId] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const uploadFiles = useCallback((files: File[]) => {
    return uploadFileMutation.mutate(files);
  }, [uploadFileMutation]);

  const uploadYouTubeLink = useCallback((url: string) => {
    return uploadYouTubeMutation.mutate(url);
  }, [uploadYouTubeMutation]);

  return {
    uploadFiles,
    uploadYouTubeLink,
    isUploading: uploadFileMutation.isPending || uploadYouTubeMutation.isPending,
    uploadProgress,
  };
};