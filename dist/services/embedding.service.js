"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embeddingService = exports.EmbeddingService = void 0;
const openai_1 = require("openai");
const chromadb_1 = require("chromadb");
const uuid_1 = require("uuid");
const openai = new openai_1.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const chroma = new chromadb_1.ChromaClient({
    path: process.env.CHROMA_URL || 'http://localhost:8000',
});
class EmbeddingService {
    async initialize() {
        try {
            this.collection = await chroma.getOrCreateCollection({
                name: 'course_embeddings',
                metadata: { 'hnsw:space': 'cosine' },
            });
        }
        catch (error) {
            console.error('Failed to initialize ChromaDB:', error);
        }
    }
    async createEmbedding(text) {
        try {
            const response = await openai.embeddings.create({
                model: 'text-embedding-ada-002',
                input: text,
            });
            return response.data[0].embedding;
        }
        catch (error) {
            console.error('Failed to create embedding:', error);
            throw error;
        }
    }
    async storeEmbeddings(chunks) {
        if (!this.collection)
            await this.initialize();
        const embeddings = await Promise.all(chunks.map(chunk => this.createEmbedding(chunk.content)));
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
    async searchSimilar(courseId, query, limit = 5) {
        if (!this.collection)
            await this.initialize();
        const queryEmbedding = await this.createEmbedding(query);
        const results = await this.collection.query({
            queryEmbeddings: [queryEmbedding],
            nResults: limit,
            where: { courseId },
        });
        return results;
    }
    async deleteCoursEmbeddings(courseId) {
        if (!this.collection)
            await this.initialize();
        const allDocs = await this.collection.get({
            where: { courseId },
        });
        if (allDocs.ids.length > 0) {
            await this.collection.delete({
                ids: allDocs.ids,
            });
        }
    }
    chunkText(text, maxChunkSize = 1000, overlap = 200) {
        const chunks = [];
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
    async processFileForEmbedding(courseId, fileId, fileName, fileType, content) {
        const chunks = this.chunkText(content);
        const embeddingChunks = chunks.map((chunk, index) => ({
            id: (0, uuid_1.v4)(),
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
exports.EmbeddingService = EmbeddingService;
exports.embeddingService = new EmbeddingService();
//# sourceMappingURL=embedding.service.js.map