"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileProcessor = exports.FileProcessor = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const sharp_1 = __importDefault(require("sharp"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class FileProcessor {
    constructor() {
        this.CHUNK_SIZE = 1000;
        this.CHUNK_OVERLAP = 200;
        this.MIN_CONTENT_LENGTH = 100;
    }
    async processFile(filePath) {
        const ext = path_1.default.extname(filePath).toLowerCase();
        const fileName = path_1.default.basename(filePath);
        let content = '';
        let metadata = {
            fileName,
            fileType: ext.slice(1),
            processedAt: new Date(),
        };
        let needsMultimodal = false;
        try {
            switch (ext) {
                case '.pdf':
                    content = await this.processPDF(filePath);
                    break;
                case '.txt':
                case '.md':
                case '.csv':
                    content = await promises_1.default.readFile(filePath, 'utf-8');
                    break;
                case '.docx':
                case '.doc':
                    content = await this.processDocument(filePath);
                    break;
                case '.jpg':
                case '.jpeg':
                case '.png':
                case '.gif':
                    needsMultimodal = true;
                    metadata.isImage = true;
                    break;
                case '.json':
                    const jsonContent = await promises_1.default.readFile(filePath, 'utf-8');
                    content = JSON.stringify(JSON.parse(jsonContent), null, 2);
                    break;
                default:
                    // Try to read as text
                    try {
                        content = await promises_1.default.readFile(filePath, 'utf-8');
                    }
                    catch {
                        needsMultimodal = true;
                    }
            }
            // Check if content is too short or empty
            if (content.length < this.MIN_CONTENT_LENGTH) {
                needsMultimodal = true;
            }
            // Extract additional metadata
            const stats = await promises_1.default.stat(filePath);
            metadata = {
                ...metadata,
                size: stats.size,
                created: stats.birthtime,
                modified: stats.mtime,
                contentLength: content.length,
            };
        }
        catch (error) {
            console.error(`Error processing file ${fileName}:`, error);
            needsMultimodal = true;
        }
        return { content, metadata, needsMultimodal };
    }
    async processPDF(filePath) {
        try {
            const dataBuffer = await promises_1.default.readFile(filePath);
            const data = await (0, pdf_parse_1.default)(dataBuffer);
            return data.text;
        }
        catch (error) {
            console.error('PDF processing failed:', error);
            return '';
        }
    }
    async processDocument(filePath) {
        try {
            // Use pandoc if available
            const { stdout } = await execAsync(`pandoc "${filePath}" -t plain`);
            return stdout;
        }
        catch (error) {
            console.error('Document processing failed:', error);
            return '';
        }
    }
    chunkText(text, metadata = {}) {
        const chunks = [];
        if (!text || text.length === 0) {
            return chunks;
        }
        let startIndex = 0;
        let chunkIndex = 0;
        while (startIndex < text.length) {
            let endIndex = startIndex + this.CHUNK_SIZE;
            // Find natural break points
            if (endIndex < text.length) {
                const lastPeriod = text.lastIndexOf('.', endIndex);
                const lastNewline = text.lastIndexOf('\n', endIndex);
                const lastSpace = text.lastIndexOf(' ', endIndex);
                const breakPoint = Math.max(lastPeriod > startIndex + this.CHUNK_SIZE / 2 ? lastPeriod : -1, lastNewline > startIndex + this.CHUNK_SIZE / 2 ? lastNewline : -1, lastSpace > startIndex + this.CHUNK_SIZE / 2 ? lastSpace : -1);
                if (breakPoint > startIndex) {
                    endIndex = breakPoint + 1;
                }
            }
            const chunkContent = text.slice(startIndex, endIndex).trim();
            if (chunkContent.length > 0) {
                chunks.push({
                    content: chunkContent,
                    metadata: {
                        ...metadata,
                        chunkIndex,
                        startChar: startIndex,
                        endChar: endIndex,
                        chunkSize: chunkContent.length,
                    },
                });
                chunkIndex++;
            }
            startIndex = endIndex - this.CHUNK_OVERLAP;
        }
        return chunks;
    }
    async extractTextFromImage(imagePath) {
        // This is a placeholder - in production, you'd use OCR
        // For now, return empty string and let multimodal handle it
        return '';
    }
    async generateThumbnail(filePath, outputPath) {
        const ext = path_1.default.extname(filePath).toLowerCase();
        if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
            await (0, sharp_1.default)(filePath)
                .resize(200, 200, { fit: 'inside' })
                .toFile(outputPath);
        }
    }
    async getFileHash(filePath) {
        const crypto = require('crypto');
        const fileBuffer = await promises_1.default.readFile(filePath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        return hashSum.digest('hex');
    }
}
exports.FileProcessor = FileProcessor;
exports.fileProcessor = new FileProcessor();
//# sourceMappingURL=fileProcessor.js.map