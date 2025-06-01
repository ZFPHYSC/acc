"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileService = exports.FileService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const axios_1 = __importDefault(require("axios"));
const embedding_service_1 = require("./embedding.service");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class FileService {
    constructor() {
        this.supportedTypes = {
            pdf: ['pdf'],
            text: ['txt', 'md', 'csv', 'json'],
            code: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css'],
            document: ['docx', 'doc', 'odt'],
        };
    }
    async processFile(filePath, courseId, fileId) {
        try {
            const ext = path_1.default.extname(filePath).toLowerCase().slice(1);
            const fileName = path_1.default.basename(filePath);
            let content = '';
            // Try to extract text based on file type
            if (this.supportedTypes.pdf.includes(ext)) {
                content = await this.extractPdfText(filePath);
            }
            else if (this.supportedTypes.text.includes(ext) ||
                this.supportedTypes.code.includes(ext)) {
                content = await promises_1.default.readFile(filePath, 'utf-8');
            }
            else if (this.supportedTypes.document.includes(ext)) {
                content = await this.extractDocumentText(filePath);
            }
            else {
                // Unsupported file type - use multimodal approach
                content = await this.processWithMultimodal(filePath);
            }
            // If content extraction failed or is too short, use multimodal
            if (!content || content.length < 100) {
                content = await this.processWithMultimodal(filePath);
            }
            // Create embeddings
            const embeddingIds = await embedding_service_1.embeddingService.processFileForEmbedding(courseId, fileId, fileName, ext, content);
            return { content, embeddingIds };
        }
        catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    }
    async extractPdfText(filePath) {
        try {
            // Try pdfplumber first (Python script)
            const { stdout } = await execAsync(`python3 -c "
import pdfplumber
with pdfplumber.open('${filePath}') as pdf:
    text = ''
    for page in pdf.pages:
        text += page.extract_text() + '\\n'
    print(text)
"`);
            return stdout;
        }
        catch (error) {
            console.log('pdfplumber failed, falling back to multimodal');
            return '';
        }
    }
    async extractDocumentText(filePath) {
        try {
            // Use pandoc for document conversion
            const { stdout } = await execAsync(`pandoc "${filePath}" -t plain`);
            return stdout;
        }
        catch (error) {
            console.log('Document extraction failed');
            return '';
        }
    }
    async processWithMultimodal(filePath) {
        try {
            // Convert file to base64
            const fileBuffer = await promises_1.default.readFile(filePath);
            const base64 = fileBuffer.toString('base64');
            // Send to Gemini multimodal
            const response = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: 'google/gemini-2.0-flash-thinking-exp',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: 'Extract all text content from this document. Include all information, formatting, tables, and any visible text. If this is an image, describe it in detail.'
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:application/octet-stream;base64,${base64}`
                                }
                            }
                        ]
                    }
                ],
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data.choices[0].message.content;
        }
        catch (error) {
            console.error('Multimodal processing failed:', error);
            throw error;
        }
    }
    async deleteFile(filePath) {
        try {
            await promises_1.default.unlink(filePath);
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    async getFileMetadata(filePath) {
        const stats = await promises_1.default.stat(filePath);
        return {
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: path_1.default.extname(filePath).slice(1),
        };
    }
}
exports.FileService = FileService;
exports.fileService = new FileService();
//# sourceMappingURL=file.service.js.map