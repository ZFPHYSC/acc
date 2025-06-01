import axios from 'axios';
import { Course, FileItem, ChatMessage, QueryRequest } from '../types';

const API_BASE = '/api';

// Helper to convert date strings to Date objects in course data
const convertCourseDates = (course: any): Course => {
  return {
    ...course,
    createdAt: new Date(course.createdAt),
    updatedAt: new Date(course.updatedAt),
    lastAccessed: new Date(course.lastAccessed),
  };
};

const api = {
  // Courses
  getCourses: async (): Promise<Course[]> => {
    const { data } = await axios.get(`${API_BASE}/courses`);
    return data.map(convertCourseDates);
  },

  createCourse: async (course: Partial<Course>): Promise<Course> => {
    const { data } = await axios.post(`${API_BASE}/courses`, course);
    return convertCourseDates(data);
  },

  updateCourse: async (id: string, updates: Partial<Course>): Promise<Course> => {
    const { data } = await axios.put(`${API_BASE}/courses/${id}`, updates);
    return convertCourseDates(data);
  },

  deleteCourse: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE}/courses/${id}`);
  },

  // Files
  getFiles: async (courseId: string): Promise<FileItem[]> => {
    const { data } = await axios.get(`${API_BASE}/files/${courseId}`);
    return data;
  },

  uploadFile: async (courseId: string, file: File): Promise<FileItem> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);

    const { data } = await axios.post(`${API_BASE}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteFile: async (fileId: string): Promise<void> => {
    await axios.delete(`${API_BASE}/files/${fileId}`);
  },

  // YouTube
  processYouTubeLink: async (courseId: string, url: string): Promise<FileItem> => {
    const { data } = await axios.post(`${API_BASE}/files/youtube`, {
      courseId,
      url,
    });
    return data;
  },

  // Chat
  sendChatMessage: async (request: QueryRequest): Promise<ChatMessage> => {
    const { data } = await axios.post(`${API_BASE}/chat/send`, request);
    return data;
  },

  getChatHistory: async (courseId: string): Promise<{ messages: ChatMessage[] }> => {
    const { data } = await axios.get(`${API_BASE}/chat/history/${courseId}`);
    return data;
  },

  // Embeddings
  searchEmbeddings: async (courseId: string, query: string, limit?: number) => {
    const { data } = await axios.post(`${API_BASE}/embeddings/search`, {
      courseId,
      query,
      limit,
    });
    return data;
  },
};

export default api;