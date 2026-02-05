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
            
            setTimeout(() => {
                heart.remove();
            }, 15000);
        }, i * 500);
    }
    
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
    const escapeDistance = 120;
    
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
    
    noBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        escapeButton();
    });
}

function escapeButton() {
    const padding = 100;
    const maxX = window.innerWidth - noBtn.offsetWidth - padding;
    const maxY = window.innerHeight - noBtn.offsetHeight - padding;
    
    let newX, newY;
    let attempts = 0;
    const maxAttempts = 10;
    
    do {
        newX = padding + Math.random() * maxX;
        newY = padding + Math.random() * maxY;
        attempts++;
    } while (attempts < maxAttempts && isNearYesButton(newX, newY));
    
    noBtn.classList.add('escaping');
    noBtn.style.position = 'fixed';
    noBtn.style.left = newX + 'px';
    noBtn.style.top = newY + 'px';
    
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
// Three.js 3D Rose - Simple Procedural Version
// ==========================================
let scene, camera, renderer, controls, roseGroup;
let isRoseClickable = true;
let particles;

function initThreeJsRose() {
    // Scene
    scene = new THREE.Scene();
    
    // Camera - positioned to see the whole rose
    camera = new THREE.PerspectiveCamera(
        45,
        roseCanvas.clientWidth / roseCanvas.clientHeight,
        0.1,
        100
    );
    camera.position.set(0, 2, 8);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(roseCanvas.clientWidth, roseCanvas.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    roseCanvas.appendChild(renderer.domElement);
    
    // Orbit Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enablePan = false;
    controls.minDistance = 5;
    controls.maxDistance = 15;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.5;
    controls.target.set(0, 1, 0);
    
    // Lighting
    setupLighting();
    
    // Create the rose
    roseGroup = createRose();
    scene.add(roseGroup);
    
    // Particles
    createParticles();
    
    // Events
    window.addEventListener('resize', onWindowResize);
    renderer.domElement.addEventListener('click', onRoseClick);
    
    // Start animation
    animate();
}

function setupLighting() {
    // Ambient light
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    
    // Main light from front-top
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(2, 5, 5);
    scene.add(mainLight);
    
    // Fill light from left
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);
    
    // Back light for rim effect
    const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
    backLight.position.set(0, 2, -4);
    scene.add(backLight);
}

function createRose() {
    const rose = new THREE.Group();
    
    // Red petal material
    const petalMaterial = new THREE.MeshStandardMaterial({
        color: 0xcc1122,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    
    // Darker red for inner petals
    const innerPetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide
    });
    
    // Create petal layers
    // Inner tight petals
    createPetalLayer(rose, 5, 0.08, 0.3, 0.25, innerPetalMaterial);
    createPetalLayer(rose, 6, 0.15, 0.4, 0.20, innerPetalMaterial);
    // Middle petals
    createPetalLayer(rose, 7, 0.25, 0.5, 0.12, petalMaterial);
    createPetalLayer(rose, 8, 0.38, 0.6, 0.05, petalMaterial);
    // Outer petals
    createPetalLayer(rose, 9, 0.52, 0.7, -0.02, petalMaterial);
    createPetalLayer(rose, 10, 0.68, 0.75, -0.08, petalMaterial);
    
    // Sepals (green parts under petals)
    createSepals(rose);
    
    // Stem
    createStem(rose);
    
    rose.position.y = 0.5;
    
    return rose;
}

function createPetalLayer(rose, count, radius, petalSize, yOffset, material) {
    for (let i = 0; i < count; i++) {
        const petal = createPetal(petalSize, material);
        const angle = (i / count) * Math.PI * 2;
        
        petal.position.set(
            Math.cos(angle) * radius,
            yOffset,
            Math.sin(angle) * radius
        );
        
        // Rotate to face outward
        petal.rotation.y = angle;
        // Tilt based on layer (inner = more upright, outer = more flat)
        const tiltAngle = Math.PI * 0.3 + (radius * 0.8);
        petal.rotation.x = tiltAngle;
        
        rose.add(petal);
    }
}

function createPetal(size, material) {
    // Simple curved petal shape
    const shape = new THREE.Shape();
    
    shape.moveTo(0, 0);
    shape.bezierCurveTo(
        size * 0.5, size * 0.3,
        size * 0.5, size * 0.7,
        0, size
    );
    shape.bezierCurveTo(
        -size * 0.5, size * 0.7,
        -size * 0.5, size * 0.3,
        0, 0
    );
    
    const geometry = new THREE.ShapeGeometry(shape, 8);
    
    // Add curve to the petal
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        const x = positions.getX(i);
        // Curl back at the top
        const curl = (y / size) * (y / size) * size * 0.35;
        positions.setZ(i, -curl);
    }
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry, material);
}

function createSepals(rose) {
    const sepalMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.7,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    
    for (let i = 0; i < 5; i++) {
        const sepal = createSepal(sepalMaterial);
        const angle = (i / 5) * Math.PI * 2;
        
        sepal.position.set(
            Math.cos(angle) * 0.15,
            -0.15,
            Math.sin(angle) * 0.15
        );
        sepal.rotation.y = angle;
        sepal.rotation.x = Math.PI * 0.6;
        
        rose.add(sepal);
    }
}

function createSepal(material) {
    const shape = new THREE.Shape();
    
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.08, 0.2, 0.05, 0.5);
    shape.lineTo(0, 0.6);
    shape.lineTo(-0.05, 0.5);
    shape.quadraticCurveTo(-0.08, 0.2, 0, 0);
    
    const geometry = new THREE.ShapeGeometry(shape, 6);
    return new THREE.Mesh(geometry, material);
}

function createStem(rose) {
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.7,
        metalness: 0.0
    });
    
    // Curved stem using a tube
    const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.2, 0),
        new THREE.Vector3(0.05, -1, 0.02),
        new THREE.Vector3(-0.03, -2, -0.02),
        new THREE.Vector3(0.02, -3, 0.01),
        new THREE.Vector3(0, -4, 0)
    ]);
    
    const stemGeometry = new THREE.TubeGeometry(curve, 20, 0.05, 8, false);
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    rose.add(stem);
    
    // Add a few thorns
    const thornMaterial = new THREE.MeshStandardMaterial({
        color: 0x2E8B2E,
        roughness: 0.6
    });
    
    const thornPositions = [-0.8, -1.5, -2.3];
    thornPositions.forEach((y, i) => {
        const thorn = createThorn(thornMaterial);
        const pos = curve.getPointAt(Math.abs(y) / 4);
        thorn.position.copy(pos);
        thorn.rotation.z = (i % 2 === 0 ? 1 : -1) * 0.8;
        thorn.rotation.y = i * 1.5;
        rose.add(thorn);
    });
    
    // Add leaves
    const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x228B22,
        roughness: 0.6,
        metalness: 0.0,
        side: THREE.DoubleSide
    });
    
    // Two leaves at different heights
    const leaf1 = createLeaf(leafMaterial, 0.6);
    leaf1.position.set(0.1, -1.2, 0);
    leaf1.rotation.y = 0.3;
    leaf1.rotation.z = 0.5;
    rose.add(leaf1);
    
    const leaf2 = createLeaf(leafMaterial, 0.5);
    leaf2.position.set(-0.08, -2.2, 0.05);
    leaf2.rotation.y = Math.PI + 0.2;
    leaf2.rotation.z = -0.4;
    rose.add(leaf2);
}

function createThorn(material) {
    const geometry = new THREE.ConeGeometry(0.02, 0.12, 5);
    geometry.rotateX(Math.PI / 2);
    geometry.translate(0, 0, 0.05);
    return new THREE.Mesh(geometry, material);
}

function createLeaf(material, size) {
    const shape = new THREE.Shape();
    
    // Leaf shape
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(size * 0.4, size * 0.2, size * 0.5, size * 0.5);
    shape.quadraticCurveTo(size * 0.4, size * 0.8, 0, size);
    shape.quadraticCurveTo(-size * 0.4, size * 0.8, -size * 0.5, size * 0.5);
    shape.quadraticCurveTo(-size * 0.4, size * 0.2, 0, 0);
    
    const geometry = new THREE.ShapeGeometry(shape, 8);
    
    // Add slight curve
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        positions.setZ(i, Math.sin((y / size) * Math.PI) * 0.05);
    }
    geometry.computeVertexNormals();
    
    return new THREE.Mesh(geometry, material);
}

function createParticles() {
    const count = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const colorOptions = [
        new THREE.Color(0xff69b4),
        new THREE.Color(0xffc0cb),
        new THREE.Color(0xffe4e1),
        new THREE.Color(0xffffff)
    ];
    
    for (let i = 0; i < count; i++) {
        const i3 = i * 3;
        const radius = 2 + Math.random() * 3;
        const theta = Math.random() * Math.PI * 2;
        
        positions[i3] = Math.cos(theta) * radius;
        positions[i3 + 1] = (Math.random() - 0.3) * 5;
        positions[i3 + 2] = Math.sin(theta) * radius;
        
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
        opacity: 0.6,
        blending: THREE.AdditiveBlending
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
    if (!isRoseClickable || !roseGroup) return;
    
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    const intersects = raycaster.intersectObjects(roseGroup.children, true);
    
    if (intersects.length > 0) {
        isRoseClickable = false;
        showMessage();
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    
    // Gentle float animation
    if (roseGroup) {
        roseGroup.rotation.y += 0.002;
    }
    
    // Animate particles
    if (particles) {
        particles.rotation.y += 0.001;
        const positions = particles.geometry.attributes.position.array;
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + i) * 0.002;
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
            
            setTimeout(() => {
                confetti.remove();
            }, 6000);
        }, i * 50);
    }
    
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
    noBtn.style.position = 'relative';
});
