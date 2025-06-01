import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChatMessage, QueryRequest } from '../types';
import api from '../services/api';

export const useChat = (courseId: string) => {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Fetch chat history
  const { data: history } = useQuery({
    queryKey: ['chat-history', courseId],
    queryFn: () => api.getChatHistory(courseId),
    onSuccess: (data) => {
      setMessages(data.messages || []);
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (request: QueryRequest) => api.sendChatMessage(request),
    onMutate: async (request) => {
      // Add user message immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: request.query,
        timestamp: new Date(),
        webSearchEnabled: request.useWebSearch,
      };
      
      setMessages(prev => [...prev, userMessage]);
    },
    onSuccess: (response) => {
      // Add AI response
      setMessages(prev => [...prev, response]);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      // Could add error handling UI here
    },
  });

  const sendMessage = useCallback((request: QueryRequest) => {
    return sendMessageMutation.mutate(request);
  }, [sendMessageMutation]);

  return {
    messages,
    sendMessage,
    isLoading: sendMessageMutation.isPending,
  };
};