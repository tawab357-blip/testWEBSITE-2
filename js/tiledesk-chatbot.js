// Tiledesk FAQ Chatbot Integration
class TiledeskChatbot {
    constructor() {
        this.isInitialized = false;
        this.faqData = {
            services: [
                {
                    question: "What AI services do you offer?",
                    answer: "",
                    keywords: ["services", "offer", "ai", "what", "do"]
                },
                {
                    question: "How much do your AI services cost?",
                    answer: "",
                    keywords: ["cost", "price", "pricing", "how much", "money"]
                },
                {
                    question: "How long does AI integration take?",
                    answer: "",
                    keywords: ["time", "duration", "how long", "weeks", "months"]
                }
            ],
            technical: [
                {
                    question: "What technologies do you use?",
                    answer: "",
                    keywords: ["technology", "tech", "tools", "platforms", "what"]
                },
                {
                    question: "Do you provide ongoing support?",
                    answer: "",
                    keywords: ["support", "help", "maintenance", "ongoing", "24/7"]
                },
                {
                    question: "Is my data secure?",
                    answer: "",
                    keywords: ["security", "secure", "data", "privacy", "encryption"]
                }
            ],
            business: [
                {
                    question: "What ROI can I expect?",
                    answer: "",
                    keywords: ["roi", "return", "benefit", "results", "expect"]
                },
                {
                    question: "Do you work with small businesses?",
                    answer: "",
                    keywords: ["small", "business", "startup", "company", "size"]
                },
                {
                    question: "Can you integrate with existing systems?",
                    answer: "",
                    keywords: ["integrate", "existing", "systems", "crm", "erp"]
                }
            ]
        };
        
        this.conversationHistory = [];
        this.userIntent = null;
        this.init();
    }

    init() {
        this.setupTiledeskWidget();
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('Tiledesk FAQ Chatbot initialized');
    }

    setupTiledeskWidget() {
        // Tiledesk Widget Configuration
        const tiledeskConfig = {
            projectid: "YOUR_TILEDESK_PROJECT_ID", // Replace with your Tiledesk project ID
            apiurl: "https://api.tiledesk.com/v2/",
            theme: {
                primaryColor: "#667eea",
                secondaryColor: "#764ba2",
                backgroundColor: "#ffffff",
                textColor: "#333333"
            },
            welcomeMessage: "",
            position: "bottom-right",
            size: "medium",
            enableNotifications: true,
            enableSound: true,
            enableFileUpload: true,
            enableVoiceMessages: true
        };

        // Initialize Tiledesk widget
        if (typeof Tiledesk !== 'undefined') {
            Tiledesk.init(tiledeskConfig);
        } else {
            // Fallback to custom FAQ system if Tiledesk is not available
            this.setupCustomFAQWidget();
        }
    }

    setupCustomFAQWidget() {
        // Create custom FAQ widget as fallback
        const faqWidget = document.createElement('div');
        faqWidget.id = 'custom-faq-widget';
        faqWidget.className = 'faq-widget';
        faqWidget.innerHTML = `
            <div class="faq-toggle" id="faqToggle">
                <i class="fas fa-question-circle"></i>
                <span>FAQ Assistant</span>
            </div>
            <div class="faq-window" id="faqWindow">
                <div class="faq-header">
                    <h3>Frequently Asked Questions</h3>
                    <button class="faq-close" id="faqClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="faq-content" id="faqContent">
                    <div class="faq-categories">
                        <button class="faq-category active" data-category="services">Services</button>
                        <button class="faq-category" data-category="technical">Technical</button>
                        <button class="faq-category" data-category="business">Business</button>
                    </div>
                    <div class="faq-questions" id="faqQuestions"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(faqWidget);
        this.loadFAQQuestions('services');
    }

    setupEventListeners() {
        // FAQ widget event listeners
        const faqToggle = document.getElementById('faqToggle');
        const faqClose = document.getElementById('faqClose');
        const faqCategories = document.querySelectorAll('.faq-category');

        if (faqToggle) {
            faqToggle.addEventListener('click', () => this.toggleFAQWidget());
        }

        if (faqClose) {
            faqClose.addEventListener('click', () => this.closeFAQWidget());
        }

        faqCategories.forEach(category => {
            category.addEventListener('click', (e) => {
                const categoryName = e.target.dataset.category;
                this.loadFAQQuestions(categoryName);
                
                // Update active category
                faqCategories.forEach(cat => cat.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Handle incoming messages from Tiledesk
        if (typeof Tiledesk !== 'undefined') {
            Tiledesk.on('message', (message) => {
                this.handleIncomingMessage(message);
            });
        }
    }

    toggleFAQWidget() {
        const faqWindow = document.getElementById('faqWindow');
        if (faqWindow) {
            faqWindow.classList.toggle('active');
        }
    }

    closeFAQWidget() {
        const faqWindow = document.getElementById('faqWindow');
        if (faqWindow) {
            faqWindow.classList.remove('active');
        }
    }

    loadFAQQuestions(category) {
        const questionsContainer = document.getElementById('faqQuestions');
        if (!questionsContainer) return;

        const questions = this.faqData[category] || [];
        questionsContainer.innerHTML = '';

        questions.forEach((faq, index) => {
            const questionElement = document.createElement('div');
            questionElement.className = 'faq-question';
            questionElement.innerHTML = `
                <div class="faq-question-header" onclick="tiledeskChatbot.toggleAnswer(${index})">
                    <span>${faq.question}</span>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="faq-answer" id="faq-answer-${index}">
                    <p id="faq-dynamic-answer-${category}-${index}"></p>
                    <button class="faq-action-btn" onclick="tiledeskChatbot.askFollowUp('${faq.question}')">
                        <i class="fas fa-comment"></i>
                        Ask Follow-up
                    </button>
                </div>
            `;
            questionsContainer.appendChild(questionElement);

            // Fetch dynamic answer from webhook
            this.fetchDynamicAnswer(faq.question, `faq-dynamic-answer-${category}-${index}`);
        });
    }

    toggleAnswer(index) {
        const answer = document.getElementById(`faq-answer-${index}`);
        const icon = answer.previousElementSibling.querySelector('i');
        
        if (answer.style.display === 'block') {
            answer.style.display = 'none';
            icon.className = 'fas fa-chevron-down';
        } else {
            answer.style.display = 'block';
            icon.className = 'fas fa-chevron-up';
        }
    }

    askFollowUp(question) {
        // Open chat with pre-filled question
        if (typeof Tiledesk !== 'undefined') {
            Tiledesk.open();
            setTimeout(() => {
                Tiledesk.sendMessage(`I have a follow-up question about: ${question}`);
            }, 500);
        } else {
            // Fallback to contact form
            this.redirectToContact(question);
        }
    }

    redirectToContact(question) {
        const contactSection = document.getElementById('contact');
        if (contactSection) {
            contactSection.scrollIntoView({ behavior: 'smooth' });
            
            // Pre-fill the message field
            const messageField = document.getElementById('message');
            if (messageField) {
                messageField.value = `Follow-up question: ${question}\n\n`;
                messageField.focus();
            }
        }
    }

    async handleIncomingMessage(message) {
        // Route all messages to webhook for dynamic responses
        const userMessage = (message.text || '').toLowerCase();
        this.conversationHistory.push({ role: 'user', content: userMessage });

        try {
            const res = await fetch(AI_CONFIG.webhook.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage })
            });
            const data = await res.json();
            const text = data.reply || data.response || '';
            this.sendResponse({ text, type: 'webhook', confidence: 1 });
        } catch (e) {
            // Fallback to OpenRouter
            try {
                const response = await fetch(AI_CONFIG.openrouter.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AI_CONFIG.openrouter.apiKey}`,
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'AI Nexus Pro'
                    },
                    body: JSON.stringify({
                        model: AI_CONFIG.openrouter.model,
                        messages: [
                            { role: 'system', content: 'You are a chatbot for AI Nexus Pro.' },
                            { role: 'user', content: userMessage }
                        ],
                        max_tokens: AI_CONFIG.openrouter.maxTokens,
                        temperature: AI_CONFIG.openrouter.temperature
                    })
                });
                if (!response.ok) throw new Error('OpenRouter error');
                const data = await response.json();
                const text = data.choices?.[0]?.message?.content || '';
                this.sendResponse({ text, type: 'openrouter', confidence: 1 });
            } catch (orError) {
                console.warn('Tiledesk OpenRouter fallback failed', orError);
            }
        }
    }

    analyzeIntent(message) {
        // Simple intent analysis based on keywords
        if (message.includes('service') || message.includes('offer') || message.includes('what')) {
            this.userIntent = 'services';
        } else if (message.includes('price') || message.includes('cost') || message.includes('money')) {
            this.userIntent = 'pricing';
        } else if (message.includes('time') || message.includes('duration') || message.includes('how long')) {
            this.userIntent = 'timeline';
        } else if (message.includes('contact') || message.includes('call') || message.includes('speak')) {
            this.userIntent = 'contact';
        } else {
            this.userIntent = 'general';
        }
    }

    generateResponse(message) {
        // Find the best matching FAQ
        const bestMatch = this.findBestFAQMatch(message);
        
        if (bestMatch) {
            return {
                text: bestMatch.answer,
                type: 'faq',
                confidence: bestMatch.confidence
            };
        }

        // Generate contextual response based on intent
        return this.generateContextualResponse(message);
    }

    findBestFAQMatch(message) {
        let bestMatch = null;
        let highestConfidence = 0;

        // Search through all FAQ categories
        Object.values(this.faqData).forEach(category => {
            category.forEach(faq => {
                const confidence = this.calculateMatchConfidence(message, faq);
                if (confidence > highestConfidence && confidence > 0.3) {
                    highestConfidence = confidence;
                    bestMatch = { ...faq, confidence };
                }
            });
        });

        return bestMatch;
    }

    calculateMatchConfidence(message, faq) {
        const messageWords = message.split(' ');
        const faqKeywords = faq.keywords;
        const questionWords = faq.question.toLowerCase().split(' ');

        let matches = 0;
        let totalWords = Math.max(messageWords.length, faqKeywords.length);

        // Check keyword matches
        faqKeywords.forEach(keyword => {
            if (message.includes(keyword)) {
                matches++;
            }
        });

        // Check question word matches
        questionWords.forEach(word => {
            if (message.includes(word) && word.length > 3) {
                matches++;
            }
        });

        return matches / totalWords;
    }

    generateContextualResponse(message) {
        // Defer to webhook for dynamic responses
        return {
            text: '',
            type: 'webhook',
            confidence: 0.5
        };
    }

    sendResponse(response) {
        if (response.text) {
            if (typeof Tiledesk !== 'undefined') {
                Tiledesk.sendMessage(response.text);
            } else {
                this.showCustomResponse(response.text);
            }
        }

        // Add to conversation history
        if (response.text) {
            this.conversationHistory.push({ role: 'assistant', content: response.text });
        }
    }

    async fetchDynamicAnswer(question, targetElementId) {
        try {
            const res = await fetch(AI_CONFIG.webhook.endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });
            if (!res.ok) throw new Error('FAQ webhook failed');
            const data = await res.json();
            const text = data.reply || data.response || '';
            const el = document.getElementById(targetElementId);
            if (el) el.textContent = text;
        } catch (e) {
            // fallback to OpenRouter
            try {
                const response = await fetch(AI_CONFIG.openrouter.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${AI_CONFIG.openrouter.apiKey}`,
                        'HTTP-Referer': window.location.origin,
                        'X-Title': 'AI Nexus Pro'
                    },
                    body: JSON.stringify({
                        model: AI_CONFIG.openrouter.model,
                        messages: [
                            { role: 'system', content: 'You are a chatbot for AI Nexus Pro.' },
                            { role: 'user', content: question }
                        ],
                        max_tokens: AI_CONFIG.openrouter.maxTokens,
                        temperature: AI_CONFIG.openrouter.temperature
                    })
                });
                if (!response.ok) throw new Error('OpenRouter error');
                const data = await response.json();
                const text = data.choices?.[0]?.message?.content || '';
                const el = document.getElementById(targetElementId);
                if (el) el.textContent = text;
            } catch (orErr) {
                console.warn('FAQ OpenRouter fallback failed', orErr);
            }
        }
    }

    showCustomResponse(response) {
        const faqContent = document.getElementById('faqContent');
        if (faqContent) {
            const responseElement = document.createElement('div');
            responseElement.className = 'faq-response';
            responseElement.innerHTML = `
                <div class="response-bubble">
                    <p>${response}</p>
                </div>
            `;
            faqContent.appendChild(responseElement);
            
            // Auto-scroll to response
            responseElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Analytics and tracking
    trackInteraction(type, data) {
        // Track user interactions for analytics
        const interaction = {
            type,
            data,
            timestamp: new Date().toISOString(),
            sessionId: this.getSessionId()
        };

        // Send to analytics service (replace with your analytics endpoint)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'faq_interaction', {
                event_category: 'chatbot',
                event_label: type,
                value: 1
            });
        }

        console.log('FAQ Interaction tracked:', interaction);
    }

    getSessionId() {
        let sessionId = sessionStorage.getItem('faq_session_id');
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('faq_session_id', sessionId);
        }
        return sessionId;
    }
}

// Initialize Tiledesk Chatbot
let tiledeskChatbot;
document.addEventListener('DOMContentLoaded', () => {
    tiledeskChatbot = new TiledeskChatbot();
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TiledeskChatbot;
} 