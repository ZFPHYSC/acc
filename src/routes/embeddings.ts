import { Router } from 'express';
import { embeddingService } from '../services/embedding.service';

const router = Router();

// Search embeddings
router.post('/search', async (req, res) => {
  try {
    const { courseId, query, limit = 5 } = req.body;
    
    if (!courseId || !query) {
      return res.status(400).json({ error: 'Course ID and query required' });
    }

    const results = await embeddingService.searchSimilar(courseId, query, limit);
    res.json(results);
  } catch (error) {
    console.error('Embedding search error:', error);
    res.status(500).json({ error: 'Failed to search embeddings' });
  }
});

// Get embedding stats for a course
router.get('/stats/:courseId', async (req, res) => {
  try {
    // In production, implement proper stats retrieval
    res.json({
      totalEmbeddings: 0,
      totalChunks: 0,
      averageChunkSize: 0,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get embedding stats' });
  }
});

export default router;