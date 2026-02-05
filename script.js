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
// Three.js 3D Rose - Realistic Version
// ==========================================
let scene, camera, renderer, rose, controls;
let isRoseClickable = true;

function initThreeJsRose() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera - closer view for detail
    camera = new THREE.PerspectiveCamera(
        45,
        roseCanvas.clientWidth / roseCanvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1, 6);
    
    // Renderer with better quality
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
    renderer.toneMappingExposure = 1.2;
    roseCanvas.appendChild(renderer.domElement);
    
    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 12;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.target.set(0, 0, 0);
    
    // Enhanced Lighting for realistic look
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 0.4);
    scene.add(ambientLight);
    
    // Key light - warm
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);
    
    // Fill light - soft pink
    const fillLight = new THREE.DirectionalLight(0xffb6c1, 0.5);
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);
    
    // Rim light - adds depth
    const rimLight = new THREE.DirectionalLight(0xff69b4, 0.6);
    rimLight.position.set(0, -3, -5);
    scene.add(rimLight);
    
    // Accent lights for rose glow
    const accentLight1 = new THREE.PointLight(0xff1744, 0.8, 10);
    accentLight1.position.set(2, 2, 2);
    scene.add(accentLight1);
    
    const accentLight2 = new THREE.PointLight(0xf50057, 0.6, 10);
    accentLight2.position.set(-2, 1, 2);
    scene.add(accentLight2);
    
    // Create the rose
    rose = createRealisticRose();
    scene.add(rose);
    
    // Add floating particles
    createParticles();
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
    
    // Rose click detection
    renderer.domElement.addEventListener('click', onRoseClick);
    
    // Animation loop
    animate();
}

function createRealisticRose() {
    const roseGroup = new THREE.Group();
    
    // Create realistic petal materials with gradient effect
    const createPetalMaterial = (baseColor, darkerColor) => {
        return new THREE.MeshPhysicalMaterial({
            color: baseColor,
            roughness: 0.5,
            metalness: 0.0,
            clearcoat: 0.3,
            clearcoatRoughness: 0.4,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
        });
    };
    
    // Different shades for depth
    const innerPetalMat = createPetalMaterial(0x8b0000, 0x4a0000);
    const midPetalMat = createPetalMaterial(0xb22222, 0x8b0000);
    const outerPetalMat = createPetalMaterial(0xdc143c, 0xb22222);
    const edgePetalMat = createPetalMaterial(0xe91e63, 0xc2185b);
    
    // Inner tight spiral petals (the bud center)
    for (let i = 0; i < 8; i++) {
        const petal = createRealisticPetal(0.4, 0.6, 0.15);
        petal.material = innerPetalMat;
        const angle = (i / 8) * Math.PI * 2 + Math.random() * 0.3;
        const spiralOffset = i * 0.04;
        petal.position.set(
            Math.cos(angle) * (0.05 + spiralOffset),
            0.4 - i * 0.03,
            Math.sin(angle) * (0.05 + spiralOffset)
        );
        petal.rotation.set(-0.2 - i * 0.05, angle + Math.PI, (Math.random() - 0.5) * 0.1);
        petal.scale.set(0.6 + i * 0.05, 0.6 + i * 0.05, 1);
        roseGroup.add(petal);
    }
    
    // Layer 1 - tight inner petals
    for (let i = 0; i < 5; i++) {
        const petal = createRealisticPetal(0.7, 0.9, 0.3);
        petal.material = innerPetalMat;
        const angle = (i / 5) * Math.PI * 2 + 0.3;
        petal.position.set(
            Math.cos(angle) * 0.15,
            0.25,
            Math.sin(angle) * 0.15
        );
        petal.rotation.set(-0.5, angle + Math.PI, (Math.random() - 0.5) * 0.15);
        roseGroup.add(petal);
    }
    
    // Layer 2
    for (let i = 0; i < 6; i++) {
        const petal = createRealisticPetal(0.9, 1.1, 0.5);
        petal.material = midPetalMat;
        const angle = (i / 6) * Math.PI * 2 + 0.5;
        petal.position.set(
            Math.cos(angle) * 0.25,
            0.1,
            Math.sin(angle) * 0.25
        );
        petal.rotation.set(-0.7, angle + Math.PI, (Math.random() - 0.5) * 0.2);
        roseGroup.add(petal);
    }
    
    // Layer 3
    for (let i = 0; i < 7; i++) {
        const petal = createRealisticPetal(1.1, 1.3, 0.7);
        petal.material = midPetalMat;
        const angle = (i / 7) * Math.PI * 2 + 0.1;
        petal.position.set(
            Math.cos(angle) * 0.35,
            -0.05,
            Math.sin(angle) * 0.35
        );
        petal.rotation.set(-0.9, angle + Math.PI, (Math.random() - 0.5) * 0.2);
        roseGroup.add(petal);
    }
    
    // Layer 4 - outer petals starting to open
    for (let i = 0; i < 8; i++) {
        const petal = createRealisticPetal(1.3, 1.5, 0.9);
        petal.material = outerPetalMat;
        const angle = (i / 8) * Math.PI * 2 + 0.4;
        petal.position.set(
            Math.cos(angle) * 0.5,
            -0.2,
            Math.sin(angle) * 0.5
        );
        petal.rotation.set(-1.1 + (Math.random() * 0.2), angle + Math.PI, (Math.random() - 0.5) * 0.25);
        roseGroup.add(petal);
    }
    
    // Layer 5 - wide open outer petals
    for (let i = 0; i < 9; i++) {
        const petal = createRealisticPetal(1.4, 1.6, 1.1);
        petal.material = outerPetalMat;
        const angle = (i / 9) * Math.PI * 2 + 0.2;
        petal.position.set(
            Math.cos(angle) * 0.65,
            -0.35,
            Math.sin(angle) * 0.65
        );
        petal.rotation.set(-1.3 + (Math.random() * 0.3), angle + Math.PI, (Math.random() - 0.5) * 0.3);
        roseGroup.add(petal);
    }
    
    // Layer 6 - outermost petals, some curling back
    for (let i = 0; i < 10; i++) {
        const petal = createRealisticPetal(1.5, 1.7, 1.3);
        petal.material = edgePetalMat;
        const angle = (i / 10) * Math.PI * 2;
        petal.position.set(
            Math.cos(angle) * 0.8,
            -0.5,
            Math.sin(angle) * 0.8
        );
        petal.rotation.set(-1.5 + (Math.random() * 0.4), angle + Math.PI, (Math.random() - 0.5) * 0.35);
        roseGroup.add(petal);
    }
    
    // Stem with slight curve
    const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.6, 0),
        new THREE.Vector3(0.05, -1.5, 0.02),
        new THREE.Vector3(-0.02, -2.5, -0.01),
        new THREE.Vector3(0.03, -3.5, 0.02),
        new THREE.Vector3(0, -4.5, 0)
    ]);
    
    const stemGeometry = new THREE.TubeGeometry(stemCurve, 20, 0.06, 8, false);
    const stemMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2d5a27,
        roughness: 0.7,
        metalness: 0.0,
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    roseGroup.add(stem);
    
    // Add thorns
    const thornMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3d6a37,
        roughness: 0.6,
    });
    
    for (let i = 0; i < 4; i++) {
        const thorn = createThorn();
        thorn.material = thornMaterial;
        const t = 0.2 + i * 0.2;
        const pos = stemCurve.getPoint(t);
        thorn.position.copy(pos);
        thorn.rotation.z = (i % 2 === 0 ? -0.8 : 0.8);
        thorn.rotation.y = i * 1.2;
        roseGroup.add(thorn);
    }
    
    // Leaves with veins
    const leafMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x2e7d32,
        roughness: 0.6,
        metalness: 0.0,
        side: THREE.DoubleSide,
    });
    
    // Leaf positions along stem
    const leafPositions = [
        { t: 0.35, side: 1, scale: 1.2 },
        { t: 0.55, side: -1, scale: 1.0 },
        { t: 0.75, side: 1, scale: 0.8 },
    ];
    
    leafPositions.forEach((lp, idx) => {
        const leafGroup = createLeafWithStem();
        leafGroup.children.forEach(child => {
            if (child.isMesh) child.material = leafMaterial;
        });
        const pos = stemCurve.getPoint(lp.t);
        leafGroup.position.copy(pos);
        leafGroup.rotation.y = lp.side > 0 ? 0 : Math.PI;
        leafGroup.rotation.z = lp.side * 0.6;
        leafGroup.scale.setScalar(lp.scale);
        roseGroup.add(leafGroup);
    });
    
    // Sepals (green parts at base of rose)
    const sepalMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3d8b40,
        roughness: 0.6,
        side: THREE.DoubleSide,
    });
    
    for (let i = 0; i < 5; i++) {
        const sepal = createSepal();
        sepal.material = sepalMaterial;
        const angle = (i / 5) * Math.PI * 2 + 0.3;
        sepal.position.set(
            Math.cos(angle) * 0.15,
            -0.6,
            Math.sin(angle) * 0.15
        );
        sepal.rotation.set(0.8 + Math.random() * 0.2, angle, 0);
        sepal.scale.set(1.2, 1.2, 1);
        roseGroup.add(sepal);
    }
    
    roseGroup.position.y = 1.5;
    
    return roseGroup;
}

function createRealisticPetal(width, height, curlAmount) {
    // Create petal using a more detailed geometry
    const segments = 20;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const normals = [];
    const uvs = [];
    
    for (let i = 0; i <= segments; i++) {
        for (let j = 0; j <= segments; j++) {
            const u = i / segments;
            const v = j / segments;
            
            // Petal shape equation - wider at top, pointed at bottom
            const petalWidth = Math.sin(v * Math.PI) * width * (0.3 + v * 0.7);
            const x = (u - 0.5) * petalWidth;
            const y = v * height;
            
            // Natural curl - more curl at edges and top
            const edgeFactor = Math.abs(u - 0.5) * 2;
            const heightFactor = v * v;
            const curl = curlAmount * heightFactor * (0.3 + edgeFactor * 0.7);
            const z = -curl + Math.sin(u * Math.PI) * 0.05 * v;
            
            // Add slight waviness to edges
            const waviness = Math.sin(v * Math.PI * 3) * 0.02 * edgeFactor;
            
            vertices.push(x + waviness, y, z);
            uvs.push(u, v);
        }
    }
    
    // Create faces
    for (let i = 0; i < segments; i++) {
        for (let j = 0; j < segments; j++) {
            const a = i * (segments + 1) + j;
            const b = a + 1;
            const c = a + segments + 1;
            const d = c + 1;
            
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry);
}

function createThorn() {
    const geometry = new THREE.ConeGeometry(0.02, 0.15, 4);
    geometry.rotateX(Math.PI / 2);
    return new THREE.Mesh(geometry);
}

function createLeafWithStem() {
    const group = new THREE.Group();
    
    // Leaf stem
    const stemGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.4, 6);
    const leafStem = new THREE.Mesh(stemGeo);
    leafStem.rotation.z = Math.PI / 2;
    leafStem.position.x = 0.2;
    group.add(leafStem);
    
    // Main leaf
    const leaf = createDetailedLeaf(0.6, 0.35);
    leaf.position.x = 0.5;
    leaf.rotation.y = 0.1;
    group.add(leaf);
    
    return group;
}

function createDetailedLeaf(length, width) {
    const shape = new THREE.Shape();
    
    // Rose leaf shape - serrated edges
    shape.moveTo(0, 0);
    
    // Right side with serrations
    const serrations = 5;
    for (let i = 0; i < serrations; i++) {
        const t = (i + 1) / (serrations + 1);
        const x = Math.sin(t * Math.PI) * width;
        const y = t * length;
        const peakX = x + 0.03;
        shape.lineTo(peakX, y - 0.02);
        shape.lineTo(x, y);
    }
    
    // Tip
    shape.quadraticCurveTo(width * 0.3, length, 0, length + 0.05);
    
    // Left side with serrations
    for (let i = serrations - 1; i >= 0; i--) {
        const t = (i + 1) / (serrations + 1);
        const x = -Math.sin(t * Math.PI) * width;
        const y = t * length;
        const peakX = x - 0.03;
        shape.lineTo(x, y);
        shape.lineTo(peakX, y - 0.02);
    }
    
    shape.lineTo(0, 0);
    
    const geometry = new THREE.ShapeGeometry(shape, 12);
    
    // Add slight curve to leaf
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const curve = Math.sin((y / length) * Math.PI) * 0.05;
        positions.setZ(i, curve);
    }
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry);
}

function createSepal() {
    const shape = new THREE.Shape();
    
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.12, 0.2, 0.08, 0.5);
    shape.quadraticCurveTo(0.04, 0.6, 0, 0.65);
    shape.quadraticCurveTo(-0.04, 0.6, -0.08, 0.5);
    shape.quadraticCurveTo(-0.12, 0.2, 0, 0);
    
    const geometry = new THREE.ShapeGeometry(shape, 8);
    
    // Curve the sepal
    const positions = geometry.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        positions.setZ(i, -y * 0.3);
    }
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry);
}

// Particle system for sparkles - enhanced with glowing effect
let particles;

function createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const colorOptions = [
        new THREE.Color(0xff69b4), // Hot pink
        new THREE.Color(0xffc0cb), // Pink
        new THREE.Color(0xffe4e1), // Misty rose
        new THREE.Color(0xffb6c1), // Light pink
    ];
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        const radius = 3 + Math.random() * 4;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = (Math.random() - 0.5) * 6;
        positions[i3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
        
        const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
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
    
    // Update controls
    controls.update();
    
    // Animate particles
    if (particles) {
        particles.rotation.y += 0.001;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.002;
        }
        particles.geometry.attributes.position.needsUpdate = true;
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
