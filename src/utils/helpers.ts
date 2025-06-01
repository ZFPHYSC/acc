import { clsx, type ClassValue } from 'clsx';

// Utility function for combining class names
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format file size to human readable
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

// Check if file type is supported for text extraction
export function isTextExtractable(fileType: string): boolean {
  const extractableTypes = ['pdf', 'txt', 'md', 'csv', 'json', 'doc', 'docx'];
  return extractableTypes.includes(fileType.toLowerCase());
}

// Generate random color from predefined set
export function getRandomCourseColor(): string {
  const colors = ['blue', 'purple', 'green', 'red', 'yellow', 'pink', 'indigo'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Generate random icon from predefined set
export function getRandomCourseIcon(): string {
  const icons = ['📚', '💻', '🔬', '🎨', '📊', '🌍', '🏛️', '💡', '🚀', '🧮'];
  return icons[Math.floor(Math.random() * icons.length)];
}

// Format date relative to now
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMins = Math.floor(diffInMs / 60000);
  
  if (diffInMins < 1) return 'just now';
  if (diffInMins < 60) return `${diffInMins} min${diffInMins > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMins / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Extract YouTube video ID from URL
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// Check if URL is a YouTube link
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeId(url) !== null;
}

// Group files by type
export function groupFilesByType(files: any[]): Record<string, any[]> {
  return files.reduce((acc, file) => {
    const category = getFileCategory(file.type);
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(file);
    return acc;
  }, {});
}

// Get file category based on type
export function getFileCategory(fileType: string): string {
  const categories: Record<string, string[]> = {
    Documents: ['pdf', 'doc', 'docx', 'txt', 'md'],
    Videos: ['youtube', 'mp4', 'avi', 'mov'],
    Images: ['jpg', 'jpeg', 'png', 'gif', 'svg'],
    Code: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css'],
    Data: ['csv', 'json', 'xml', 'xlsx'],
  };

  for (const [category, types] of Object.entries(categories)) {
    if (types.includes(fileType.toLowerCase())) {
      return category;
    }
  }

  return 'Other';
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}