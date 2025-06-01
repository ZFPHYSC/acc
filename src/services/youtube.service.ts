import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';
import { embeddingService } from './embedding.service';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

export class YouTubeService {
  async processYouTubeLink(
    url: string,
    courseId: string
  ): Promise<{ transcript: string; embeddingIds: string[]; metadata: any }> {
    try {
      // Extract video ID
      const videoId = this.extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Get video metadata
      const metadata = await this.getVideoMetadata(videoId);

      // Try to get transcript
      let transcript = await this.getTranscript(videoId);
      
      // If no transcript available, use Whisper
      if (!transcript) {
        transcript = await this.transcribeWithWhisper(videoId);
      }

      // Create embeddings
      const fileId = uuidv4();
      const embeddingIds = await embeddingService.processFileForEmbedding(
        courseId,
        fileId,
        metadata.title,
        'youtube',
        transcript
      );

      return {
        transcript,
        embeddingIds,
        metadata: {
          ...metadata,
          url,
          videoId,
        },
      };
    } catch (error) {
      console.error('Error processing YouTube link:', error);
      throw error;
    }
  }

  private extractVideoId(url: string): string | null {
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

  private async getVideoMetadata(videoId: string): Promise<any> {
    try {
      // Use youtube-dl to get metadata
      const { stdout } = await execAsync(
        `youtube-dl --dump-json https://www.youtube.com/watch?v=${videoId}`
      );
      
      const metadata = JSON.parse(stdout);
      return {
        title: metadata.title,
        duration: metadata.duration,
        description: metadata.description,
        channel: metadata.uploader,
        uploadDate: metadata.upload_date,
      };
    } catch (error) {
      console.error('Error getting video metadata:', error);
      return {
        title: `YouTube Video ${videoId}`,
        duration: 0,
      };
    }
  }

  private async getTranscript(videoId: string): Promise<string | null> {
    try {
      // Try to get auto-generated captions
      const { stdout } = await execAsync(
        `youtube-dl --write-auto-sub --skip-download --sub-format vtt --output "%(id)s" https://www.youtube.com/watch?v=${videoId}`
      );

      // Read the VTT file
      const vttPath = `${videoId}.en.vtt`;
      const { stdout: vttContent } = await execAsync(`cat ${vttPath}`);
      
      // Clean up
      await execAsync(`rm ${vttPath}`);

      // Parse VTT to plain text
      return this.parseVTT(vttContent);
    } catch (error) {
      console.log('No transcript available, will use Whisper');
      return null;
    }
  }

  private parseVTT(vttContent: string): string {
    // Remove timestamps and formatting
    const lines = vttContent.split('\n');
    const textLines = lines.filter(line => 
      !line.includes('-->') && 
      !line.match(/^\d{2}:/) &&
      line.trim() !== '' &&
      line !== 'WEBVTT'
    );
    
    return textLines.join(' ').replace(/<[^>]*>/g, '');
  }

  private async transcribeWithWhisper(videoId: string): Promise<string> {
    try {
      // Download audio using youtube-dl
      const audioPath = `${videoId}.mp3`;
      await execAsync(
        `youtube-dl -x --audio-format mp3 -o "${audioPath}" https://www.youtube.com/watch?v=${videoId}`
      );

      // Send to Whisper API
      const formData = new FormData();
      const audioFile = await fs.readFile(audioPath);
      formData.append('file', new Blob([audioFile]), 'audio.mp3');
      formData.append('model', 'whisper-1');

      const response = await axios.post(
        'https://api.openai.com/v1/audio/transcriptions',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      // Clean up
      await execAsync(`rm ${audioPath}`);

      return response.data.text;
    } catch (error) {
      console.error('Error transcribing with Whisper:', error);
      throw error;
    }
  }
}

export const youtubeService = new YouTubeService();