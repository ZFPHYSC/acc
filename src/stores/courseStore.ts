import { create } from 'zustand';
import { Course } from '../types';

interface CourseStore {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  addCourse: (course: Course) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  deleteCourse: (id: string) => void;
}

export const useCourseStore = create<CourseStore>((set) => ({
  courses: [
    // Sample courses for development
    {
      id: '1',
      name: 'Computer Science 101',
      description: 'Introduction to programming and computational thinking',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-03-20'),
      fileCount: 24,
      embeddingCount: 156,
      lastAccessed: new Date('2024-03-20'),
      color: 'blue',
      icon: '💻',
    },
    {
      id: '2',
      name: 'Machine Learning',
      description: 'Deep learning, neural networks, and AI fundamentals',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-03-18'),
      fileCount: 18,
      embeddingCount: 203,
      lastAccessed: new Date('2024-03-18'),
      color: 'purple',
      icon: '🤖',
    },
    {
      id: '3',
      name: 'Tax Documents 2024',
      description: 'Personal tax forms and financial documents',
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-03-15'),
      fileCount: 8,
      embeddingCount: 45,
      lastAccessed: new Date('2024-03-15'),
      color: 'green',
      icon: '📊',
    },
  ],
  
  setCourses: (courses) => set({ courses }),
  
  addCourse: (course) => set((state) => ({
    courses: [...state.courses, course],
  })),
  
  updateCourse: (id, updates) => set((state) => ({
    courses: state.courses.map((course) =>
      course.id === id ? { ...course, ...updates } : course
    ),
  })),
  
  deleteCourse: (id) => set((state) => ({
    courses: state.courses.filter((course) => course.id !== id),
  })),
}));