"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Embedding = void 0;
class Embedding {
    constructor(data) {
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
    setEmbedding(embedding) {
        this.embedding = embedding;
    }
    getContentPreview(maxLength = 100) {
        if (this.content.length <= maxLength) {
            return this.content;
        }
        return this.content.substring(0, maxLength) + '...';
    }
    toJSON() {
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
    static fromJSON(data) {
        return new Embedding({
            ...data,
            createdAt: new Date(data.createdAt),
        });
    }
    // Helper method to check if this chunk is the start of a document
    isDocumentStart() {
        return this.metadata.chunkIndex === 0;
    }
    // Helper method to check if this chunk is the end of a document
    isDocumentEnd() {
        return this.metadata.chunkIndex === this.metadata.totalChunks - 1;
    }
    // Get context window around this chunk
    getContextWindow() {
        return {
            start: this.metadata.startChar || 0,
            end: this.metadata.endChar || this.content.length,
        };
    }
}
exports.Embedding = Embedding;
//# sourceMappingURL=embedding.model.js.map