// AI Integration with Free APIs
class AIIntegration {
    constructor() {
        this.provider = AI_CONFIG.provider || 'webhook';
        this.init();
    }

    init() {
        this.setupFreeAPIs();
        this.setupEventListeners();
    }

    setupFreeAPIs() {
        // Unified provider map with webhook and OpenRouter
        this.freeAPIs = {
            webhook: {
                endpoint: AI_CONFIG.webhook.endpoint,
            },
            openrouter: {
                endpoint: AI_CONFIG.openrouter.endpoint,
                model: AI_CONFIG.openrouter.model,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AI_CONFIG.openrouter.apiKey}`
                }
            }
        };
    }

    // Removed legacy key getters; using AI_CONFIG

    setupEventListeners() {
        // Listen for AI requests from other components
        document.addEventListener('ai-request', (e) => {
            this.handleAIRequest(e.detail);
        });
    }

    async handleAIRequest(request) {
        const { type, input, callback } = request;
        
        try {
            let response;
            
            switch (type) {
                case 'chat':
                    response = await this.generateChatResponse(input);
                    break;
                case 'voice':
                    response = await this.generateVoiceResponse(input);
                    break;
                case 'analysis':
                    response = await this.analyzeText(input);
                    break;
                default:
                    response = await this.generateFallbackResponse(input);
            }
            
            if (callback) {
                callback(response);
            }
            
            // Dispatch response event
            document.dispatchEvent(new CustomEvent('ai-response', {
                detail: { type, input, response }
            }));
            
        } catch (error) {
            console.error('AI request failed:', error);
            const fallbackResponse = this.generateFallbackResponse(input);
            
            if (callback) {
                callback(fallbackResponse);
            }
        }
    }

    async generateChatResponse(input) {
        // Try webhook first, then OpenRouter DeepSeek R1
        const providers = ['webhook', 'openrouter'];
        for (const provider of providers) {
            try {
                const response = await this.callAPI(provider, input);
                if (response) return response;
            } catch (error) {
                console.warn(`${provider} API failed, trying next...`, error);
            }
        }
        return this.generateFallbackResponse(input);
    }

    async callAPI(provider, input) {
        const api = this.freeAPIs[provider];
        if (!api) return null;

        const systemPrompt = `You are a chatbot for AI Nexus Pro. Be helpful and concise. Answer as an AI agent of AI Nexus Pro and avoid fixed/templated replies.`;

        try {
            switch (provider) {
                case 'webhook':
                    return await this.callWebhook(api, input);
                case 'openrouter':
                    return await this.callOpenRouter(api, input, systemPrompt);
                default:
                    return null;
            }
        } catch (error) {
            console.error(`Error calling ${provider} API:`, error);
            return null;
        }
    }

    async callOpenRouter(api, input, systemPrompt) {
        const response = await fetch(api.endpoint, {
            method: 'POST',
            headers: api.headers,
            body: JSON.stringify({
                model: api.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: input }
                ],
                max_tokens: AI_CONFIG.openrouter.maxTokens,
                temperature: AI_CONFIG.openrouter.temperature
            })
        });
        if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    }

    async callWebhook(api, input) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), AI_CONFIG.webhook.timeoutMs);
        try {
            const response = await fetch(api.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: input }),
                signal: controller.signal
            });
            if (!response.ok) throw new Error(`Webhook error: ${response.status}`);
            const data = await response.json();
            return data.reply || data.response || JSON.stringify(data);
        } finally {
            clearTimeout(timeout);
        }
    }

    // Removed HuggingFace path

    generateFallbackResponse(input) {
        // Avoid fixed replies per requirement
        return `I'm processing your request but couldn't reach the AI service right now. Please try again.`;
    }

    async generateVoiceResponse(input) {
        // For voice responses, we can use text-to-speech APIs
        // For now, return a text response that can be converted to speech
        const response = await this.generateChatResponse(input);
        return {
            text: response,
            audio: null // In a real implementation, this would contain audio data
        };
    }

    async analyzeText(input) {
        // Simple text analysis for sentiment and intent
        const analysis = {
            sentiment: this.analyzeSentiment(input),
            intent: this.analyzeIntent(input),
            keywords: this.extractKeywords(input),
            confidence: 0.8
        };
        
        return analysis;
    }

    analyzeSentiment(text) {
        const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'interested', 'helpful'];
        const negativeWords = ['bad', 'terrible', 'hate', 'dislike', 'expensive', 'difficult', 'problem'];
        
        const lowerText = text.toLowerCase();
        let score = 0;
        
        positiveWords.forEach(word => {
            if (lowerText.includes(word)) score += 1;
        });
        
        negativeWords.forEach(word => {
            if (lowerText.includes(word)) score -= 1;
        });
        
        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
    }

    analyzeIntent(text) {
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('how much')) {
            return 'pricing_inquiry';
        }
        if (lowerText.includes('service') || lowerText.includes('offer') || lowerText.includes('what do you do')) {
            return 'service_inquiry';
        }
        if (lowerText.includes('contact') || lowerText.includes('email') || lowerText.includes('phone')) {
            return 'contact_request';
        }
        if (lowerText.includes('book') || lowerText.includes('schedule') || lowerText.includes('appointment')) {
            return 'booking_request';
        }
        
        return 'general_inquiry';
    }

    extractKeywords(text) {
        const commonKeywords = [
            'ai', 'artificial intelligence', 'chatbot', 'voice bot', 'automation',
            'integration', 'business', 'solution', 'service', 'consultation',
            'pricing', 'cost', 'roi', 'benefit', 'efficiency', 'productivity'
        ];
        
        const lowerText = text.toLowerCase();
        return commonKeywords.filter(keyword => lowerText.includes(keyword));
    }

    // Public method to request AI assistance
    async requestAI(type, input) {
        return new Promise((resolve) => {
            document.dispatchEvent(new CustomEvent('ai-request', {
                detail: { type, input, callback: resolve }
            }));
        });
    }
}

// Initialize AI Integration
const aiIntegration = new AIIntegration();

// Export for use in other scripts
window.AIIntegration = aiIntegration; 