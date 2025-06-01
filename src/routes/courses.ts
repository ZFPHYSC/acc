import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Course } from '../types';

const router = Router();

// In-memory storage for development
let courses: Course[] = [
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
];

// Get all courses
router.get('/', (req, res) => {
  res.json(courses);
});

// Get single course
router.get('/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  res.json(course);
});

// Create course
router.post('/', (req, res) => {
  const newCourse: Course = {
    id: uuidv4(),
    name: req.body.name,
    description: req.body.description || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    fileCount: 0,
    embeddingCount: 0,
    lastAccessed: new Date(),
    color: req.body.color || 'blue',
    icon: req.body.icon || '📚',
  };
  
  courses.push(newCourse);
  res.status(201).json(newCourse);
});

// Update course
router.put('/:id', (req, res) => {
  const index = courses.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  courses[index] = {
    ...courses[index],
    ...req.body,
    updatedAt: new Date(),
  };
  
  res.json(courses[index]);
});

// Delete course
router.delete('/:id', async (req, res) => {
  const index = courses.findIndex(c => c.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Course not found' });
  }
  
  // In production, also delete associated files and embeddings
  courses.splice(index, 1);
  res.status(204).send();
});

export default router;