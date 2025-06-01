export interface CourseModel {
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
  metadata?: {
    tags?: string[];
    category?: string;
    semester?: string;
    instructor?: string;
    syllabus?: string;
  };
}

export class Course implements CourseModel {
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
  metadata?: {
    tags?: string[];
    category?: string;
    semester?: string;
    instructor?: string;
    syllabus?: string;
  };

  constructor(data: Partial<CourseModel>) {
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

  updateFileCount(count: number): void {
    this.fileCount = count;
    this.updatedAt = new Date();
  }

  updateEmbeddingCount(count: number): void {
    this.embeddingCount = count;
    this.updatedAt = new Date();
  }

  recordAccess(): void {
    this.lastAccessed = new Date();
  }

  toJSON(): CourseModel {
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

  static fromJSON(data: any): Course {
    return new Course({
      ...data,
      createdAt: new Date(data.createdAt),
      updatedAt: new Date(data.updatedAt),
      lastAccessed: new Date(data.lastAccessed),
    });
  }
}