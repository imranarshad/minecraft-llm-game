import * as THREE from 'three';

export class Game {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.crosshair = null;
        this.aiInput = null;

        // Game state
        this.isRunning = false;
        this.isPaused = false;

        // Performance monitoring
        this.performance = {
            fps: 0,
            frameCount: 0,
            lastTime: 0,
            lastFpsUpdate: 0
        };

        // Player
        this.player = {
            position: new THREE.Vector3(0, 2, 0),
            rotation: new THREE.Euler(0, 0, 0),
            velocity: new THREE.Vector3(0, 0, 0),
            onGround: false,
            speed: 5,
            jumpPower: 8
        };

        // Controls
        this.keys = {};
        this.camera_rotation = { x: 0, y: 0, rotationSpeed: 0.05 }; // Keyboard-based rotation
        this.mouse = { x: 0, y: 0 }; // Mouse position for block targeting
        this.inputFocused = false; // Flag to check if an input field is focused

        // Trackpad gesture support
        this.trackpad = {
            isScrolling: false,
            lastTouchTime: 0,
            panSensitivity: 0.002,
            scrollSensitivity: 0.01
        };

        // World
        this.world = {
            blocks: new Map(), // Store blocks by position key "x,y,z"
            chunkSize: 16,
            worldHeight: 32
        };

        // Block types - Expanded for more variety and fun
        this.blockTypes = {
            grass: { color: 0x4CAF50, name: 'Grass', rarity: 'common' },
            stone: { color: 0x757575, name: 'Stone', rarity: 'common' },
            wood: { color: 0x8D6E63, name: 'Wood', rarity: 'common' },
            sand: { color: 0xFFEB3B, name: 'Sand', rarity: 'common' },
            water: { color: 0x2196F3, name: 'Water', rarity: 'common', transparent: true },
            coal: { color: 0x212121, name: 'Coal Ore', rarity: 'uncommon' },
            iron: { color: 0xBDBDBD, name: 'Iron Ore', rarity: 'uncommon' },
            gold: { color: 0xFFD700, name: 'Gold Ore', rarity: 'rare' },
            diamond: { color: 0x00BCD4, name: 'Diamond Ore', rarity: 'rare' },
            obsidian: { color: 0x1A1A1A, name: 'Obsidian', rarity: 'rare' },
            ice: { color: 0xE0F6FF, name: 'Ice', rarity: 'uncommon', transparent: true },
            leaves: { color: 0x2E7D32, name: 'Leaves', rarity: 'common', transparent: true },
            lava: { color: 0xFF5722, name: 'Lava', rarity: 'rare', glowing: true },
            snow: { color: 0xFFFFFF, name: 'Snow', rarity: 'uncommon' },
            dirt: { color: 0x8D6E63, name: 'Dirt', rarity: 'common' }
        };

        this.selectedBlockType = 'grass';

        // World generation settings for infinite world (optimized for performance)
        this.worldGen = {
            seed: Math.random() * 1000000,
            octaves: 3, // Reduced from 4
            amplitude: 6, // Reduced from 8
            frequency: 0.03, // Increased for less detail but better performance
            chunkSize: 8, // Reduced from 16 for faster generation
            renderDistance: 2, // Reduced from 3 for better performance
            loadedChunks: new Map(),
            heightMap: new Map(),
            biomes: ['plains', 'forest', 'desert', 'mountains', 'ocean'],
            maxChunksPerFrame: 1, // Limit chunk generation per frame
            lastChunkCheck: 0 // Throttle chunk checking
        };

        // Raycaster for block interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse3D = new THREE.Vector2();

        // Block targeting
        this.targetedBlock = null;
        this.highlightMesh = null;
    }

    async init() {
        this.canvas = document.getElementById('gameCanvas');
        this.crosshair = document.getElementById('crosshair');
        this.aiInput = document.getElementById('aiInput'); // Get AI input element

        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue

        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75, // FOV
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near
            1000 // Far
        );

        // Setup renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Add lighting
        this.setupLighting();

        // Setup controls
        this.setupControls();

        console.log('Game engine initialized');
    }

    setupLighting() {
        // Ambient light for general illumination
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        directionalLight.shadow.camera.left = -50;
        directionalLight.shadow.camera.right = 50;
        directionalLight.shadow.camera.top = 50;
        directionalLight.shadow.camera.bottom = -50;
        this.scene.add(directionalLight);
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            // Only process game controls if an input field is NOT focused
            if (!this.inputFocused) {
                this.keys[e.code] = true;

                // Handle specific action keys
                if (e.code === 'Space') {
                    e.preventDefault(); // Prevent page scroll
                    this.jump();
                }

                // Block interaction keys
                if (e.code === 'KeyM') {
                    e.preventDefault();
                    this.removeBlock();
                }

                if (e.code === 'KeyB') {
                    e.preventDefault();
                    this.placeBlock();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            // Only process game controls if an input field is NOT focused
            if (!this.inputFocused) {
                this.keys[e.code] = false;
            }
        });

        // Add focus/blur listeners to AI input to manage game controls
        if (this.aiInput) {
            this.aiInput.addEventListener('focus', () => {
                this.inputFocused = true;
                console.log('AI input focused, game controls disabled.');
            });
            this.aiInput.addEventListener('blur', () => {
                this.inputFocused = false;
                console.log('AI input blurred, game controls enabled.');
            });
        }

        // Mouse tracking for block targeting
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            // Update crosshair position
            this.updateCrosshair(e.clientX - rect.left, e.clientY - rect.top);
        });

        // Trackpad gesture support
        this.setupTrackpadControls();

        console.log('Keyboard-only controls initialized');
        console.log('Controls: WASD=Move, Arrows=Look, Space=Jump, B=Place Block, M=Remove Block, Shift=Run');
        console.log('Mouse: Point at blocks to target them (no clicking needed)');
        console.log('Trackpad: Two-finger pan to look around, two-finger scroll to move');
        console.log('Crosshair will follow mouse cursor to show where you are pointing');
    }

    createWorld() {
        // Initialize infinite world generation
        this.generateInitialChunks();
        console.log('Infinite world generation initialized');
    }

    // Noise function for terrain generation
    noise(x, z, seed = this.worldGen.seed) {
        // Simple noise function (in real project, use proper noise library)
        let value = 0;
        let amplitude = this.worldGen.amplitude;
        let frequency = this.worldGen.frequency;

        for (let i = 0; i < this.worldGen.octaves; i++) {
            value += Math.sin((x + seed) * frequency) * Math.cos((z + seed) * frequency) * amplitude;
            amplitude *= 0.5;
            frequency *= 2;
        }

        return Math.floor(value);
    }

    generateInitialChunks() {
        // Generate chunks around spawn point (0, 0)
        const playerChunkX = Math.floor(this.player.position.x / this.worldGen.chunkSize);
        const playerChunkZ = Math.floor(this.player.position.z / this.worldGen.chunkSize);

        for (let cx = playerChunkX - this.worldGen.renderDistance; cx <= playerChunkX + this.worldGen.renderDistance; cx++) {
            for (let cz = playerChunkZ - this.worldGen.renderDistance; cz <= playerChunkZ + this.worldGen.renderDistance; cz++) {
                this.generateChunk(cx, cz);
            }
        }
    }

    generateChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;

        // Don't regenerate existing chunks
        if (this.worldGen.loadedChunks.has(chunkKey)) return;

        const startX = chunkX * this.worldGen.chunkSize;
        const startZ = chunkZ * this.worldGen.chunkSize;

        // Generate terrain for this chunk (optimized for performance)
        for (let x = startX; x < startX + this.worldGen.chunkSize; x++) {
            for (let z = startZ; z < startZ + this.worldGen.chunkSize; z++) {
                const height = this.noise(x, z);
                const biome = this.getBiome(x, z);

                // Generate fewer layers for better performance
                for (let y = Math.max(-5, height - 3); y <= height; y++) { // Reduced depth
                    let blockType = 'stone';

                    if (y === height) {
                        // Surface layer
                        blockType = this.getSurfaceBlock(biome, height);
                    } else if (y > height - 2) { // Reduced sub-surface layer
                        blockType = this.getSubSurfaceBlock(biome);
                    } else {
                        // Deep layer with fewer ores
                        blockType = this.getDeepBlock(y);
                    }

                    this.addBlock(x, y, z, blockType);
                }

                // Reduce decoration chance for better performance
                if (Math.random() < 0.02) { // Reduced from 0.05 to 0.02
                    this.generateDecoration(x, height + 1, z, biome);
                }
            }
        }

        this.worldGen.loadedChunks.set(chunkKey, true);
    }

    getBiome(x, z) {
        // Simple biome generation based on position
        const biomeNoise = Math.sin(x * 0.01) * Math.cos(z * 0.01);
        if (biomeNoise > 0.5) return 'mountains';
        if (biomeNoise > 0.2) return 'forest';
        if (biomeNoise < -0.3) return 'desert';
        if (biomeNoise < -0.1) return 'ocean';
        return 'plains';
    }

    getSurfaceBlock(biome, height) {
        switch (biome) {
            case 'desert': return 'sand';
            case 'ocean': return height < -2 ? 'water' : 'sand';
            case 'mountains': return height > 5 ? 'snow' : 'stone';
            case 'forest': return 'grass';
            default: return 'grass';
        }
    }

    getSubSurfaceBlock(biome) {
        switch (biome) {
            case 'desert': return 'sand';
            case 'ocean': return 'sand';
            default: return 'dirt';
        }
    }

    getDeepBlock(y) {
        // Add ores at deeper levels
        const rand = Math.random();
        if (y < -5) {
            if (rand < 0.005) return 'diamond';
            if (rand < 0.015) return 'gold';
            if (rand < 0.03) return 'iron';
            if (rand < 0.08) return 'coal';
        }
        return 'stone';
    }

    generateDecoration(x, y, z, biome) {
        switch (biome) {
            case 'forest':
                this.generateTree(x, y, z);
                break;
            case 'mountains':
                if (Math.random() < 0.3) {
                    this.addBlock(x, y, z, 'stone');
                }
                break;
            case 'desert':
                if (Math.random() < 0.1) {
                    // Simple cactus
                    for (let i = 0; i < 3; i++) {
                        this.addBlock(x, y + i, z, 'sand');
                    }
                }
                break;
        }
    }

    generateTree(x, y, z) {
        // Enhanced tree generation
        const height = 3 + Math.floor(Math.random() * 3);

        // Trunk
        for (let i = 0; i < height; i++) {
            this.addBlock(x, y + i, z, 'wood');
        }

        // Leaves
        const leafHeight = y + height;
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy <= 2; dy++) {
                    if (Math.abs(dx) + Math.abs(dz) + dy < 4 && Math.random() > 0.3) {
                        this.addBlock(x + dx, leafHeight + dy, z + dz, 'leaves');
                    }
                }
            }
        }
    }

    setupPlayer() {
        // Set initial camera position
        this.updateCamera();

        // Create highlight mesh for targeted blocks
        this.createHighlightMesh();

        // Start the game loop
        this.isRunning = true;
        this.gameLoop();

        console.log('Player ready');
    }

    createHighlightMesh() {
        // Create a wireframe box to highlight targeted blocks
        const geometry = new THREE.BoxGeometry(1.02, 1.02, 1.02); // Slightly larger than blocks
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        this.highlightMesh = new THREE.Mesh(geometry, material);
        this.highlightMesh.visible = false;
        this.scene.add(this.highlightMesh);
    }

    gameLoop() {
        if (!this.isRunning || this.isPaused) {
            if (this.isRunning) {
                requestAnimationFrame(() => this.gameLoop());
            }
            return;
        }

        // Performance monitoring
        const currentTime = performance.now();
        this.performance.frameCount++;

        if (currentTime - this.performance.lastFpsUpdate > 1000) { // Update FPS every second
            this.performance.fps = Math.round(this.performance.frameCount * 1000 / (currentTime - this.performance.lastFpsUpdate));
            this.performance.frameCount = 0;
            this.performance.lastFpsUpdate = currentTime;

            // Log performance occasionally
            if (this.performance.fps < 30) {
                console.warn(`Low FPS detected: ${this.performance.fps} FPS - Consider reducing render distance`);
            }
        }

        // Update player movement
        this.updatePlayer();

        // Update camera
        this.updateCamera();

        // Update block targeting
        this.updateBlockTargeting();

        // Update world generation (load new chunks as player moves)
        this.updateWorldGeneration();

        // Render scene
        this.renderer.render(this.scene, this.camera);

        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }

    updatePlayer() {
        const delta = 0.016; // Assume 60 FPS

        // Camera rotation with arrow keys
        if (this.keys['ArrowLeft']) {
            this.camera_rotation.y += this.camera_rotation.rotationSpeed;
        }
        if (this.keys['ArrowRight']) {
            this.camera_rotation.y -= this.camera_rotation.rotationSpeed;
        }
        if (this.keys['ArrowUp']) {
            this.camera_rotation.x += this.camera_rotation.rotationSpeed;
        }
        if (this.keys['ArrowDown']) {
            this.camera_rotation.x -= this.camera_rotation.rotationSpeed;
        }

        // Limit vertical camera rotation
        this.camera_rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera_rotation.x));

        // Movement input
        const moveVector = new THREE.Vector3();

        if (this.keys['KeyW']) moveVector.z -= 1;
        if (this.keys['KeyS']) moveVector.z += 1;
        if (this.keys['KeyA']) moveVector.x -= 1;
        if (this.keys['KeyD']) moveVector.x += 1;

        // Normalize and apply rotation
        if (moveVector.length() > 0) {
            moveVector.normalize();

            // Apply camera rotation to movement
            const rotationMatrix = new THREE.Matrix4();
            rotationMatrix.makeRotationY(this.camera_rotation.y);
            moveVector.applyMatrix4(rotationMatrix);

            // Apply speed and sprint (check both shift keys)
            const isRunning = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
            const speed = isRunning ? this.player.speed * 1.8 : this.player.speed;
            moveVector.multiplyScalar(speed * delta);

            this.player.position.add(moveVector);
        }

        // Simple gravity (no collision detection for now)
        if (!this.player.onGround) {
            this.player.velocity.y -= 25 * delta; // Gravity
        } else {
            this.player.velocity.y = 0;
        }

        this.player.position.y += this.player.velocity.y * delta;

        // Simple ground check (y = 0 is ground level)
        if (this.player.position.y <= 2) {
            this.player.position.y = 2;
            this.player.onGround = true;
            this.player.velocity.y = 0;
        } else {
            this.player.onGround = false;
        }
    }

    jump() {
        if (this.player.onGround) {
            this.player.velocity.y = this.player.jumpPower;
            this.player.onGround = false;
        }
    }

    updateCamera() {
        // Apply camera rotation
        this.camera.rotation.order = 'YXZ';
        this.camera.rotation.y = this.camera_rotation.y;
        this.camera.rotation.x = this.camera_rotation.x;

        // Update camera position to player position
        this.camera.position.copy(this.player.position);
    }

    addBlock(x, y, z, type = 'grass') {
        const key = `${x},${y},${z}`;

        // Don't add if block already exists
        if (this.world.blocks.has(key)) return;

        const blockInfo = this.blockTypes[type];
        if (!blockInfo) return; // Invalid block type

        // Create block geometry and material
        const geometry = new THREE.BoxGeometry(1, 1, 1);

        let material;
        if (blockInfo.transparent) {
            material = new THREE.MeshLambertMaterial({
                color: blockInfo.color,
                transparent: true,
                opacity: 0.7
            });
        } else if (blockInfo.glowing) {
            material = new THREE.MeshBasicMaterial({
                color: blockInfo.color,
                emissive: blockInfo.color,
                emissiveIntensity: 0.3
            });
        } else {
            material = new THREE.MeshLambertMaterial({
                color: blockInfo.color
            });
        }

        const block = new THREE.Mesh(geometry, material);
        block.position.set(x, y, z);

        // Only cast shadows if not transparent
        if (!blockInfo.transparent) {
            block.castShadow = true;
        }
        block.receiveShadow = true;

        // Store block with enhanced info
        this.world.blocks.set(key, {
            mesh: block,
            type,
            rarity: blockInfo.rarity || 'common',
            properties: blockInfo
        });
        this.scene.add(block);
    }

    removeBlock() {
        if (this.targetedBlock) {
            const { x, y, z } = this.targetedBlock.object.position;
            const key = `${x},${y},${z}`;

            const blockData = this.world.blocks.get(key);
            if (blockData) {
                this.scene.remove(blockData.mesh);
                this.world.blocks.delete(key);
                console.log(`Removed ${blockData.type} block at (${x}, ${y}, ${z})`);
            }
        }
    }

    placeBlock() {
        if (this.targetedBlock) {
            // Calculate position for new block
            const face = this.targetedBlock.face;
            const normal = face.normal;
            const position = this.targetedBlock.object.position.clone();
            position.add(normal);

            // Round to integer coordinates
            const x = Math.round(position.x);
            const y = Math.round(position.y);
            const z = Math.round(position.z);

            this.addBlock(x, y, z, this.selectedBlockType);
            console.log(`Placed ${this.selectedBlockType} block at (${x}, ${y}, ${z})`);
        }
    }

    getBlockIntersection() {
        // This method is now replaced by updateBlockTargeting()
        // but keeping for compatibility if needed elsewhere
        return this.targetedBlock;
    }

    setSelectedBlockType(type) {
        if (this.blockTypes[type]) {
            this.selectedBlockType = type;
            console.log(`Selected block type: ${this.blockTypes[type].name}`);
        }
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    destroy() {
        this.isRunning = false;
        if (this.renderer) {
            this.renderer.dispose();
        }
    }

    updateBlockTargeting() {
        // Cast ray from camera through mouse position
        this.raycaster.setFromCamera(new THREE.Vector2(this.mouse.x, this.mouse.y), this.camera);

        // Get all block meshes
        const blocks = Array.from(this.world.blocks.values()).map(b => b.mesh);
        const intersects = this.raycaster.intersectObjects(blocks);

        if (intersects.length > 0) {
            const targetBlock = intersects[0];
            this.targetedBlock = targetBlock;

            // Show highlight on the targeted block
            this.highlightMesh.position.copy(targetBlock.object.position);
            this.highlightMesh.visible = true;
        } else {
            this.targetedBlock = null;
            this.highlightMesh.visible = false;
        }
    }

    updateCrosshair(x, y) {
        // Move crosshair to follow mouse position
        if (this.crosshair) {
            this.crosshair.style.left = x + 'px';
            this.crosshair.style.top = y + 'px';
            this.crosshair.style.transform = 'translate(-50%, -50%)'; // Center the crosshair on cursor
        }
    }

    setupTrackpadControls() {
        // Two-finger pan for camera rotation (look around)
        this.canvas.addEventListener('wheel', (e) => {
            // Detect if this is a trackpad gesture (usually has smaller delta values and more frequent events)
            const isTrackpad = Math.abs(e.deltaY) < 50 && Math.abs(e.deltaX) < 50;

            if (isTrackpad) {
                e.preventDefault();

                // Two-finger horizontal scroll = camera Y rotation (left/right look)
                if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
                    this.camera_rotation.y -= e.deltaX * this.trackpad.panSensitivity;
                }

                // Two-finger vertical scroll = camera X rotation (up/down look)
                if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
                    this.camera_rotation.x -= e.deltaY * this.trackpad.panSensitivity;

                    // Limit vertical camera rotation
                    this.camera_rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera_rotation.x));
                }

                this.trackpad.lastTouchTime = Date.now();
            }
        }, { passive: false });

        // Touch events for more precise trackpad detection
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                this.trackpad.isScrolling = true;
                this.trackpad.startTouch = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };
            }
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.trackpad.isScrolling) {
                e.preventDefault();

                const currentTouch = {
                    x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
                    y: (e.touches[0].clientY + e.touches[1].clientY) / 2
                };

                if (this.trackpad.startTouch) {
                    const deltaX = currentTouch.x - this.trackpad.startTouch.x;
                    const deltaY = currentTouch.y - this.trackpad.startTouch.y;

                    // Camera rotation based on touch movement
                    this.camera_rotation.y -= deltaX * this.trackpad.panSensitivity * 0.5;
                    this.camera_rotation.x -= deltaY * this.trackpad.panSensitivity * 0.5;

                    // Limit vertical camera rotation
                    this.camera_rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera_rotation.x));

                    this.trackpad.startTouch = currentTouch;
                }
            }
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            if (e.touches.length < 2) {
                this.trackpad.isScrolling = false;
                this.trackpad.startTouch = null;
            }
        }, { passive: false });

        console.log('Trackpad controls enabled: Two-finger gestures for camera movement');
    }

    updateWorldGeneration() {
        // Throttle world generation checks (only check every 500ms)
        const now = Date.now();
        if (now - this.worldGen.lastChunkCheck < 500) {
            return;
        }
        this.worldGen.lastChunkCheck = now;

        // Check if player has moved to a new chunk
        const playerChunkX = Math.floor(this.player.position.x / this.worldGen.chunkSize);
        const playerChunkZ = Math.floor(this.player.position.z / this.worldGen.chunkSize);

        // Load chunks around player (limit to one new chunk per frame)
        let chunksGenerated = 0;
        for (let cx = playerChunkX - this.worldGen.renderDistance; cx <= playerChunkX + this.worldGen.renderDistance; cx++) {
            for (let cz = playerChunkZ - this.worldGen.renderDistance; cz <= playerChunkZ + this.worldGen.renderDistance; cz++) {
                const chunkKey = `${cx},${cz}`;
                if (!this.worldGen.loadedChunks.has(chunkKey)) {
                    if (chunksGenerated < this.worldGen.maxChunksPerFrame) {
                        this.generateChunk(cx, cz);
                        chunksGenerated++;
                    }
                }
            }
        }

        // Unload distant chunks to save memory (less aggressive)
        const maxDistance = this.worldGen.renderDistance + 3; // Increased buffer
        for (const [chunkKey] of this.worldGen.loadedChunks) {
            const [cx, cz] = chunkKey.split(',').map(Number);
            const distance = Math.max(Math.abs(cx - playerChunkX), Math.abs(cz - playerChunkZ));

            if (distance > maxDistance) {
                this.unloadChunk(cx, cz);
                break; // Only unload one chunk per frame
            }
        }
    }

    unloadChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const startX = chunkX * this.worldGen.chunkSize;
        const startZ = chunkZ * this.worldGen.chunkSize;

        let blocksRemoved = 0;

        // Remove blocks in this chunk with proper cleanup
        for (let x = startX; x < startX + this.worldGen.chunkSize; x++) {
            for (let z = startZ; z < startZ + this.worldGen.chunkSize; z++) {
                for (let y = -10; y <= 10; y++) { // Approximate height range
                    const blockKey = `${x},${y},${z}`;
                    const blockData = this.world.blocks.get(blockKey);
                    if (blockData) {
                        // Proper cleanup to prevent memory leaks
                        this.scene.remove(blockData.mesh);
                        blockData.mesh.geometry.dispose();
                        blockData.mesh.material.dispose();
                        this.world.blocks.delete(blockKey);
                        blocksRemoved++;
                    }
                }
            }
        }

        this.worldGen.loadedChunks.delete(chunkKey);
        console.log(`Unloaded chunk ${chunkKey} - removed ${blocksRemoved} blocks`);
    }
}