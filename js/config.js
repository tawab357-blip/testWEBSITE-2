// AI Assistant Configuration
const AI_CONFIG = {
    // OpenRouter (DeepSeek R1) Configuration
    openrouter: {
        apiKey: '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',
        endpoint: 'https://openrouter.ai/api/v1/chat/completions',
        model: 'deepseek/deepseek-r1',
        maxTokens: 3000,
        temperature: 0.7
    },

    // Webhook Configuration (preferred; replies from your local/hosted agent)
    webhook: {
        endpoint: 'http://localhost:5678/webhook/b8812542-38fd-4618-8c64-ff711a183591',
        timeoutMs: 15000
    },

    // Legacy providers retained for optional fallback (unused by default)
    openai: {
        apiKey: '',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        maxTokens: 300,
        temperature: 0.7
    },
    gemini: {
        apiKey: '',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        model: 'gemini-pro'
    },

    // Default provider order: webhook first, then openrouter
    provider: 'webhook',

    // Chat settings
    chat: {
        maxHistoryLength: 10,
        typingDelay: 800,
        responseDelay: 1200,
        welcomeDelay: 0
    },

    // Live content update settings (UI-only; no sales pitching)
    liveUpdates: {
        enabled: false,
        updateInterval: 5000,
        sections: []
    },

    // Pitching disabled per requirement (no pre-fixed/pushy messages)
    pitching: {
        enabled: false,
        subtlePitchThreshold: 3,
        directPitchThreshold: 8,
        sectionBasedPitching: false
    },

    // Form/Webhook settings
    forms: {
        // Contact form submission endpoint (Google Sheets webhook)
        contactWebhookEndpoint: 'http://localhost:5678/webhook/a204f0d5-3fea-4244-8101-953bbb503799',
        timeoutMs: 15000
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AI_CONFIG;
} 