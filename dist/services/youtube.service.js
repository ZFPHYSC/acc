"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.youtubeService = exports.YouTubeService = void 0;
const axios_1 = __importDefault(require("axios"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const embedding_service_1 = require("./embedding.service");
const uuid_1 = require("uuid");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class YouTubeService {
    async processYouTubeLink(url, courseId) {
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
            const fileId = (0, uuid_1.v4)();
            const embeddingIds = await embedding_service_1.embeddingService.processFileForEmbedding(courseId, fileId, metadata.title, 'youtube', transcript);
            return {
                transcript,
                embeddingIds,
                metadata: {
                    ...metadata,
                    url,
                    videoId,
                },
            };
        }
        catch (error) {
            console.error('Error processing YouTube link:', error);
            throw error;
        }
    }
    extractVideoId(url) {
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
    async getVideoMetadata(videoId) {
        try {
            // Use youtube-dl to get metadata
            const { stdout } = await execAsync(`youtube-dl --dump-json https://www.youtube.com/watch?v=${videoId}`);
            const metadata = JSON.parse(stdout);
            return {
                title: metadata.title,
                duration: metadata.duration,
                description: metadata.description,
                channel: metadata.uploader,
                uploadDate: metadata.upload_date,
            };
        }
        catch (error) {
            console.error('Error getting video metadata:', error);
            return {
                title: `YouTube Video ${videoId}`,
                duration: 0,
            };
        }
    }
    async getTranscript(videoId) {
        try {
            // Try to get auto-generated captions
            const { stdout } = await execAsync(`youtube-dl --write-auto-sub --skip-download --sub-format vtt --output "%(id)s" https://www.youtube.com/watch?v=${videoId}`);
            // Read the VTT file
            const vttPath = `${videoId}.en.vtt`;
            const { stdout: vttContent } = await execAsync(`cat ${vttPath}`);
            // Clean up
            await execAsync(`rm ${vttPath}`);
            // Parse VTT to plain text
            return this.parseVTT(vttContent);
        }
        catch (error) {
            console.log('No transcript available, will use Whisper');
            return null;
        }
    }
    parseVTT(vttContent) {
        // Remove timestamps and formatting
        const lines = vttContent.split('\n');
        const textLines = lines.filter(line => !line.includes('-->') &&
            !line.match(/^\d{2}:/) &&
            line.trim() !== '' &&
            line !== 'WEBVTT');
        return textLines.join(' ').replace(/<[^>]*>/g, '');
    }
    async transcribeWithWhisper(videoId) {
        try {
            // Download audio using youtube-dl
            const audioPath = `${videoId}.mp3`;
            await execAsync(`youtube-dl -x --audio-format mp3 -o "${audioPath}" https://www.youtube.com/watch?v=${videoId}`);
            // Send to Whisper API
            const formData = new FormData();
            const audioFile = await fs.readFile(audioPath);
            formData.append('file', new Blob([audioFile]), 'audio.mp3');
            formData.append('model', 'whisper-1');
            const response = await axios_1.default.post('https://api.openai.com/v1/audio/transcriptions', formData, {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            });
            // Clean up
            await execAsync(`rm ${audioPath}`);
            return response.data.text;
        }
        catch (error) {
            console.error('Error transcribing with Whisper:', error);
            throw error;
        }
    }
}
exports.YouTubeService = YouTubeService;
exports.youtubeService = new YouTubeService();
//# sourceMappingURL=youtube.service.js.map