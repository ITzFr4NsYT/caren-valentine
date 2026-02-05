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
// Three.js 3D Rose
// ==========================================
let scene, camera, renderer, rose, controls;
let isRoseClickable = true;

function initThreeJsRose() {
    // Scene setup
    scene = new THREE.Scene();
    
    // Camera
    camera = new THREE.PerspectiveCamera(
        60,
        roseCanvas.clientWidth / roseCanvas.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 2, 8);
    
    // Renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true 
    });
    renderer.setSize(roseCanvas.clientWidth, roseCanvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
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
    controls.autoRotateSpeed = 1.5;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);
    
    const pointLight = new THREE.PointLight(0xff69b4, 0.8, 20);
    pointLight.position.set(-3, 3, 3);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xdc143c, 0.6, 20);
    pointLight2.position.set(3, -2, 3);
    scene.add(pointLight2);
    
    // Create the rose
    rose = createRose();
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

function createRose() {
    const roseGroup = new THREE.Group();
    
    // Rose material - rich red with some shine
    const petalMaterial = new THREE.MeshStandardMaterial({
        color: 0xdc143c,
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide,
    });
    
    const innerPetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        roughness: 0.5,
        metalness: 0.1,
        side: THREE.DoubleSide,
    });
    
    // Create petals in layers
    const petalLayers = [
        { count: 5, radius: 0.3, height: 0.8, yOffset: 0.5, curl: 0.2, material: innerPetalMaterial },
        { count: 6, radius: 0.5, height: 1.0, yOffset: 0.3, curl: 0.4, material: innerPetalMaterial },
        { count: 7, radius: 0.8, height: 1.2, yOffset: 0.1, curl: 0.6, material: petalMaterial },
        { count: 8, radius: 1.1, height: 1.3, yOffset: -0.1, curl: 0.8, material: petalMaterial },
        { count: 9, radius: 1.4, height: 1.4, yOffset: -0.3, curl: 1.0, material: petalMaterial },
        { count: 10, radius: 1.7, height: 1.5, yOffset: -0.5, curl: 1.2, material: petalMaterial },
    ];
    
    petalLayers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
            const petal = createPetal(layer.height, layer.curl);
            petal.material = layer.material;
            
            const angle = (i / layer.count) * Math.PI * 2 + layerIndex * 0.2;
            petal.position.x = Math.cos(angle) * layer.radius * 0.3;
            petal.position.z = Math.sin(angle) * layer.radius * 0.3;
            petal.position.y = layer.yOffset;
            
            petal.rotation.y = angle;
            petal.rotation.x = -0.3 - layer.curl * 0.3;
            petal.rotation.z = (Math.random() - 0.5) * 0.2;
            
            roseGroup.add(petal);
        }
    });
    
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.08, 0.1, 4, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        roughness: 0.7,
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = -2.5;
    roseGroup.add(stem);
    
    // Leaves
    const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x228b22,
        roughness: 0.6,
        side: THREE.DoubleSide,
    });
    
    for (let i = 0; i < 3; i++) {
        const leaf = createLeaf();
        leaf.material = leafMaterial;
        leaf.position.y = -1.5 - i * 0.8;
        leaf.position.x = (i % 2 === 0 ? 1 : -1) * 0.3;
        leaf.rotation.y = (i % 2 === 0 ? 0 : Math.PI);
        leaf.rotation.z = (i % 2 === 0 ? -0.5 : 0.5);
        roseGroup.add(leaf);
    }
    
    // Sepals (green parts at base of rose)
    const sepalMaterial = new THREE.MeshStandardMaterial({
        color: 0x2e8b2e,
        roughness: 0.6,
        side: THREE.DoubleSide,
    });
    
    for (let i = 0; i < 5; i++) {
        const sepal = createSepal();
        sepal.material = sepalMaterial;
        const angle = (i / 5) * Math.PI * 2;
        sepal.position.y = -0.7;
        sepal.rotation.y = angle;
        sepal.rotation.x = 0.8;
        roseGroup.add(sepal);
    }
    
    roseGroup.position.y = 0.5;
    
    return roseGroup;
}

function createPetal(height, curl) {
    const shape = new THREE.Shape();
    
    // Petal shape - heart-like
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.3, 0.4, 0.7, 0.2, height);
    shape.bezierCurveTo(0.1, height + 0.1, -0.1, height + 0.1, -0.2, height);
    shape.bezierCurveTo(-0.4, 0.7, -0.3, 0.3, 0, 0);
    
    const extrudeSettings = {
        steps: 2,
        depth: 0.02,
        bevelEnabled: true,
        bevelThickness: 0.01,
        bevelSize: 0.02,
        bevelSegments: 2,
    };
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const petal = new THREE.Mesh(geometry);
    
    // Bend the petal
    const positionAttribute = geometry.getAttribute('position');
    for (let i = 0; i < positionAttribute.count; i++) {
        const y = positionAttribute.getY(i);
        const bendAmount = (y / height) * curl * 0.3;
        positionAttribute.setZ(i, positionAttribute.getZ(i) - bendAmount);
    }
    geometry.computeVertexNormals();
    
    return petal;
}

function createLeaf() {
    const shape = new THREE.Shape();
    
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.3, 0.2, 0.4, 0.5, 0.2, 0.8);
    shape.bezierCurveTo(0.1, 0.9, -0.1, 0.9, -0.2, 0.8);
    shape.bezierCurveTo(-0.4, 0.5, -0.3, 0.2, 0, 0);
    
    const geometry = new THREE.ShapeGeometry(shape);
    return new THREE.Mesh(geometry);
}

function createSepal() {
    const shape = new THREE.Shape();
    
    shape.moveTo(0, 0);
    shape.bezierCurveTo(0.1, 0.1, 0.15, 0.3, 0.08, 0.5);
    shape.lineTo(0, 0.55);
    shape.lineTo(-0.08, 0.5);
    shape.bezierCurveTo(-0.15, 0.3, -0.1, 0.1, 0, 0);
    
    const geometry = new THREE.ShapeGeometry(shape);
    return new THREE.Mesh(geometry);
}

// Particle system for sparkles
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
