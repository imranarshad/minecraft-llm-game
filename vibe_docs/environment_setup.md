## Tech Stack
- **Language**: JavaScript (ES6+)
- **3D Engine**: Three.js (WebGL-based 3D library)
- **LLM Integration**: WebLLM (browser-based LLM inference)
- **Build Tool**: Vite (fast development server and bundling)
- **Styling**: CSS3 + modern features
- **Deployment**: Static hosting (can deploy to Netlify, Vercel, GitHub Pages)

## Prerequisites
- Node.js (18+ recommended)
- npm (comes with Node.js)
- Modern browser with WebGL support
- Git (for version control)

## Setup Instructions
1. **Check Node.js installation**
   ```bash
   node --version
   npm --version
   ```

2. **Initialize project and install dependencies**
   ```bash
   npm init -y
   npm install three @mlc-ai/web-llm
   npm install --save-dev vite
   ```

3. **Create project structure**
   ```bash
   mkdir src assets
   touch src/main.js src/game.js src/llm.js
   touch index.html style.css
   ```

## How to Run
### Development
```bash
# Start development server with hot reload
npx vite

# Alternative: Add to package.json scripts then use
npm run dev
```

### Testing
```bash
# Open browser to http://localhost:5173
# Check browser console for any errors
```

### Production Build
```bash
# Build for production
npx vite build

# Preview production build
npx vite preview
```

## Environment Variables
- No environment variables needed for basic setup
- WebLLM runs entirely in browser (no API keys required)

## Project Structure
```
minecraft/
├── index.html          # Main HTML file
├── style.css           # Global styles
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration (optional)
├── src/
│   ├── main.js         # Entry point and game initialization
│   ├── game.js         # Core game logic and Three.js setup
│   ├── llm.js          # WebLLM integration
│   ├── world.js        # World generation and management
│   ├── player.js       # Player controls and movement
│   └── blocks.js       # Block types and management
├── assets/
│   └── textures/       # Block textures (if any)
└── vibe_docs/          # Documentation
```

## Troubleshooting
- **WebGL not supported**: Ensure using modern browser (Chrome, Firefox, Safari, Edge)
- **Three.js not loading**: Check network connection and CDN availability
- **WebLLM slow/failing**: Requires good internet for initial model download (cached after first use)
- **Vite dev server issues**: Check if port 5173 is available, try different port with `--port 3000`

## Performance Notes
- First LLM model load will take time (downloading model weights)
- Subsequent runs will be faster (browser caching)
- WebGL performance depends on graphics card capability
- Consider reducing world size if performance issues occur