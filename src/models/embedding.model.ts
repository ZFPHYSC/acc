export interface EmbeddingModel {
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
    startChar?: number;
    endChar?: number;
    chunkSize?: number;
  };
  createdAt: Date;
}

export class Embedding implements EmbeddingModel {
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
    startChar?: number;
    endChar?: number;
    chunkSize?: number;
  };
  createdAt: Date;

  constructor(data: Partial<EmbeddingModel>) {
    this.id = data.id || '';
    this.courseId = data.courseId || '';
    this.fileId = data.fileId || '';
    this.content = data.content || '';
    this.embedding = data.embedding;
    this.metadata = data.metadata || {
      fileName: '',
      fileType: '',
      chunkIndex: 0,
      totalChunks: 0,
    };
    this.createdAt = data.createdAt || new Date();
  }

  setEmbedding(embedding: number[]): void {
    this.embedding = embedding;
  }

  getContentPreview(maxLength: number = 100): string {
    if (this.content.length <= maxLength) {
      return this.content;
    }
    return this.content.substring(0, maxLength) + '...';
  }

  toJSON(): EmbeddingModel {
    return {
      id: this.id,
      courseId: this.courseId,
      fileId: this.fileId,
      content: this.content,
      embedding: this.embedding,
      metadata: this.metadata,
      createdAt: this.createdAt,
    };
  }

  static fromJSON(data: any): Embedding {
    return new Embedding({
      ...data,
      createdAt: new Date(data.createdAt),
    });
  }

  // Helper method to check if this chunk is the start of a document
  isDocumentStart(): boolean {
    return this.metadata.chunkIndex === 0;
  }

  // Helper method to check if this chunk is the end of a document
  isDocumentEnd(): boolean {
    return this.metadata.chunkIndex === this.metadata.totalChunks - 1;
  }

  // Get context window around this chunk
  getContextWindow(): { start: number; end: number } {
    return {
      start: this.metadata.startChar || 0,
      end: this.metadata.endChar || this.content.length,
    };
  }
}