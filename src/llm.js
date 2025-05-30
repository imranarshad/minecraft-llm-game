import { CreateMLCEngine } from '@mlc-ai/web-llm';

export class LLMAssistant {
    constructor() {
        this.engine = null;
        this.isReady = false;
        this.isLoading = false;

        // Use a smaller model for better performance
        this.selectedModel = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

        // System prompt for Minecraft building assistant
        this.systemPrompt = `You are a helpful AI assistant for a Minecraft-like block building game with an infinite procedurally generated world.

Your role is to help players with:
- Building tips and techniques using the expanded block palette
- Creative building ideas for different biomes
- Exploration strategies for the infinite world
- Information about block types and their properties
- Biome-specific building suggestions

Available blocks: Grass, Stone, Wood, Sand, Water, Dirt, Coal Ore, Iron Ore, Gold Ore, Diamond Ore, Lava, Ice, Snow, Leaves, Obsidian

Biomes in the world: Plains, Forest, Desert, Mountains, Ocean

Block properties:
- Transparent blocks: Water, Ice, Leaves
- Glowing blocks: Lava
- Rare ores: Diamond (deepest), Gold, Iron, Coal (underground)

Keep responses brief, friendly, and focused on building/exploration help.
Use simple language and be encouraging about exploring the infinite world.
Mention biome-specific building opportunities when relevant.

Example topics you can help with:
- "How do I build a mountain fortress?"
- "What should I build in the desert biome?"
- "How to find rare ores?"
- "Ideas for an ocean base?"
- "How to use the new transparent blocks?"`;
    }

    async init(progressCallback) {
        if (this.isLoading || this.isReady) {
            return;
        }

        this.isLoading = true;

        try {
            console.log('Initializing LLM engine...');

            // Initialize the WebLLM engine with progress tracking
            this.engine = await CreateMLCEngine(
                this.selectedModel,
                {
                    initProgressCallback: (progress) => {
                        console.log('LLM Loading progress:', progress);
                        if (progressCallback) {
                            // Convert the progress object to a simple percentage
                            const percentage = progress.progress || 0;
                            progressCallback(percentage);
                        }
                    }
                }
            );

            console.log('LLM engine initialized successfully');
            this.isReady = true;
            this.isLoading = false;

            // Test the engine with a simple message
            await this.testConnection();

        } catch (error) {
            console.error('Failed to initialize LLM:', error);
            this.isReady = false;
            this.isLoading = false;
            throw error;
        }
    }

    async testConnection() {
        try {
            const response = await this.engine.chat.completions.create({
                messages: [
                    { role: "system", content: this.systemPrompt },
                    { role: "user", content: "Say 'AI Assistant Ready!' if you can help with building in Minecraft." }
                ],
                temperature: 0.7,
                max_tokens: 50
            });

            console.log('LLM Test Response:', response.choices[0].message.content);

        } catch (error) {
            console.error('LLM test failed:', error);
        }
    }

    async askQuestion(question) {
        if (!this.isReady || !this.engine) {
            throw new Error('LLM is not ready. Please wait for initialization.');
        }

        try {
            console.log('User question:', question);

            // Create messages array with system prompt and user question
            const messages = [
                { role: "system", content: this.systemPrompt },
                { role: "user", content: question }
            ];

            // Generate response
            const response = await this.engine.chat.completions.create({
                messages,
                temperature: 0.8, // Slightly creative but focused
                max_tokens: 200,   // Keep responses concise
                top_p: 0.9
            });

            const answer = response.choices[0].message.content;
            console.log('AI response:', answer);

            return answer;

        } catch (error) {
            console.error('Error getting LLM response:', error);
            throw new Error('Sorry, I had trouble processing your question. Please try again.');
        }
    }

    async getBuildingSuggestion(blockType) {
        const suggestions = {
            grass: "Grass blocks are great for nature builds! Try making a garden, park, or the roof of an underground bunker. They also work well for camouflaged buildings.",
            stone: "Stone is perfect for castles, fortresses, and sturdy buildings. Mix with wood for a medieval look, or use alone for ancient ruins.",
            wood: "Wood blocks are excellent for cozy houses, bridges, and tree houses. Different wood types can create beautiful patterns and textures.",
            sand: "Sand blocks are ideal for desert builds, beaches, or Egyptian-style pyramids. Perfect for blending into desert biomes!",
            water: "Water blocks create beautiful fountains, pools, and moats! Use them for underwater bases or aquatic gardens.",
            dirt: "Dirt blocks are great for underground builds and natural-looking structures. Mix with grass for realistic terrain.",
            coal: "Coal ore blocks add dark accents to builds. Use sparingly for industrial or mine-themed structures.",
            iron: "Iron ore blocks provide a metallic gray look, perfect for modern or industrial builds.",
            gold: "Gold ore blocks add luxury and shine! Use for treasure rooms, palaces, or decorative accents.",
            diamond: "Diamond ore blocks are the most precious! Save for special builds like throne rooms or magical structures.",
            lava: "Lava blocks glow and provide dramatic lighting! Perfect for forges, volcanic builds, or mood lighting.",
            ice: "Ice blocks are transparent and cold-looking. Great for winter builds, igloos, or modern glass-like structures.",
            snow: "Snow blocks are perfect for winter scenes, arctic bases, or mountain-top builds.",
            leaves: "Leaf blocks are transparent and natural. Use for tree builds, gardens, or organic architecture.",
            obsidian: "Obsidian blocks are dark and mysterious. Perfect for gothic builds, portals, or dramatic accents."
        };

        return suggestions[blockType] || "Try experimenting with different block combinations to create unique structures in the infinite world!";
    }

    getRandomBuildingTip() {
        const tips = [
            "Mix different block types for more interesting textures and patterns.",
            "Use symmetry for grand buildings, or break it intentionally for a more organic feel.",
            "Add depth to walls by varying the block placement - some blocks in, some out.",
            "Small details like windows, doors, and decorations make buildings come alive.",
            "Start with a simple shape and gradually add complexity as you build.",
            "Use natural terrain features to inspire your building designs.",
            "Try building at different scales - from tiny cottages to massive castles.",
            "Lighting with lava blocks can completely change the mood of your structures.",
            "Don't be afraid to rebuild parts if they don't look right.",
            "Sometimes the most beautiful builds are the simplest ones.",
            "Explore different biomes for unique building opportunities!",
            "Use transparent blocks like ice and water for modern glass-like effects.",
            "Dig deep to find rare ores for special decorative accents.",
            "Build with the biome - sand castles in deserts, ice fortresses in snowy areas.",
            "The infinite world means unlimited space for your creativity!"
        ];

        return tips[Math.floor(Math.random() * tips.length)];
    }

    getQuickHelp() {
        return `🎮 Infinite World Building Guide:

🌍 **Biomes Available:**
• Plains: Grass builds, villages
• Forest: Tree houses, wooden structures
• Desert: Sand castles, pyramids
• Mountains: Stone fortresses, caves
• Ocean: Underwater bases, lighthouses

🧱 **New Blocks:**
• Transparent: Water 💧, Ice 🧊, Leaves 🍃
• Glowing: Lava 🔥 (great for lighting!)
• Ores: Coal ⚫, Iron ⚪, Gold 🟡, Diamond 💎

💡 **Tips:**
• Explore to find different biomes
• Dig deep for rare ores
• Mix blocks for better textures
• Use biome-appropriate materials

Ask me: "How to build in [biome]?" or "What can I do with [block]?"`;
    }

    // Predefined responses for common questions
    getCommonResponse(question) {
        const lowerQuestion = question.toLowerCase();

        if (lowerQuestion.includes('castle')) {
            return "🏰 For a castle: Use stone blocks for main walls, add wood accents. Build tall towers at corners with snow/ice for winter castles. In mountains, use the terrain for natural defenses!";
        }

        if (lowerQuestion.includes('house')) {
            return "🏠 For houses: Wood in forests, sand in deserts, stone in mountains. Add water features, use lava for cozy fireplaces, ice for modern windows!";
        }

        if (lowerQuestion.includes('tree')) {
            return "🌳 For trees: Wood trunk, leaves for canopy. In different biomes: snow-covered in mountains, desert palms with sand, ice trees for winter scenes!";
        }

        if (lowerQuestion.includes('bridge')) {
            return "🌉 For bridges: Wood over water, stone in mountains, ice for modern looks. Use lava underneath for dramatic lighting effects!";
        }

        if (lowerQuestion.includes('biome') || lowerQuestion.includes('desert') || lowerQuestion.includes('forest') || lowerQuestion.includes('mountain') || lowerQuestion.includes('ocean')) {
            return "🌍 Each biome offers unique opportunities! Desert: sand pyramids, oases. Forest: tree houses, wooden villages. Mountains: stone fortresses, snow castles. Ocean: underwater bases, lighthouses. Plains: open farmland, grand structures!";
        }

        if (lowerQuestion.includes('ore') || lowerQuestion.includes('diamond') || lowerQuestion.includes('gold') || lowerQuestion.includes('iron') || lowerQuestion.includes('coal')) {
            return "⛏️ Find ores by digging deep underground! Coal is common, iron and gold are deeper, diamond is deepest and rarest. Use them for special decorative accents - gold for luxury, diamond for magical builds!";
        }

        if (lowerQuestion.includes('water') || lowerQuestion.includes('lava') || lowerQuestion.includes('ice')) {
            return "💧 Special blocks add magic! Water: pools, moats, underwater builds. Lava: lighting, forges, volcanic themes. Ice: modern transparent architecture, winter scenes. All add unique atmosphere!";
        }

        return null; // Let the LLM handle other questions
    }

    destroy() {
        this.isReady = false;
        this.engine = null;
    }
}