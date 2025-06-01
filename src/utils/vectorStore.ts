import { ChromaClient, Collection } from 'chromadb';
import { OpenAIEmbeddings } from '@langchain/openai';

class VectorStore {
  private client: ChromaClient;
  private collection: Collection | null = null;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    this.client = new ChromaClient({
      path: process.env.CHROMA_URL || 'http://localhost:8000',
    });
    
    this.embeddings = new OpenAIEmbeddings({
      modelName: 'text-embedding-ada-002',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async initialize() {
    try {
      this.collection = await this.client.getOrCreateCollection({
        name: 'course_embeddings',
        metadata: { 'hnsw:space': 'cosine' },
      });
      console.log('Vector store initialized successfully');
    } catch (error) {
      console.error('Failed to initialize vector store:', error);
      throw error;
    }
  }

  async addDocuments(
    documents: string[],
    metadatas: Record<string, any>[],
    ids: string[]
  ): Promise<void> {
    if (!this.collection) await this.initialize();

    const embeddings = await Promise.all(
      documents.map(doc => this.embeddings.embedQuery(doc))
    );

    await this.collection!.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });
  }

  async similaritySearch(
    query: string,
    filter: Record<string, any>,
    limit: number = 5
  ): Promise<any> {
    if (!this.collection) await this.initialize();

    const queryEmbedding = await this.embeddings.embedQuery(query);

    const results = await this.collection!.query({
      queryEmbeddings: [queryEmbedding],
      nResults: limit,
      where: filter,
    });

    return results;
  }

  async deleteByMetadata(filter: Record<string, any>): Promise<void> {
    if (!this.collection) await this.initialize();

    const results = await this.collection!.get({
      where: filter,
    });

    if (results.ids.length > 0) {
      await this.collection!.delete({
        ids: results.ids,
      });
    }
  }

  async getCollection(): Promise<Collection> {
    if (!this.collection) await this.initialize();
    return this.collection!;
  }

  async reset(): Promise<void> {
    try {
      await this.client.deleteCollection({ name: 'course_embeddings' });
      this.collection = null;
      await this.initialize();
    } catch (error) {
      console.error('Error resetting vector store:', error);
    }
  }
}

export const vectorStore = new VectorStore();