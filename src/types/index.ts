export interface Course {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  fileCount: number;
  embeddingCount: number;
  lastAccessed: Date;
  color: string;
  icon: string;
}

export interface FileItem {
  id: string;
  courseId: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  processed: boolean;
  embeddingIds: string[];
  metadata: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  sources?: Source[];
  thinking?: string[];
  webSearchEnabled?: boolean;
}

export interface Source {
  fileId: string;
  fileName: string;
  relevanceScore: number;
  excerpt: string;
  pageNumber?: number;
}

export interface QueryRequest {
  courseId: string;
  query: string;
  useWebSearch: boolean;
  maxSources?: number;
  requireCrossReference?: boolean;
}

export interface EmbeddingChunk {
  id: string;
  courseId: string;
  fileId: string;
  content: string;
  embedding?: number[];
  metadata: {
    fileName: string;
    fileType: string;
    chunkIndex: number;
    totalChunks: number;
    pageNumber?: number;
    timestamp?: string;
  };
}

export interface ThinkingLog {
  step: string;
  description: string;
  status: 'pending' | 'complete' | 'error';
  duration?: number;
}