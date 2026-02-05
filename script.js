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
// Three.js 3D Rose - GLTF Model Version
// ==========================================
const ROSE_MODEL_URL = "https://threejs.org/examples/models/gltf/Flower/Flower.glb";
let scene, camera, renderer, roseModel, controls;
let isRoseClickable = true;
let roseHitTargets = [];

function initThreeJsRose() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera - nice view of the rose from slight angle
    camera = new THREE.PerspectiveCamera(
        50,
        roseCanvas.clientWidth / roseCanvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2.2, 6.5); // Start farther out
    
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
    controls.minDistance = 4;
    controls.maxDistance = 15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0.8, 0); // Look at the rose bloom
    controls.maxPolarAngle = Math.PI * 0.75;
    controls.minPolarAngle = Math.PI * 0.25;
    
    // Studio-quality lighting
    setupLighting();
    
    // Load realistic rose model (glTF)
    loadRoseModel();
    
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

function loadRoseModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
        ROSE_MODEL_URL,
        (gltf) => {
            if (roseModel) {
                scene.remove(roseModel);
            }

            roseModel = gltf.scene;
            prepareRoseModel(roseModel);
            scene.add(roseModel);
        },
        undefined,
        (error) => {
            console.error("Failed to load rose model:", error);
        }
    );
}

function prepareRoseModel(model) {
    // Normalize scale and center
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    model.position.sub(center);
    const scale = 2.6 / Math.max(size.y, 1e-3);
    model.scale.setScalar(scale);

    // Lift slightly so it sits nicely in view
    model.position.y += 0.6;

    // Improve material settings and collect hit targets
    roseHitTargets = [];
    const petalMaterial = new THREE.MeshStandardMaterial({
        color: 0xb11226, // deep rose red
        roughness: 0.6,
        metalness: 0.02,
        side: THREE.DoubleSide,
    });
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x2f5d2f,
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.DoubleSide,
    });
    model.traverse((child) => {
        if (!child.isMesh) return;

        child.castShadow = true;
        child.receiveShadow = true;

        // Always replace the material - detect leaf/stem by checking original color or name
        if (child.material) {
            let isLeafy = false;
            
            // Try to detect by original material color
            if (child.material.color) {
                const color = child.material.color;
                isLeafy = color.g > color.r && color.g > color.b;
            }
            
            // Also check mesh name for hints (common naming conventions)
            const nameLower = (child.name || '').toLowerCase();
            if (nameLower.includes('leaf') || nameLower.includes('stem') || nameLower.includes('green')) {
                isLeafy = true;
            }
            if (nameLower.includes('petal') || nameLower.includes('flower') || nameLower.includes('bloom')) {
                isLeafy = false;
            }
            
            // Replace material regardless of original type
            child.material = (isLeafy ? stemMaterial : petalMaterial).clone();
        }

        roseHitTargets.push(child);
    });

    frameRose(model);
}

function frameRose(model) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxSize = Math.max(size.x, size.y, size.z);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    // Increase multiplier significantly to zoom out more (was 1.4, now 2.5)
    const distance = (maxSize / (2 * Math.tan(fov / 2))) * 2.5;

    const direction = new THREE.Vector3(0, 0.25, 1).normalize();
    camera.position.copy(center.clone().add(direction.multiplyScalar(distance)));
    camera.near = distance / 100;
    camera.far = distance * 100;
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.update();
}

function createUltraRealisticRose() {
    const roseGroup = new THREE.Group();
    petalMeshes = [];
    
    // Deep red petal material
    const petalMaterial = new THREE.MeshStandardMaterial({
        color: 0x9b111e, // Deep red
        roughness: 0.6,
        metalness: 0.05,
        side: THREE.DoubleSide,
    });
    
    const innerPetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x722f37, // Darker burgundy for center
        roughness: 0.65,
        metalness: 0.05,
        side: THREE.DoubleSide,
    });
    
    // Create rose petals in concentric layers - spreading OUTWARD
    const layers = [
        // Inner tight petals (center bud)
        { count: 5, radius: 0.06, size: 0.22, tilt: 15, rise: 0.18, material: innerPetalMaterial },
        { count: 6, radius: 0.12, size: 0.28, tilt: 30, rise: 0.12, material: innerPetalMaterial },
        // Middle petals - opening up
        { count: 7, radius: 0.22, size: 0.35, tilt: 50, rise: 0.06, material: petalMaterial },
        { count: 8, radius: 0.34, size: 0.42, tilt: 65, rise: 0.0, material: petalMaterial },
        // Outer petals - fully open
        { count: 9, radius: 0.48, size: 0.48, tilt: 78, rise: -0.05, material: petalMaterial },
        { count: 10, radius: 0.64, size: 0.52, tilt: 88, rise: -0.10, material: petalMaterial },
        // Outermost - laying flat, slightly drooping
        { count: 11, radius: 0.82, size: 0.55, tilt: 95, rise: -0.14, material: petalMaterial },
    ];
    
    layers.forEach((layer, layerIdx) => {
        const angleOffset = layerIdx * 0.4; // Offset each layer
        
        for (let i = 0; i < layer.count; i++) {
            const petal = createSimplePetal(layer.size);
            petal.material = layer.material;
            
            // Position in a circle around center
            const angle = (i / layer.count) * Math.PI * 2 + angleOffset;
            
            petal.position.set(
                Math.cos(angle) * layer.radius,
                layer.rise,
                Math.sin(angle) * layer.radius
            );
            
            // Rotate petal to face outward and tilt based on layer
            // First rotate around Y to face outward from center
            petal.rotation.y = angle;
            // Then tilt the petal (X rotation) - higher tilt = more open/flat
            petal.rotation.x = THREE.MathUtils.degToRad(layer.tilt);
            // Small random Z rotation for natural variation
            petal.rotation.z = (Math.random() - 0.5) * 0.15;
            
            petalMeshes.push(petal);
            roseGroup.add(petal);
        }
    });
    
    // Create stem
    createRealisticStem(roseGroup);
    
    // Add sepals
    createSepals(roseGroup);
    
    roseGroup.position.y = 1.0;
    
    return roseGroup;
}

// Simple petal shape that looks like a rose petal
function createSimplePetal(size) {
    const shape = new THREE.Shape();
    
    // Draw a petal shape - wide in middle, pointed at base
    shape.moveTo(0, 0);
    shape.bezierCurveTo(
        size * 0.5, size * 0.2,   // control point 1
        size * 0.55, size * 0.6,  // control point 2
        size * 0.3, size          // end point (top right)
    );
    shape.bezierCurveTo(
        size * 0.15, size * 1.1,  // control point 1
        -size * 0.15, size * 1.1, // control point 2
        -size * 0.3, size         // end point (top left)
    );
    shape.bezierCurveTo(
        -size * 0.55, size * 0.6, // control point 1
        -size * 0.5, size * 0.2,  // control point 2
        0, 0                       // back to start
    );
    
    const geometry = new THREE.ShapeGeometry(shape, 12);
    
    // Add curve to the petal - curl backward at the top
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const x = positions.getX(i);
        // Curve backward based on height
        const curl = (y / size) * (y / size) * size * 0.3;
        // Also curve edges down slightly
        const edgeCurl = Math.abs(x) / size * 0.1 * y / size;
        positions.setZ(i, -curl - edgeCurl);
    }
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry);
}

function createRealisticStem(roseGroup) {
    // Simple curved stem
    const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.15, 0),
        new THREE.Vector3(0.02, -0.8, 0.02),
        new THREE.Vector3(-0.02, -1.5, -0.01),
        new THREE.Vector3(0.03, -2.2, 0.01),
        new THREE.Vector3(0, -3.0, 0)
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
    const sepalMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5a2d,
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.DoubleSide,
    });
    
    // Sepals at base of rose - pointing outward and down
    for (let i = 0; i < 5; i++) {
        const sepal = createSepal();
        sepal.material = sepalMaterial;
        const angle = (i / 5) * Math.PI * 2 + 0.2;
        sepal.position.set(
            Math.cos(angle) * 0.15,
            -0.12,
            Math.sin(angle) * 0.15
        );
        sepal.rotation.y = angle;
        sepal.rotation.x = Math.PI * 0.55; // Point outward/down
        sepal.rotation.z = (Math.random() - 0.5) * 0.1;
        sepal.scale.set(1.2, 1.4, 1);
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
    
    const targets = roseHitTargets.length > 0 ? roseHitTargets : (roseModel ? [roseModel] : []);
    const intersects = raycaster.intersectObjects(targets, true);
    
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
    
    // Gentle rotation for the rose model
    if (roseModel) {
        roseModel.rotation.y += 0.002;
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
