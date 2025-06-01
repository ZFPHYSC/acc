import { Router } from 'express';
import { aiService } from '../services/ai.service';
import { QueryRequest } from '..';

const router = Router();

// Send a chat message
router.post('/send', async (req, res) => {
  try {
    const queryRequest: QueryRequest = req.body;
    
    if (!queryRequest.courseId || !queryRequest.query) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await aiService.processQuery(queryRequest);
    res.json(response);
  } catch (error) {
    console.error('Error processing chat message:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Get chat history for a course
router.get('/history/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    // In production, implement proper chat history storage
    res.json({ messages: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get chat history' });
  }
});

export default router;