import { OpenAI } from 'openai';
import { ChromaClient } from 'chromadb';
import { v4 as uuidv4 } from 'uuid';
import { EmbeddingChunk } from '../types';

const openai = new OpenAI({
  apiKey: "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",
});

const chroma = new ChromaClient({
  path: process.env.CHROMA_URL || 'http://localhost:8000',
});

export class EmbeddingService {
  private collection: any;

  async initialize() {
    try {
      this.collection = await chroma.getOrCreateCollection({
        name: 'course_embeddings',
        metadata: { 'hnsw:space': 'cosine' },
      });
    } catch (error) {
      console.error('Failed to initialize ChromaDB:', error);
    }
  }

  async createEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error('Failed to create embedding:', error);
      throw error;
    }
  }

  async storeEmbeddings(chunks: EmbeddingChunk[]): Promise<void> {
    if (!this.collection) await this.initialize();

    const embeddings = await Promise.all(
      chunks.map(chunk => this.createEmbedding(chunk.content))
    );

    const ids = chunks.map(chunk => chunk.id);
    const documents = chunks.map(chunk => chunk.content);
    const metadatas = chunks.map(chunk => ({
      courseId: chunk.courseId,
      fileId: chunk.fileId,
      fileName: chunk.metadata.fileName,
      fileType: chunk.metadata.fileType,
      chunkIndex: chunk.metadata.chunkIndex,
      pageNumber: chunk.metadata.pageNumber || null,
    }));

    await this.collection.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });
  }

  async searchSimilar(
    courseId: string,
    query: string,
    limit: number = 5
  ): Promise<any[]> {
    if (!this.collection) await this.initialize();

    const queryEmbedding = await this.createEmbedding(query);

    const results = await this.collection.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      where: { courseId },
    });

    return results;
  }

  async deleteCoursEmbeddings(courseId: string): Promise<void> {
    if (!this.collection) await this.initialize();

    const allDocs = await this.collection.get({
      where: { courseId },
    });

    if (allDocs.ids.length > 0) {
      await this.collection.delete({
        ids: allDocs.ids,
      });
    }
  }

  chunkText(text: string, maxChunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = startIndex + maxChunkSize;
      
      // Try to find a natural break point
      if (endIndex < text.length) {
        const lastPeriod = text.lastIndexOf('.', endIndex);
        const lastNewline = text.lastIndexOf('\n', endIndex);
        const breakPoint = Math.max(lastPeriod, lastNewline);
        
        if (breakPoint > startIndex + maxChunkSize / 2) {
          endIndex = breakPoint + 1;
        }
      }

      chunks.push(text.slice(startIndex, endIndex).trim());
      startIndex = endIndex - overlap;
    }

    return chunks;
  }

  async processFileForEmbedding(
    courseId: string,
    fileId: string,
    fileName: string,
    fileType: string,
    content: string
  ): Promise<string[]> {
    const chunks = this.chunkText(content);
    const embeddingChunks: EmbeddingChunk[] = chunks.map((chunk, index) => ({
      id: uuidv4(),
      courseId,
      fileId,
      content: chunk,
      metadata: {
        fileName,
        fileType,
        chunkIndex: index,
        totalChunks: chunks.length,
      },
    }));

    await this.storeEmbeddings(embeddingChunks);
    return embeddingChunks.map(c => c.id);
  }
}

export const embeddingService = new EmbeddingService();