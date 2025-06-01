"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const embedding_service_1 = require("../services/embedding.service");
const router = (0, express_1.Router)();
// Search embeddings
router.post('/search', async (req, res) => {
    try {
        const { courseId, query, limit = 5 } = req.body;
        if (!courseId || !query) {
            return res.status(400).json({ error: 'Course ID and query required' });
        }
        const results = await embedding_service_1.embeddingService.searchSimilar(courseId, query, limit);
        res.json(results);
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to get embedding stats' });
    }
});
exports.default = router;
//# sourceMappingURL=embeddings.js.map