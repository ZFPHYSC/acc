// Local storage service for frontend
class StorageService {
  private prefix = 'course_ai_';

  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }

  clear(): void {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(this.prefix))
        .forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  // Session storage methods
  setSessionItem(key: string, value: any): void {
    try {
      sessionStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }

  getSessionItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return null;
    }
  }

  // Specific storage methods
  saveUserPreferences(preferences: any): void {
    this.setItem('user_preferences', preferences);
  }

  getUserPreferences(): any {
    return this.getItem('user_preferences') || {
      theme: 'dark',
      webSearchDefault: false,
      showD2LNotice: true,
    };
  }

  saveChatHistory(courseId: string, messages: any[]): void {
    this.setItem(`chat_history_${courseId}`, messages);
  }

  getChatHistory(courseId: string): any[] {
    return this.getItem(`chat_history_${courseId}`) || [];
  }

  saveRecentCourses(courseIds: string[]): void {
    this.setItem('recent_courses', courseIds.slice(0, 5));
  }

  getRecentCourses(): string[] {
    return this.getItem('recent_courses') || [];
  }
}

export const storage = new StorageService();