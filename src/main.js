import { Game } from './game.js';
import { LLMAssistant } from './llm.js';

class MinecraftLLM {
    constructor() {
        this.game = null;
        this.llm = null;
        this.isLoaded = false;

        // UI Elements
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingProgress = document.getElementById('loadingProgress');
        this.loadingText = document.getElementById('loadingText');
        this.aiStatus = document.getElementById('aiStatus');
        this.aiInput = document.getElementById('aiInput');
        this.aiAsk = document.getElementById('aiAsk');
        this.aiResponse = document.getElementById('aiResponse');

        this.init();
    }

    async init() {
        try {
            // Update loading progress
            this.updateProgress(10, 'Initializing 3D Engine...');

            // Initialize the 3D game
            this.game = new Game();
            await this.game.init();

            this.updateProgress(50, 'Loading AI Assistant...');

            // Initialize LLM Assistant
            this.llm = new LLMAssistant();
            await this.llm.init((progress) => {
                // Update progress from 50% to 90% based on LLM loading
                const adjustedProgress = 50 + (progress * 40);
                this.updateProgress(adjustedProgress, `Loading AI Model... ${Math.round(progress * 100)}%`);
            });

            this.updateProgress(95, 'Setting up game world...');

            // Setup the world and player
            this.game.createWorld();
            this.game.setupPlayer();

            this.updateProgress(100, 'Ready to play!');

            // Setup event listeners
            this.setupEventListeners();

            // Hide loading screen after a brief delay
            setTimeout(() => {
                this.hideLoadingScreen();
                this.setupAI();
            }, 500);

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.updateProgress(0, 'Error loading game. Please refresh and try again.');
            this.aiStatus.textContent = 'Failed to load';
            this.aiStatus.className = 'error';
        }
    }

    updateProgress(percentage, text) {
        this.loadingProgress.style.width = `${percentage}%`;
        this.loadingText.textContent = text;
    }

    hideLoadingScreen() {
        this.loadingScreen.classList.add('hidden');
        this.isLoaded = true;

        // The game.js will handle pointer lock setup
        console.log('Game loaded and ready for interaction');
    }

    setupAI() {
        if (this.llm && this.llm.isReady) {
            this.aiStatus.textContent = 'AI Ready - Ask for help!';
            this.aiStatus.className = 'ready';
            this.aiInput.disabled = false;
            this.aiAsk.disabled = false;
        } else {
            this.aiStatus.textContent = 'AI not available';
            this.aiStatus.className = 'error';
        }
    }

    setupEventListeners() {
        // AI Assistant
        this.aiAsk.addEventListener('click', () => this.askAI());
        this.aiInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.askAI();
            }
        });

        // Block selector
        const blockOptions = document.querySelectorAll('.block-option');
        blockOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // Remove active class from all options
                blockOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to clicked option
                e.target.classList.add('active');

                // Update selected block type in game
                const blockType = e.target.dataset.type;
                if (this.game) {
                    this.game.setSelectedBlockType(blockType);
                }
            });
        });

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (this.game) {
                if (document.hidden) {
                    this.game.pause();
                } else {
                    this.game.resume();
                }
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.handleResize();
            }
        });
    }

    async askAI() {
        const question = this.aiInput.value.trim();
        if (!question || !this.llm || !this.llm.isReady) return;

        // Clear input and show thinking state
        this.aiInput.value = '';
        this.aiResponse.textContent = 'AI is thinking...';
        this.aiResponse.classList.add('thinking');
        this.aiAsk.disabled = true;

        try {
            // Get response from AI
            const response = await this.llm.askQuestion(question);

            // Display response
            this.aiResponse.textContent = response;
            this.aiResponse.classList.remove('thinking');

        } catch (error) {
            console.error('AI Error:', error);
            this.aiResponse.textContent = 'Sorry, I had trouble understanding that. Please try again.';
            this.aiResponse.classList.remove('thinking');
        } finally {
            this.aiAsk.disabled = false;
        }
    }
}

// Start the game when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    new MinecraftLLM();
});

// Handle any unhandled errors
window.addEventListener('error', (e) => {
    console.error('Unhandled error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
});