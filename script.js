// ==========================================
// Valentine's Day Website - Interactive Script
// ==========================================

// DOM Elements
const questionScreen = document.getElementById('questionScreen');
const roseScreen = document.getElementById('roseScreen');
const messageScreen = document.getElementById('messageScreen');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const heartsContainer = document.getElementById('heartsContainer');
const confettiContainer = document.getElementById('confettiContainer');
const roseCanvas = document.getElementById('roseCanvas');

// ==========================================
// Floating Hearts Background
// ==========================================
function createFloatingHearts() {
    const hearts = ['❤️', '💕', '💗', '💖', '💘', '💝'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDuration = (5 + Math.random() * 5) + 's';
            heart.style.animationDelay = Math.random() * 5 + 's';
            heart.style.fontSize = (15 + Math.random() * 20) + 'px';
            heartsContainer.appendChild(heart);
            
            // Remove and recreate after animation
            setTimeout(() => {
                heart.remove();
            }, 15000);
        }, i * 500);
    }
    
    // Keep creating hearts
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (5 + Math.random() * 5) + 's';
        heart.style.fontSize = (15 + Math.random() * 20) + 'px';
        heartsContainer.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 10000);
    }, 800);
}

// ==========================================
// Escaping "No" Button
// ==========================================
function initEscapingButton() {
    const escapeDistance = 120; // Distance at which button escapes
    
    // Track mouse position globally
    document.addEventListener('mousemove', (e) => {
        if (!noBtn || questionScreen.style.display === 'none') return;
        
        const rect = noBtn.getBoundingClientRect();
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        
        const distance = Math.sqrt(
            Math.pow(e.clientX - btnCenterX, 2) + 
            Math.pow(e.clientY - btnCenterY, 2)
        );
        
        if (distance < escapeDistance) {
            escapeButton();
        }
    });
    
    // Also escape on touch for mobile
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        escapeButton();
    });
}

function escapeButton() {
    const padding = 100; // Keep away from edges
    const maxX = window.innerWidth - noBtn.offsetWidth - padding;
    const maxY = window.innerHeight - noBtn.offsetHeight - padding;
    
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 10;
    
    // Find a position away from current mouse position
    do {
        newX = padding + Math.random() * maxX;
        newY = padding + Math.random() * maxY;
        attempts++;
    } while (attempts < maxAttempts && isNearYesButton(newX, newY));
    
    noBtn.classList.add('escaping');
    noBtn.style.position = 'fixed';
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';
    
    // Small visual feedback
    noBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
        noBtn.style.transform = 'scale(1)';
        noBtn.classList.remove('escaping');
    }, 100);
}

function isNearYesButton(x, y) {
    const yesRect = yesBtn.getBoundingClientRect();
    const distance = Math.sqrt(
        Math.pow(x - yesRect.left, 2) + 
        Math.pow(y - yesRect.top, 2)
    );
    return distance < 150;
}

// ==========================================
// Screen Transitions
// ==========================================
function transitionToScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    fromScreen.classList.add('fade-out');
    
    setTimeout(() => {
        fromScreen.style.display = 'none';
        fromScreen.classList.remove('fade-out');
        toScreen.style.display = 'flex';
        toScreen.classList.add('active', 'fade-in');
        
        setTimeout(() => {
            toScreen.classList.remove('fade-in');
        }, 800);
    }, 500);
}

// ==========================================
// Yes Button Click - Show Rose
// ==========================================
yesBtn.addEventListener('click', () => {
    transitionToScreen(questionScreen, roseScreen);
    setTimeout(() => {
        initThreeJsRose();
    }, 300);
});

// ==========================================
// Three.js 3D Rose - Ultra Realistic Version
// ==========================================
let scene, camera, renderer, rose, controls;
let isRoseClickable = true;
let petalMeshes = []; // Store for animation

function initThreeJsRose() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera - good view of the rose
    camera = new THREE.PerspectiveCamera(
        45,
        roseCanvas.clientWidth / roseCanvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1.5, 4.5); // Balanced angle
    
    // Renderer with maximum quality
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(roseCanvas.clientWidth, roseCanvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    roseCanvas.appendChild(renderer.domElement);
    
    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.8;
    controls.target.set(0, 0.5, 0); // Center on the rose
    controls.maxPolarAngle = Math.PI * 0.7;
    controls.minPolarAngle = Math.PI * 0.2;
    
    // Studio-quality lighting
    setupLighting();
    
    // Create the rose
    rose = createUltraRealisticRose();
    scene.add(rose);
    
    // Add dew drops
    addDewDrops(rose);
    
    // Add floating particles
    createParticles();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Rose click detection
    renderer.domElement.addEventListener('click', onRoseClick);
    
    // Animation loop
    animate();
}

function setupLighting() {
    // Soft warm ambient light
    const ambientLight = new THREE.AmbientLight(0xfffaf0, 0.4);
    scene.add(ambientLight);
    
    // Main key light - warm white from above-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);
    
    // Fill light - soft warm from the side
    const fillLight = new THREE.DirectionalLight(0xfff8f0, 0.4);
    fillLight.position.set(-4, 2, 2);
    scene.add(fillLight);
    
    // Back/rim light - creates edge definition
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 2, -4);
    scene.add(rimLight);
    
    // Under light - soft bounce
    const bounceLight = new THREE.DirectionalLight(0xfff5f0, 0.2);
    bounceLight.position.set(0, -2, 2);
    scene.add(bounceLight);
    
    // Subtle accent light for depth
    const accentLight = new THREE.PointLight(0xffeedd, 0.4, 8);
    accentLight.position.set(1, 2, 2);
    scene.add(accentLight);
}

function createUltraRealisticRose() {
    const roseGroup = new THREE.Group();
    petalMeshes = [];
    
    // Golden angle for natural petal arrangement (137.5 degrees)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    
    // FULLY OPEN BLOOM - natural sized petals, proper red color
    const layers = [
        // Tight center bud
        { count: 4, baseRadius: 0.03, height: 0.18, width: 0.10, curl: 0.15, yOffset: 0.12, openAngle: 0.3, colorIndex: 0 },
        // Inner petals - slightly open
        { count: 5, baseRadius: 0.08, height: 0.28, width: 0.18, curl: 0.25, yOffset: 0.08, openAngle: 0.5, colorIndex: 0 },
        // Inner-mid petals
        { count: 6, baseRadius: 0.14, height: 0.38, width: 0.26, curl: 0.35, yOffset: 0.03, openAngle: 0.75, colorIndex: 1 },
        // Middle petals - opening up
        { count: 7, baseRadius: 0.22, height: 0.48, width: 0.34, curl: 0.45, yOffset: -0.02, openAngle: 1.0, colorIndex: 1 },
        // Mid-outer petals
        { count: 8, baseRadius: 0.32, height: 0.55, width: 0.42, curl: 0.55, yOffset: -0.06, openAngle: 1.2, colorIndex: 2 },
        // Outer petals - wide open
        { count: 9, baseRadius: 0.42, height: 0.62, width: 0.50, curl: 0.65, yOffset: -0.10, openAngle: 1.4, colorIndex: 2 },
        // Outermost petals - fully open, curling back
        { count: 10, baseRadius: 0.54, height: 0.68, width: 0.56, curl: 0.75, yOffset: -0.13, openAngle: 1.55, colorIndex: 3 },
        // Edge petals - laying open
        { count: 11, baseRadius: 0.66, height: 0.72, width: 0.60, curl: 0.85, yOffset: -0.16, openAngle: 1.7, colorIndex: 3 },
    ];
    
    // Color palette - DEEP RED colors (not pink)
    const petalColors = [
        { base: 0x4a0a0f, edge: 0x6b0f18 }, // Very deep burgundy center
        { base: 0x6b0f18, edge: 0x8b1520 }, // Deep burgundy
        { base: 0x8b1520, edge: 0xa01828 }, // Rich red
        { base: 0xa01828, edge: 0xb01e30 }, // Classic rose red
    ];
    
    let petalIndex = 0;
    
    layers.forEach((layer, layerIdx) => {
        const colors = petalColors[layer.colorIndex];
        
        for (let i = 0; i < layer.count; i++) {
            const petal = createUltraRealisticPetal(
                layer.width,
                layer.height,
                layer.curl,
                colors.base,
                colors.edge,
                layer.openAngle
            );
            
            // Golden angle spiral with layer offset
            const angle = petalIndex * goldenAngle + layerIdx * 0.4;
            const radiusVariation = 1 + (Math.random() - 0.5) * 0.12;
            const radius = layer.baseRadius * radiusVariation;
            
            petal.position.set(
                Math.cos(angle) * radius,
                layer.yOffset + (Math.random() - 0.5) * 0.015,
                Math.sin(angle) * radius
            );
            
            // Petal rotation - faces outward from center, tilts based on openAngle
            // Positive X rotation tilts petal backward (open), negative tilts forward (closed)
            const tiltBack = layer.openAngle + (Math.random() - 0.5) * 0.1;
            petal.rotation.set(
                -Math.PI/2 + tiltBack,  // Start facing up, then tilt back by openAngle
                angle,                    // Face outward from center
                (Math.random() - 0.5) * 0.1
            );
            
            // Natural scale variation
            const scaleVar = 0.94 + Math.random() * 0.12;
            petal.scale.set(scaleVar, scaleVar, 1);
            
            petalMeshes.push(petal);
            roseGroup.add(petal);
            petalIndex++;
        }
    });
    
    // Create realistic stem
    createRealisticStem(roseGroup);
    
    // Add sepals
    createSepals(roseGroup);
    
    roseGroup.position.y = 1.2; // Position rose nicely in view
    
    return roseGroup;
}

function createUltraRealisticPetal(width, height, curlAmount, baseColor, edgeColor, openAngle) {
    const segmentsU = 24;
    const segmentsV = 32;
    
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const colors = [];
    const uvs = [];
    const indices = [];
    
    const baseCol = new THREE.Color(baseColor);
    const edgeCol = new THREE.Color(edgeColor);
    
    for (let j = 0; j <= segmentsV; j++) {
        for (let i = 0; i <= segmentsU; i++) {
            const u = i / segmentsU;
            const v = j / segmentsV;
            
            // WIDE OPEN petal shape - fuller and rounder
            // Widest in the middle-upper area for open bloom look
            const baseWidth = Math.pow(Math.sin(v * Math.PI * 0.9 + 0.1), 0.6);
            const topRounding = v > 0.8 ? Math.cos((v - 0.8) / 0.2 * Math.PI / 2) : 1;
            const petalWidth = baseWidth * topRounding * width;
            
            // X position with natural asymmetry
            const asymmetry = 1 + Math.sin(v * Math.PI * 1.5) * 0.04;
            const x = (u - 0.5) * petalWidth * asymmetry;
            
            // Y is height along petal
            const y = v * height;
            
            // Z - DRAMATIC curl for open bloom
            const edgeDist = Math.abs(u - 0.5) * 2;
            const heightProgress = v;
            
            // Strong backward curl - makes petals curve back dramatically
            const curlBase = heightProgress * heightProgress * curlAmount * 0.7;
            
            // Edge curl - edges curl back more
            const edgeCurl = edgeDist * edgeDist * curlAmount * 0.4 * heightProgress;
            
            // Center valley - creates natural petal cupping
            const centerValley = (1 - edgeDist * edgeDist) * Math.sin(v * Math.PI) * 0.08;
            
            // Natural waviness at edges - more pronounced for open petals
            const waveFreq = 3;
            const waviness = Math.sin(v * Math.PI * waveFreq + u * 2) * edgeDist * 0.025;
            
            // Combine - negative z curves backward (outward when petal is tilted)
            const z = -(curlBase + edgeCurl) + centerValley + waviness;
            
            vertices.push(x, y, z);
            uvs.push(u, v);
            
            // Color gradient - darker at base, lighter at edges and top
            const colorMix = Math.max(edgeDist * 0.5, heightProgress * 0.5);
            const vertexColor = baseCol.clone().lerp(edgeCol, colorMix);
            
            // Add subtle color variation for natural look
            const variation = (Math.random() - 0.5) * 0.04;
            vertexColor.r = Math.max(0, Math.min(1, vertexColor.r + variation));
            vertexColor.g = Math.max(0, Math.min(1, vertexColor.g + variation * 0.5));
            vertexColor.b = Math.max(0, Math.min(1, vertexColor.b + variation * 0.5));
            
            colors.push(vertexColor.r, vertexColor.g, vertexColor.b);
        }
    }
    
    // Create indices
    for (let j = 0; j < segmentsV; j++) {
        for (let i = 0; i < segmentsU; i++) {
            const a = j * (segmentsU + 1) + i;
            const b = a + 1;
            const c = a + segmentsU + 1;
            const d = c + 1;
            
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Realistic rose petal material - velvety red
    const material = new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.7,  // More matte, velvety
        metalness: 0.0,
        clearcoat: 0.05, // Very subtle sheen
        clearcoatRoughness: 0.5,
        side: THREE.DoubleSide,
    });
    
    return new THREE.Mesh(geometry, material);
}

function createRealisticStem(roseGroup) {
    // Natural curved stem path
    const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.20, 0),
        new THREE.Vector3(0.03, -0.7, 0.02),
        new THREE.Vector3(-0.02, -1.3, -0.02),
        new THREE.Vector3(0.04, -1.9, 0.02),
        new THREE.Vector3(0.01, -2.5, -0.01),
        new THREE.Vector3(-0.02, -3.1, 0.01),
        new THREE.Vector3(0, -3.7, 0)
    ]);
    
    // Stem geometry with varying thickness
    const stemGeometry = new THREE.TubeGeometry(stemCurve, 32, 0.045, 12, false);
    
    // Adjust radius along stem - thicker near rose
    const positions = stemGeometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const normalizedY = (y + 3.8) / 3.45; // 0 at bottom, 1 at top
        const radiusScale = 0.8 + normalizedY * 0.4;
        const x = positions.getX(i);
        const z = positions.getZ(i);
        const dist = Math.sqrt(x * x + z * z);
        if (dist > 0.01) {
            positions.setX(i, (x / dist) * dist * radiusScale);
            positions.setZ(i, (z / dist) * dist * radiusScale);
        }
    }
    stemGeometry.computeVertexNormals();
    
    const stemMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2d5a27,
        roughness: 0.75,
        metalness: 0.0,
        clearcoat: 0.1,
    });
    
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    roseGroup.add(stem);
    
    // Add thorns
    const thornMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x4a7a44,
        roughness: 0.6,
    });
    
    const thornPositions = [0.15, 0.35, 0.55, 0.75];
    thornPositions.forEach((t, i) => {
        const thorn = createThorn();
        thorn.material = thornMaterial;
        const pos = stemCurve.getPoint(t);
        const tangent = stemCurve.getTangent(t);
        thorn.position.copy(pos);
        
        // Point thorns outward and slightly downward
        const side = i % 2 === 0 ? 1 : -1;
        thorn.rotation.z = side * 0.9;
        thorn.rotation.y = i * 1.5 + 0.5;
        thorn.rotation.x = 0.2;
        thorn.scale.set(1, 1 + Math.random() * 0.3, 1);
        roseGroup.add(thorn);
    });
    
    // Add leaves
    const leafMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3a7d44,
        roughness: 0.6,
        metalness: 0.0,
        side: THREE.DoubleSide,
        clearcoat: 0.2,
    });
    
    const leafConfigs = [
        { t: 0.25, side: 1, scale: 0.9, rotation: 0.3 },
        { t: 0.50, side: -1, scale: 1.1, rotation: -0.2 },
        { t: 0.70, side: 1, scale: 0.8, rotation: 0.4 },
    ];
    
    leafConfigs.forEach((config) => {
        const leafGroup = createCompoundLeaf();
        leafGroup.traverse(child => {
            if (child.isMesh) child.material = leafMaterial;
        });
        
        const pos = stemCurve.getPoint(config.t);
        leafGroup.position.copy(pos);
        leafGroup.rotation.y = config.side > 0 ? config.rotation : Math.PI + config.rotation;
        leafGroup.rotation.z = config.side * 0.5;
        leafGroup.scale.setScalar(config.scale);
        roseGroup.add(leafGroup);
    });
}

function createThorn() {
    const geometry = new THREE.ConeGeometry(0.018, 0.12, 6);
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, 0.05);
    return new THREE.Mesh(geometry);
}

function createCompoundLeaf() {
    const group = new THREE.Group();
    
    // Main stem
    const stemGeo = new THREE.CylinderGeometry(0.012, 0.018, 0.5, 6);
    const leafStem = new THREE.Mesh(stemGeo);
    leafStem.rotation.z = Math.PI / 2;
    leafStem.position.x = 0.25;
    group.add(leafStem);
    
    // Rose leaves come in groups of 3-5 leaflets
    const leafletConfigs = [
        { x: 0.55, y: 0, scale: 1.0, rotation: 0 },        // Terminal leaflet (largest)
        { x: 0.35, y: 0.08, scale: 0.7, rotation: 0.3 },   // Upper pair
        { x: 0.35, y: -0.08, scale: 0.7, rotation: -0.3 },
        { x: 0.18, y: 0.06, scale: 0.5, rotation: 0.4 },   // Lower pair
        { x: 0.18, y: -0.06, scale: 0.5, rotation: -0.4 },
    ];
    
    leafletConfigs.forEach(config => {
        const leaflet = createRoseLeaflet(0.12 * config.scale, 0.22 * config.scale);
        leaflet.position.set(config.x, config.y, 0);
        leaflet.rotation.z = config.rotation;
        leaflet.rotation.x = -0.1;
        group.add(leaflet);
    });
    
    return group;
}

function createRoseLeaflet(width, height) {
    const shape = new THREE.Shape();
    const serrations = 6;
    
    shape.moveTo(0, 0);
    
    // Right side with serrations
    for (let i = 0; i <= serrations; i++) {
        const t = i / serrations;
        const baseX = Math.sin(t * Math.PI) * width;
        const y = t * height;
        
        if (i < serrations) {
            // Serration peak
            const peakT = (i + 0.5) / serrations;
            const peakX = Math.sin(peakT * Math.PI) * width * 1.08;
            const peakY = (t + 0.5 / serrations) * height;
            shape.lineTo(peakX, peakY);
        }
        shape.lineTo(baseX, y);
    }
    
    // Top point
    shape.lineTo(0, height * 1.05);
    
    // Left side with serrations
    for (let i = serrations; i >= 0; i--) {
        const t = i / serrations;
        const baseX = -Math.sin(t * Math.PI) * width;
        const y = t * height;
        
        shape.lineTo(baseX, y);
        if (i > 0) {
            const peakT = (i - 0.5) / serrations;
            const peakX = -Math.sin(peakT * Math.PI) * width * 1.08;
            const peakY = (t - 0.5 / serrations) * height;
            shape.lineTo(peakX, peakY);
        }
    }
    
    const geometry = new THREE.ShapeGeometry(shape, 16);
    
    // Add natural curve
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i);
        const y = positions.getY(i);
        const curve = Math.sin((y / height) * Math.PI) * 0.03;
        const fold = Math.abs(x) / width * 0.02;
        positions.setZ(i, curve - fold);
    }
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry);
}

function createSepals(roseGroup) {
    const sepalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3d7a3d,
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.DoubleSide,
    });
    
    // Sepals at base of rose
    for (let i = 0; i < 5; i++) {
        const sepal = createSepal();
        sepal.material = sepalMaterial;
        const angle = (i / 5) * Math.PI * 2 + 0.15;
        sepal.position.set(
            Math.cos(angle) * 0.12,
            -0.18,
            Math.sin(angle) * 0.12
        );
        sepal.rotation.set(0.9 + Math.random() * 0.2, angle, (Math.random() - 0.5) * 0.15);
        sepal.scale.set(0.8, 1.0, 1);
        roseGroup.add(sepal);
    }
}

function createSepal() {
    const shape = new THREE.Shape();
    
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.10, 0.15, 0.08, 0.40);
    shape.quadraticCurveTo(0.06, 0.55, 0.02, 0.65);
    shape.lineTo(0, 0.70);
    shape.lineTo(-0.02, 0.65);
    shape.quadraticCurveTo(-0.06, 0.55, -0.08, 0.40);
    shape.quadraticCurveTo(-0.10, 0.15, 0, 0);
    
    const geometry = new THREE.ShapeGeometry(shape, 12);
    
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        positions.setZ(i, -y * y * 0.5);
    }
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry);
}

function addDewDrops(roseGroup) {
    const dewMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.0,
        metalness: 0.0,
        transmission: 0.95,
        thickness: 0.5,
        ior: 1.33,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.9,
    });
    
    // Add dew drops to some petals
    const dropCount = 8;
    for (let i = 0; i < dropCount; i++) {
        const size = 0.015 + Math.random() * 0.02;
        const dropGeo = new THREE.SphereGeometry(size, 12, 12);
        // Flatten slightly for water drop shape
        dropGeo.scale(1, 0.6, 1);
        
        const drop = new THREE.Mesh(dropGeo, dewMaterial);
        
        // Position on random petal
        if (petalMeshes.length > 0) {
            const petalIdx = Math.floor(Math.random() * Math.min(petalMeshes.length, 30));
            const petal = petalMeshes[petalIdx];
            
            // Random position on petal surface
            const u = 0.2 + Math.random() * 0.6;
            const v = 0.3 + Math.random() * 0.5;
            
            drop.position.set(
                petal.position.x + (Math.random() - 0.5) * 0.15,
                petal.position.y + v * 0.3,
                petal.position.z + (Math.random() - 0.5) * 0.1
            );
            
            roseGroup.add(drop);
        }
    }
}

// Particle system for magical sparkles
let particles;

function createParticles() {
    const particleCount = 150;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const colorOptions = [
        new THREE.Color(0xff69b4), // Hot pink
        new THREE.Color(0xffc0cb), // Pink
        new THREE.Color(0xffe4e1), // Misty rose
        new THREE.Color(0xffb6c1), // Light pink
        new THREE.Color(0xffffff), // White sparkle
        new THREE.Color(0xffddee), // Soft pink white
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Concentrate particles around the rose
        const radius = 1.5 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        const phi = 0.3 + Math.random() * 2.4; // Avoid top and bottom
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = (Math.random() - 0.3) * 4 + 1; // Center around rose
        positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
        
        sizes[i] = 0.03 + Math.random() * 0.06;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.06,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
}

function onWindowResize() {
    camera.aspect = roseCanvas.clientWidth / roseCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(roseCanvas.clientWidth, roseCanvas.clientHeight);
}

function onRoseClick(event) {
    if (!isRoseClickable) return;
    
    // Raycasting to detect click on rose
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(rose.children, true);
    
    if (intersects.length > 0) {
        isRoseClickable = false;
        showMessage();
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Update controls
    controls.update();
    
    // Subtle petal breathing animation
    if (petalMeshes && petalMeshes.length > 0) {
        petalMeshes.forEach((petal, i) => {
            // Very subtle rotation oscillation
            const baseRotX = petal.userData.baseRotX || petal.rotation.x;
            const baseRotZ = petal.userData.baseRotZ || petal.rotation.z;
            
            if (!petal.userData.baseRotX) {
                petal.userData.baseRotX = petal.rotation.x;
                petal.userData.baseRotZ = petal.rotation.z;
                petal.userData.phase = Math.random() * Math.PI * 2;
            }
            
            // Gentle swaying motion
            const sway = Math.sin(time * 0.5 + petal.userData.phase) * 0.008;
            const breathe = Math.sin(time * 0.3 + i * 0.1) * 0.005;
            
            petal.rotation.x = baseRotX + sway;
            petal.rotation.z = baseRotZ + breathe;
        });
    }
    
    // Animate particles with sparkle effect
    if (particles) {
        particles.rotation.y += 0.0008;
        const positions = particles.geometry.attributes.position.array;
        const colors = particles.geometry.attributes.color.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            // Gentle floating motion
            positions[i + 1] += Math.sin(time + i) * 0.001;
            
            // Sparkle effect - vary brightness
            const sparkle = 0.7 + Math.sin(time * 3 + i * 0.5) * 0.3;
            colors[i] = Math.min(1, colors[i] * sparkle + 0.1);
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.color.needsUpdate = true;
    }
    
    renderer.render(scene, camera);
}

// ==========================================
// Message Reveal with Confetti
// ==========================================
function showMessage() {
    transitionToScreen(roseScreen, messageScreen);
    
    // Trigger confetti
    setTimeout(() => {
        createConfetti();
    }, 500);
}

function createConfetti() {
    const confettiCount = 50;
    const emojis = ['❤️', '💕', '💗', '💖', '💘', '💝', '✨', '🌹'];
    
    for (let i = 0; i < confettiCount; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
            confetti.style.animationDelay = Math.random() * 0.5 + 's';
            confetti.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
            confettiContainer.appendChild(confetti);
            
            // Remove after animation
            setTimeout(() => {
                confetti.remove();
            }, 6000);
        }, i * 50);
    }
    
    // Second wave
    setTimeout(() => {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.className = 'confetti';
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.animationDuration = (3 + Math.random() * 2) + 's';
                confetti.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
                confettiContainer.appendChild(confetti);
                
                setTimeout(() => {
                    confetti.remove();
                }, 6000);
            }, i * 80);
        }
    }, 1500);
}

// ==========================================
// Initialize Everything
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    initEscapingButton();
    
    // Position the No button initially
    noBtn.style.position = 'relative';
});
