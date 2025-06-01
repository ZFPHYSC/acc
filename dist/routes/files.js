"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const index_1 = require("../index");
const file_service_1 = require("../services/file.service");
const youtube_service_1 = require("../services/youtube.service");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// In-memory storage for development
let files = [];
// Get files for a course
router.get('/:courseId', (req, res) => {
    const courseFiles = files.filter(f => f.courseId === req.params.courseId);
    res.json(courseFiles);
});
// Upload file
router.post('/upload', index_1.upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const { courseId } = req.body;
        if (!courseId) {
            return res.status(400).json({ error: 'Course ID required' });
        }
        const fileId = (0, uuid_1.v4)();
        const filePath = req.file.path;
        // Process file and create embeddings
        const { content, embeddingIds } = await file_service_1.fileService.processFile(filePath, courseId, fileId);
        const newFile = {
            id: fileId,
            courseId,
            name: req.file.originalname,
            type: req.file.originalname.split('.').pop()?.toLowerCase() || 'unknown',
            size: req.file.size,
            uploadedAt: new Date(),
            processed: true,
            embeddingIds,
            metadata: {
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                path: filePath,
            },
        };
        files.push(newFile);
        res.json(newFile);
    }
    catch (error) {
        console.error('File upload error:', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
});
// Process YouTube link
router.post('/youtube', async (req, res) => {
    try {
        const { courseId, url } = req.body;
        if (!courseId || !url) {
            return res.status(400).json({ error: 'Course ID and URL required' });
        }
        const result = await youtube_service_1.youtubeService.processYouTubeLink(url, courseId);
        const newFile = {
            id: (0, uuid_1.v4)(),
            courseId,
            name: result.metadata.title,
            type: 'youtube',
            size: result.transcript.length,
            uploadedAt: new Date(),
            processed: true,
            embeddingIds: result.embeddingIds,
            metadata: result.metadata,
        };
        files.push(newFile);
        res.json(newFile);
    }
    catch (error) {
        console.error('YouTube processing error:', error);
        res.status(500).json({ error: 'Failed to process YouTube link' });
    }
});
// Delete file
router.delete('/:fileId', async (req, res) => {
    const index = files.findIndex(f => f.id === req.params.fileId);
    if (index === -1) {
        return res.status(404).json({ error: 'File not found' });
    }
    const file = files[index];
    // Delete physical file if exists
    if (file.metadata?.path) {
        await file_service_1.fileService.deleteFile(file.metadata.path);
    }
    // In production, also delete embeddings
    files.splice(index, 1);
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=files.js.map