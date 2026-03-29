gsap.registerPlugin(ScrollTrigger);


const cards = gsap.utils.toArray('.card');
const label = document.getElementById('label');
const loader = document.getElementById('loader');
const site = document.getElementById('main-site');
const bnrTitle = document.getElementById("bnrTopTitle");
const bnrTitle2 = document.getElementById("bnrTopTitle2");


// Off-screen distances
const VW = () => window.innerWidth / 2 + 160;
const VH = () => window.innerHeight / 2 + 160;

// ── Gate flags ────────────────────────────────────────────────
let animDone = false;
let pageDone = false;

function tryReveal() {
    if (!animDone || !pageDone) return;
    revealSite();
}

// ── Cross-fade reveal ─────────────────────────────────────────
function revealSite() {
    // Fade loader out
    gsap.to(loader, {
        opacity: 0,
        duration: 0.75,
        ease: 'power2.inOut',
        onComplete() {
            loader.style.display = 'none';
            loader.style.pointerEvents = 'none';
        }
    });

    // Fade main site in (slight delay so it starts mid-fade)
    gsap.to(site, {
        opacity: 1,
        scale: 1,
        y: 0,
        borderRadius: 0,
        duration: 0.4,
        delay: 0,
        ease: 'power3.out',
        onStart() {
            site.style.pointerEvents = 'all';
            // Unlock page scrolling once site is visible
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
    });


    const bnrLetters = bnrTitle.textContent.split("");
    bnrTitle.innerHTML = "";
    bnrLetters.forEach(letter => {
        const span = document.createElement("span");
        span.innerHTML = letter === " " ? "&nbsp;" : letter;
        bnrTitle.appendChild(span);
    });

    const tl = gsap.timeline({ delay: 0 });
    tl.to("#bnrTopTitle span", {
        opacity: 1,
        rotateX: 0,
        y: 0,
        filter: "blur(0px)",
        ease: "power3.out",
        duration: 1,
        stagger: 0.01
    });

    const bnrLetters2 = bnrTitle2.textContent.split("");
    bnrTitle2.innerHTML = "";
    bnrLetters2.forEach(letter => {
        const span = document.createElement("span");
        span.innerHTML = letter === " " ? "&nbsp;" : letter;
        bnrTitle2.appendChild(span);
    });

    const tl2 = gsap.timeline({ delay: .2 });
    tl2.to("#bnrTopTitle2 span", {
        opacity: 1,
        rotateX: 0,
        y: 0,
        filter: "blur(0px)",
        ease: "power3.out",
        duration: 1,
        stagger: 0.01
    });
}

// ── Page-load flag ────────────────────────────────────────────
if (document.readyState === 'complete') {
    // Already loaded (e.g. served from cache)
    pageDone = true;
} else {
    window.addEventListener('load', () => {
        pageDone = true;
        tryReveal();
    });
}

// ── Animation sequence ────────────────────────────────────────
function runAnimation() {
    const offLeft = -VW();
    const offRight = VW();

    // Pre-position cards off-screen
    gsap.set([cards[0], cards[1], cards[2]], {
        x: offLeft, y: 0, rotation: 0, opacity: 0, zIndex: 1
    });
    gsap.set([cards[3], cards[4], cards[5]], {
        x: offRight, y: 0, rotation: 0, opacity: 0, zIndex: 1
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // Phase 0 – label fades in
    tl.to(label, { opacity: 1, duration: 0.4 });

    // Phase 1 & 2 – slide in from edges → stack at centre
    tl.to(cards, {
        x: 0, y: 0, opacity: 1,
        duration: 0.9,
        stagger: { each: 0.07, from: 'edges' },
        ease: 'power3.out',
        onStart() {
            cards.forEach((c, i) => { c.style.zIndex = i + 1; });
        }
    }, '>-0.1');

    // Phase 3 – each card pops to the front of the stack in turn
    tl.add(() => {
        gsap.to(label, { opacity: 0, duration: 0.3 });
    });

    cards.forEach(card => {
        tl.add(() => {
            cards.forEach((c, j) => { c.style.zIndex = j + 1; });
            card.style.zIndex = cards.length + 10;
        }, '>0.12');
    });

    const totalSpan = Math.min(window.innerWidth - 150);
    const step = totalSpan / (cards.length - 1);
    const startX = -totalSpan / 2;

    tl.to(cards, {
        x: (i) => startX + i * step,
        y: 0,
        rotation: 0,
        duration: 0.7,
        stagger: { each: 0.06, from: 'center' },
        ease: 'power2.inOut'
    }, '>0.3');

    // Phase 5 – exit upward off-screen
    tl.to(cards, {
        y: -(VH() + 200),
        opacity: 0,
        duration: 0.65,
        stagger: { each: 0.08, from: 'start' },
        ease: 'power2.in'
    }, '>0.4');

    // ✅ One full animation cycle complete — set flag & try reveal
    tl.call(() => {
        animDone = true;
        tryReveal();
    });
}

// ── Kick off immediately ──────────────────────────────────────
runAnimation();























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
gsap.to(title, { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.5 });

/* scroll-driven morph via ScrollTrigger scrub */
gsap.to(state, {
    progress: 1,
    ease: 'none',
    scrollTrigger: {
        trigger: '#scroll-trigger',
        start: 'top top',
        end: 'bottom bottom',
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
let tl;

function buildTimeline() {
    if (tl) tl.kill();

    tl = gsap.timeline({
        scrollTrigger: {
            trigger: section2,
            start: 'top top',
            end: '+=150%',
            pin: true,
            scrub: 1,
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
}

buildTimeline();

window.addEventListener('resize', () => {
    buildTimeline();
    ScrollTrigger.refresh();
});




 /* ─── Register ScrollTrigger plugin ──────────────────── */
    gsap.registerPlugin(ScrollTrigger);

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
        y: 80,
        scale: 0.92,
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





