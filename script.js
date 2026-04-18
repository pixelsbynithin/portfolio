const lenis = new Lenis({
  duration: 2,
  easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  smoothTouch: false,
});

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);


lenis.on('scroll', ScrollTrigger.update);

gsap.registerPlugin(ScrollTrigger);


















/* ── renderer ── */
const canvas = document.getElementById('bg-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x0a0a0c, 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.z = 28;

/* ── geometry ── */
const COUNT = 12000;
const posArr = new Float32Array(COUNT * 3);
const colArr = new Float32Array(COUNT * 3);

function makeScatter() {
    const p = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
        const r = 11 + Math.random() * 16;
        const t = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        p[i * 3] = r * Math.sin(phi) * Math.cos(t);
        p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(t);
        p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
}

function makeSphere() {
    const p = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
        const phi = Math.acos(-1 + (2 * i) / COUNT);
        const theta = Math.sqrt(COUNT * Math.PI) * phi;
        const r = 11 + (Math.random() - 0.5) * 0.3;
        p[i * 3] = r * Math.cos(theta) * Math.sin(phi);
        p[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
        p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
}

const fromPts = makeScatter();
const toPts = makeSphere();

/* ── colors ── */
const fromCols = new Float32Array(COUNT * 3);
const toCols = new Float32Array(COUNT * 3);
const col = new THREE.Color();

for (let i = 0; i < COUNT; i++) {
    col.setHSL(Math.random(), .1, 0.55);
    fromCols[i * 3] = col.r; fromCols[i * 3 + 1] = col.g; fromCols[i * 3 + 2] = col.b;

    col.setHSL(0.54 + (i / COUNT) * 0.18, 0.85, 0.44 + (i / COUNT) * 0.2);
    toCols[i * 3] = col.r; toCols[i * 3 + 1] = col.g; toCols[i * 3 + 2] = col.b;
}

for (let i = 0; i < COUNT * 3; i++) { posArr[i] = fromPts[i]; colArr[i] = fromCols[i]; }

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));

const mat = new THREE.PointsMaterial({
    size: 0.07,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    opacity: 0.9,
    sizeAttenuation: true,
    depthWrite: false,
});

const points = new THREE.Points(geo, mat);
scene.add(points);

/* ── morph state driven by GSAP ── */
const state = { progress: 0 };

const title = document.getElementById('title');

/* headline fade-in on load */
gsap.to(title, { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.1 });

/* scroll-driven morph via ScrollTrigger scrub */
gsap.to(state, {
    progress: 1,
    ease: 'none',
    scrollTrigger: {
        trigger: '#scroll-trigger',
        start: 'top top',
        // end: 'bottom bottom',
        end: '+=600',
        scrub: 1,
        onUpdate(self) {
            const p = self.progress;
        }
    }
});

/* ── render loop ── */
let spinAngle = 0;
let last = performance.now();

function animate() {
    requestAnimationFrame(animate);
    const now = performance.now();
    const dt = (now - last) / 1000; last = now;

    const e = state.progress;

    /* morph positions + colors */
    const p = geo.attributes.position.array;
    const c = geo.attributes.color.array;
    for (let i = 0; i < COUNT * 3; i++) {
        p[i] = fromPts[i] + (toPts[i] - fromPts[i]) * e;
        c[i] = fromCols[i] + (toCols[i] - fromCols[i]) * e;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;

    /* spin — picks up speed as sphere forms */
    spinAngle += dt * (0.06 + e * 0.3);
    points.rotation.y = spinAngle;
    points.rotation.x = Math.sin(spinAngle * 0.25) * 0.1 * e;

    renderer.render(scene, camera);
}
animate();

/* ── resize ── */
window.addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
});










const section2 = document.querySelector('.section2');
const zoomContainer = document.querySelector('.zoomContainer');
const zoomImg = document.querySelector('.zoomImg');
const topContainer = document.querySelector('.top_container');
const btmContainer = document.querySelector('.btm_container');

const isMobile = () => window.innerWidth <= 576;

function resetMobileStyles() {
  // Kill any existing timeline/ScrollTrigger
  if (tl) {
    tl.scrollTrigger?.kill();
    tl.kill();
    tl = null;
  }

  // Clear all GSAP inline styles so CSS takes over
  gsap.set([zoomContainer, zoomImg, topContainer, btmContainer], { clearProps: "all" });
}

let tl;

function buildTimeline() {
  if (tl) {
    tl.scrollTrigger?.kill();
    tl.kill();
    tl = null;
  }

  if (isMobile()) {
    resetMobileStyles();
    return; // ← exit early, no animation on mobile
  }

  gsap.set(topContainer, { autoAlpha: 0, y: 60 });
  gsap.set(btmContainer, { autoAlpha: 0, y: 60 });

  tl = gsap.timeline({
    scrollTrigger: {
      trigger: section2,
      start: 'top top',
      end: '+=150%',
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
      anticipatePin: 1,
    }
  });

  tl.to(zoomContainer, {
    width: window.innerWidth,
    height: window.innerHeight,
    ease: 'power2.inOut',
    backgroundColor: "#ffffff",
    borderRadius: "0",
  });

  tl.to(zoomImg, {
    width: 200,
    height: 230,
    ease: 'power2.inOut',
    opacity: 1,
  }, "<");

  tl.to(topContainer, {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, "<80%");

  tl.to(btmContainer, {
    autoAlpha: 1,
    y: 0,
    duration: 0.5,
    ease: 'power2.out',
  }, "<0.1");
}

buildTimeline();
window.addEventListener('load', () => ScrollTrigger.refresh());

let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    buildTimeline();
    ScrollTrigger.refresh();
  }, 250);
});


















    /* ─── Animate each project card on scroll ────────────── */
    const projCards = document.querySelectorAll('.projectCard');

    projCards.forEach((pCard, index) => {
      /*
       * Set the initial "hidden" state for each card.
       * GSAP controls opacity / y / scale so the CSS never
       * needs to handle these values.
       */
      gsap.set(pCard, {
        opacity: 0,
        y: 95,
        scale: .8,
      });

      /*
       * Create a scroll-triggered tween for each card.
       * Each card is its own trigger so they fire independently
       * as the user scrolls down — no batch, true per-card control.
       */
      gsap.to(pCard, {
        opacity: 1,
        y: 0,
        scale: 1,

        duration: 0.9,
        ease: 'power3.out',

        /*
         * Slight stagger: each subsequent card starts a fraction
         * of a second later than the one above it,
         * giving the list a cascading feel when multiple cards
         * enter the viewport together.
         */
        delay: index * 0.05,

        scrollTrigger: {
          trigger: pCard,            // each card triggers itself
          start: 'top 88%',        // fire when card top hits 88% of viewport height
          end: 'bottom 20%',
          toggleActions: 'play none none reverse', // play once, never rewind
        },
      });
    });

    /* ─── Mouse-tracking gradient blob on each card ──────── */
    document.querySelectorAll('.projectCard').forEach(pCard => {
      pCard.addEventListener('mousemove', e => {
        const r = pCard.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width)  * 100;
        const y = ((e.clientY - r.top)  / r.height) * 100;
        pCard.style.setProperty('--mx', `${x}%`);
        pCard.style.setProperty('--my', `${y}%`);
      });
    });


