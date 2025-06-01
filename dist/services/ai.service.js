"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = exports.AIService = void 0;
const axios_1 = __importDefault(require("axios"));
const embedding_service_1 = require("./embedding.service");
class AIService {
    constructor() {
        this.geminiModel = 'google/gemini-2.0-flash-thinking-exp:online';
        this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    }
    async processQuery(request) {
        try {
            // Step 1: Search for relevant embeddings
            const searchResults = await embedding_service_1.embeddingService.searchSimilar(request.courseId, request.query, request.maxSources || 5);
            // Step 2: Format context from search results
            const context = this.formatContext(searchResults);
            // Step 3: Determine if we need additional searches
            const needsMoreContext = await this.assessContextSufficiency(request.query, context);
            let finalContext = context;
            if (needsMoreContext && request.requireCrossReference) {
                // Perform additional targeted searches
                const additionalResults = await this.performCrossReferenceSearch(request.courseId, request.query, searchResults);
                finalContext = this.combineContexts(context, additionalResults);
            }
            // Step 4: Generate response using Gemini
            const response = await this.generateResponse(request.query, finalContext, request.useWebSearch);
            // Step 5: Format the response with sources
            return {
                id: Date.now().toString(),
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                sources: this.extractSources(searchResults),
                webSearchEnabled: request.useWebSearch,
            };
        }
        catch (error) {
            console.error('Error processing query:', error);
            throw error;
        }
    }
    formatContext(searchResults) {
        if (!searchResults.documents || searchResults.documents[0].length === 0) {
            return 'No relevant context found in the course materials.';
        }
        const contexts = searchResults.documents[0].map((doc, idx) => {
            const metadata = searchResults.metadatas[0][idx];
            return `Source: ${metadata.fileName} (${metadata.fileType})
Content: ${doc}
---`;
        });
        return contexts.join('\n\n');
    }
    async assessContextSufficiency(query, context) {
        // Simple heuristic - in production, use AI to assess
        const queryTokens = query.toLowerCase().split(' ');
        const contextLower = context.toLowerCase();
        const missingKeywords = queryTokens.filter(token => token.length > 3 && !contextLower.includes(token));
        return missingKeywords.length > queryTokens.length * 0.3;
    }
    async performCrossReferenceSearch(courseId, query, previousResults) {
        // Extract key terms from query that weren't found
        const keyTerms = this.extractKeyTerms(query);
        const additionalSearches = await Promise.all(keyTerms.map(term => embedding_service_1.embeddingService.searchSimilar(courseId, term, 3)));
        return this.formatContext({
            documents: [additionalSearches.flatMap(s => s.documents?.[0] || [])],
            metadatas: [additionalSearches.flatMap(s => s.metadatas?.[0] || [])],
        });
    }
    extractKeyTerms(query) {
        // Simple extraction - in production, use NLP
        const words = query.split(/\s+/);
        return words.filter(w => w.length > 4);
    }
    combineContexts(context1, context2) {
        return `${context1}\n\nAdditional Context:\n${context2}`;
    }
    async generateResponse(query, context, useWebSearch) {
        const systemPrompt = `You are an AI assistant helping students with their course materials. 
You have access to the following course content:

${context}

Instructions:
1. Answer questions based ONLY on the provided course content
2. If the answer isn't in the content, say so clearly
3. Cite specific sources when providing information
4. Format your response with clear headings and structure
5. Be helpful and thorough in your explanations
${useWebSearch ? '6. You may supplement with web search results if enabled' : ''}`;
        try {
            const response = await axios_1.default.post('https://openrouter.ai/api/v1/chat/completions', {
                model: this.geminiModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: query }
                ],
                temperature: 0.7,
                max_tokens: 2000,
            }, {
                headers: {
                    'Authorization': `Bearer ${this.openRouterApiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const geminiResponse = response.data;
            return {
                content: geminiResponse.choices[0].message.content,
            };
        }
        catch (error) {
            console.error('Error calling Gemini:', error);
            throw error;
        }
    }
    extractSources(searchResults) {
        if (!searchResults.documents || searchResults.documents[0].length === 0) {
            return [];
        }
        return searchResults.documents[0].map((doc, idx) => {
            const metadata = searchResults.metadatas[0][idx];
            const distance = searchResults.distances?.[0]?.[idx] || 0;
            return {
                fileId: metadata.fileId,
                fileName: metadata.fileName,
                relevanceScore: 1 - distance, // Convert distance to similarity
                excerpt: doc.substring(0, 200) + '...',
                pageNumber: metadata.pageNumber,
            };
        });
    }
}
exports.AIService = AIService;
exports.aiService = new AIService();
//# sourceMappingURL=ai.service.js.map