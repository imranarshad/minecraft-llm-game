# 🎮 Minecraft LLM - AI-Powered Block Building Game

A minimalistic Minecraft-like game that runs entirely in your web browser, featuring an integrated AI assistant powered by Large Language Models. Build, explore, and get creative with help from your AI companion!

![Game Status](https://img.shields.io/badge/Status-Playable-brightgreen)
![Tech Stack](https://img.shields.io/badge/Tech-Three.js%20%2B%20WebLLM-blue)
![License](https://img.shields.io/badge/License-ISC-yellow)

## ✨ Features

### 🎯 Core Gameplay
- **3D Voxel World**: Fully 3D block-based world with realistic lighting and shadows
- **Keyboard Controls**: Classic WASD movement with arrow key camera rotation
- **Block Building**: Place and remove blocks to create your own structures
- **Multiple Block Types**: Grass, Stone, Wood, and Sand blocks with distinct colors
- **Procedural World**: Auto-generated world with terrain and simple tree structures

### 🤖 AI Integration
- **Smart Building Assistant**: Powered by WebLLM (Llama model) running entirely in browser
- **Creative Guidance**: Get tips on building castles, houses, bridges, and more
- **No Server Required**: AI runs locally in your browser for privacy
- **Building Tips**: Ask questions like "How do I build a castle?" or "What blocks work well together?"

### 🎨 Modern UI
- **Clean Interface**: Modern, minimalist design with glass morphism effects
- **Real-time Loading**: Visual progress bar for 3D world and AI model loading
- **Responsive Controls**: Block type selector and AI chat panel
- **Keyboard-Focused**: Easy-to-use keyboard controls for all interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with WebGL support (Chrome, Firefox, Safari, Edge)
- Good internet connection for initial AI model download (~1-2GB, cached after first use)

### Installation & Running

```bash
# Clone or download the project
cd minecraft

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser to http://localhost:5173
```

### First Time Setup
1. Wait for the loading screen to complete (3D world + AI model download)
2. Click anywhere in the game area to enable controls
3. Start building and ask the AI for help!

## 🎮 How to Play

### Controls
- **WASD** - Move around
- **Mouse** - Look around (click game area first to enable)
- **Left Click** - Remove blocks
- **Right Click** - Place blocks
- **Space** - Jump
- **Shift** - Run faster

### Block Types
- 🌱 **Grass** - Green blocks, great for nature builds
- 🪨 **Stone** - Gray blocks, perfect for castles and foundations
- 🌳 **Wood** - Brown blocks, ideal for houses and structures
- 🏖️ **Sand** - Yellow blocks, for beaches and desert builds

### AI Assistant
- Type questions in the AI panel like:
  - "How do I build a castle?"
  - "What blocks work well with wood?"
  - "Ideas for a modern house?"
  - "How to make a bridge?"
- Get creative building tips and guidance
- AI responses are tailored for building and creativity

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript with ES6 modules
- **3D Engine**: Three.js for WebGL rendering
- **AI Engine**: WebLLM for browser-based LLM inference
- **Build Tool**: Vite for fast development and bundling
- **Model**: Llama-3.2-1B optimized for browser performance

### Performance
- **Initial Load**: ~30-60 seconds (downloading AI model)
- **Subsequent Loads**: ~5 seconds (cached)
- **Frame Rate**: 60 FPS on modern hardware
- **Memory Usage**: ~2-3GB for AI model + game world

### Browser Compatibility
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 14+
- ✅ Edge 80+
- ❌ Internet Explorer (not supported)

## 📁 Project Structure

```
minecraft/
├── index.html          # Main HTML file
├── style.css           # Game UI styles
├── package.json        # Dependencies and scripts
├── src/
│   ├── main.js         # Game initialization and coordination
│   ├── game.js         # Three.js 3D engine and game logic
│   └── llm.js          # WebLLM AI assistant integration
├── assets/             # Game assets (textures, etc.)
├── vibe_docs/          # Development documentation
└── README.md           # This file
```

## 🔧 Development

### Adding New Block Types
```javascript
// In src/game.js, add to blockTypes object:
this.blockTypes = {
    // existing blocks...
    newBlock: { color: 0xFF0000, name: 'New Block' }
};
```

### Customizing AI Responses
```javascript
// In src/llm.js, modify systemPrompt or add to getCommonResponse()
```

### Performance Optimization
- Reduce world size in `