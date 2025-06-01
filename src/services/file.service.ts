import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import axios from 'axios';
import { embeddingService } from './embedding.service';

const execAsync = promisify(exec);

export class FileService {
  private supportedTypes = {
    pdf: ['pdf'],
    text: ['txt', 'md', 'csv', 'json'],
    code: ['js', 'ts', 'py', 'java', 'cpp', 'c', 'html', 'css'],
    document: ['docx', 'doc', 'odt'],
  };

  async processFile(
    filePath: string,
    courseId: string,
    fileId: string
  ): Promise<{ content: string; embeddingIds: string[] }> {
    try {
      const ext = path.extname(filePath).toLowerCase().slice(1);
      const fileName = path.basename(filePath);
      
      let content = '';

      // Try to extract text based on file type
      if (this.supportedTypes.pdf.includes(ext)) {
        content = await this.extractPdfText(filePath);
      } else if (
        this.supportedTypes.text.includes(ext) || 
        this.supportedTypes.code.includes(ext)
      ) {
        content = await fs.readFile(filePath, 'utf-8');
      } else if (this.supportedTypes.document.includes(ext)) {
        content = await this.extractDocumentText(filePath);
      } else {
        // Unsupported file type - use multimodal approach
        content = await this.processWithMultimodal(filePath);
      }

      // If content extraction failed or is too short, use multimodal
      if (!content || content.length < 100) {
        content = await this.processWithMultimodal(filePath);
      }

      // Create embeddings
      const embeddingIds = await embeddingService.processFileForEmbedding(
        courseId,
        fileId,
        fileName,
        ext,
        content
      );

      return { content, embeddingIds };
    } catch (error) {
      console.error('Error processing file:', error);
      throw error;
    }
  }

  private async extractPdfText(filePath: string): Promise<string> {
    try {
      // Try pdfplumber first (Python script)
      const { stdout } = await execAsync(
        `python3 -c "
import pdfplumber
with pdfplumber.open('${filePath}') as pdf:
    text = ''
    for page in pdf.pages:
        text += page.extract_text() + '\\n'
    print(text)
"`
      );
      return stdout;
    } catch (error) {
      console.log('pdfplumber failed, falling back to multimodal');
      return '';
    }
  }

  private async extractDocumentText(filePath: string): Promise<string> {
    try {
      // Use pandoc for document conversion
      const { stdout } = await execAsync(
        `pandoc "${filePath}" -t plain`
      );
      return stdout;
    } catch (error) {
      console.log('Document extraction failed');
      return '';
    }
  }

  private async processWithMultimodal(filePath: string): Promise<string> {
    try {
      // Convert file to base64
      const fileBuffer = await fs.readFile(filePath);
      const base64 = fileBuffer.toString('base64');
      
      // Send to Gemini multimodal
      const response = await axios.post(
        'https://openrouter.ai/api/v1/chat/completions',
        {
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
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Multimodal processing failed:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  async getFileMetadata(filePath: string): Promise<any> {
    const stats = await fs.stat(filePath);
    return {
      size: stats.size,
      created: stats.birthtime,
      modified: stats.mtime,
      type: path.extname(filePath).slice(1),
    };
  }
}

export const fileService = new FileService();