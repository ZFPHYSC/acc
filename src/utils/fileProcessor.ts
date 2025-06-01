import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import pdfParse from 'pdf-parse';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export class FileProcessor {
  private readonly CHUNK_SIZE = 1000;
  private readonly CHUNK_OVERLAP = 200;
  private readonly MIN_CONTENT_LENGTH = 100;

  async processFile(filePath: string): Promise<{
    content: string;
    metadata: Record<string, any>;
    needsMultimodal: boolean;
  }> {
    const ext = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    
    let content = '';
    let metadata: Record<string, any> = {
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
          content = await fs.readFile(filePath, 'utf-8');
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
          const jsonContent = await fs.readFile(filePath, 'utf-8');
          content = JSON.stringify(JSON.parse(jsonContent), null, 2);
          break;
        default:
          // Try to read as text
          try {
            content = await fs.readFile(filePath, 'utf-8');
          } catch {
            needsMultimodal = true;
          }
      }

      // Check if content is too short or empty
      if (content.length < this.MIN_CONTENT_LENGTH) {
        needsMultimodal = true;
      }

      // Extract additional metadata
      const stats = await fs.stat(filePath);
      metadata = {
        ...metadata,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        contentLength: content.length,
      };

    } catch (error) {
      console.error(`Error processing file ${fileName}:`, error);
      needsMultimodal = true;
    }

    return { content, metadata, needsMultimodal };
  }

  private async processPDF(filePath: string): Promise<string> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF processing failed:', error);
      return '';
    }
  }

  private async processDocument(filePath: string): Promise<string> {
    try {
      // Use pandoc if available
      const { stdout } = await execAsync(`pandoc "${filePath}" -t plain`);
      return stdout;
    } catch (error) {
      console.error('Document processing failed:', error);
      return '';
    }
  }

  chunkText(text: string, metadata: Record<string, any> = {}): Array<{
    content: string;
    metadata: Record<string, any>;
  }> {
    const chunks: Array<{ content: string; metadata: Record<string, any> }> = [];
    
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
        
        const breakPoint = Math.max(
          lastPeriod > startIndex + this.CHUNK_SIZE / 2 ? lastPeriod : -1,
          lastNewline > startIndex + this.CHUNK_SIZE / 2 ? lastNewline : -1,
          lastSpace > startIndex + this.CHUNK_SIZE / 2 ? lastSpace : -1
        );
        
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

  async extractTextFromImage(imagePath: string): Promise<string> {
    // This is a placeholder - in production, you'd use OCR
    // For now, return empty string and let multimodal handle it
    return '';
  }

  async generateThumbnail(filePath: string, outputPath: string): Promise<void> {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
      await sharp(filePath)
        .resize(200, 200, { fit: 'inside' })
        .toFile(outputPath);
    }
  }

  async getFileHash(filePath: string): Promise<string> {
    const crypto = require('crypto');
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  }
}

export const fileProcessor = new FileProcessor();