/* =========================================================
   DHRUV RAWAT — INTERACTIVE 3D & UI LOGIC
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  // --- 1. SET FOOTER YEAR ---
  document.getElementById("year").textContent = new Date().getFullYear();

  // --- 2. MOBILE NAVIGATION LOGIC ---
  const nav = document.getElementById("nav");
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.querySelector(".nav__links");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  });

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      navToggle.classList.toggle("active");
      // BUG FIX 2: Lock/Unlock body scroll when menu is open
      document.body.style.overflow = navLinks.classList.contains("open") ? "hidden" : "";
    });
    
    // Close menu when link is clicked
    navLinks.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.classList.remove("active");
        document.body.style.overflow = ""; // Remove scroll lock on click
      });
    });
  }

  // --- 3. SCROLL REVEAL ANIMATIONS ---
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" });

  revealEls.forEach(el => revealObserver.observe(el));

  // --- 4. CUSTOM MOUSE GLOW ---
  const glow = document.getElementById("cursorGlow");
  if (window.matchMedia("(hover: hover)").matches) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    window.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      glow.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });
  } else {
    glow.style.display = "none";
  }

  // ==========================================
  // --- 5. THREE.JS 3D BACKGROUND SCENE ---
  // ==========================================
  const canvasContainer = document.getElementById('canvas-container');

  // BUG FIX 5: Guard against WebGL/Three.js failures (old devices, disabled
  // WebGL, blocked CDN) so a failure here can't take the rest of the page down.
  if (typeof THREE !== 'undefined' && canvasContainer) {
   try {
    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030508, 0.001);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    canvasContainer.appendChild(renderer.domElement);

    // Group to hold all 3D objects
    const sceneGroup = new THREE.Group();
    scene.add(sceneGroup);

    // 1. Create Data Sphere (Icosahedron Wireframe)
    const geometry = new THREE.IcosahedronGeometry(12, 1);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x00F0FF, // Cyan primary color
      wireframe: true,
      transparent: true,
      opacity: 0.15 
    });
    const dataSphere = new THREE.Mesh(geometry, material);
    sceneGroup.add(dataSphere);

    // 2. Create Floating Particles (Data points)
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);
    for(let i = 0; i < particleCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60; 
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.15,
      color: 0x00F0FF,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    
    const particleMesh = new THREE.Points(particleGeometry, particleMaterial);
    sceneGroup.add(particleMesh);

    // Mouse Interaction setup
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    if (window.matchMedia("(hover: hover)").matches) {
      document.addEventListener('mousemove', (event) => {
        targetX = (event.clientX - windowHalfX) * 0.001;
        targetY = (event.clientY - windowHalfY) * 0.001;
      });
    }

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
      requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous rotation
      dataSphere.rotation.y += 0.002;
      dataSphere.rotation.x += 0.001;
      
      particleMesh.rotation.y = -elapsedTime * 0.05;

      // Mouse Parallax effect
      sceneGroup.rotation.y += 0.05 * (targetX - sceneGroup.rotation.y);
      sceneGroup.rotation.x += 0.05 * (targetY - sceneGroup.rotation.x);

      renderer.render(scene, camera);
    }
    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
   } catch (err) {
     // WebGL unsupported/blocked — fail silently, rest of the site still works.
     console.warn('3D background disabled:', err);
     canvasContainer.style.display = 'none';
   }
  }
});
