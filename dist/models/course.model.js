"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Course = void 0;
class Course {
    constructor(data) {
        this.id = data.id || '';
        this.name = data.name || 'Untitled Course';
        this.description = data.description || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
        this.fileCount = data.fileCount || 0;
        this.embeddingCount = data.embeddingCount || 0;
        this.lastAccessed = data.lastAccessed || new Date();
        this.color = data.color || 'blue';
        this.icon = data.icon || '📚';
        this.metadata = data.metadata || {};
    }
    updateFileCount(count) {
        this.fileCount = count;
        this.updatedAt = new Date();
    }
    updateEmbeddingCount(count) {
        this.embeddingCount = count;
        this.updatedAt = new Date();
    }
    recordAccess() {
        this.lastAccessed = new Date();
    }
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            fileCount: this.fileCount,
            embeddingCount: this.embeddingCount,
            lastAccessed: this.lastAccessed,
            color: this.color,
            icon: this.icon,
            metadata: this.metadata,
        };
    }
    static fromJSON(data) {
        return new Course({
            ...data,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
            lastAccessed: new Date(data.lastAccessed),
        });
    }
}
exports.Course = Course;
//# sourceMappingURL=course.model.js.map