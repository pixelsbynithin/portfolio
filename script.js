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
        duration: 0.75,
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






















const canvas = document.getElementById('c');
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 25;

        const count = 12000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors    = new Float32Array(count * 3);

        // ── shape generators ──────────────────────────────────────────────

        function makeSphere() {
            const pts = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                const phi   = Math.acos(-1 + (2 * i) / count);
                const theta = Math.sqrt(count * Math.PI) * phi;
                pts[i*3]   = 8 * Math.cos(theta) * Math.sin(phi) + (Math.random()-.5)*.5;
                pts[i*3+1] = 8 * Math.sin(theta) * Math.sin(phi) + (Math.random()-.5)*.5;
                pts[i*3+2] = 8 * Math.cos(phi)                   + (Math.random()-.5)*.5;
            }
            return pts;
        }

        function makeScatter() {
            const pts = new Float32Array(count * 3);
            for (let i = 0; i < count; i++) {
                const r     = 10 + Math.random() * 14;
                const theta = Math.random() * Math.PI * 2;
                const phi   = Math.acos(2 * Math.random() - 1);
                pts[i*3]   = r * Math.sin(phi) * Math.cos(theta);
                pts[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
                pts[i*3+2] = r * Math.cos(phi);
            }
            return pts;
        }

        function makeSquare() {
            const pts  = new Float32Array(count * 3);
            const size = 5;
            for (let i = 0; i < count; i++) {
                const face = Math.floor(Math.random() * 6);
                const u = (Math.random() - .5) * 2 * size;
                const v = (Math.random() - .5) * 2 * size;
                switch (face) {
                    case 0: pts[i*3]=u;     pts[i*3+1]=v;     pts[i*3+2]=size;  break;
                    case 1: pts[i*3]=u;     pts[i*3+1]=v;     pts[i*3+2]=-size; break;
                    case 2: pts[i*3]=size;  pts[i*3+1]=u;     pts[i*3+2]=v;     break;
                    case 3: pts[i*3]=-size; pts[i*3+1]=u;     pts[i*3+2]=v;     break;
                    case 4: pts[i*3]=u;     pts[i*3+1]=size;  pts[i*3+2]=v;     break;
                    case 5: pts[i*3]=u;     pts[i*3+1]=-size; pts[i*3+2]=v;     break;
                }
                pts[i*3]   += (Math.random()-.5)*.3;
                pts[i*3+1] += (Math.random()-.5)*.3;
                pts[i*3+2] += (Math.random()-.5)*.3;
            }
            return pts;
        }

        // ── color palettes per state ──────────────────────────────────────

        function colorForState(state, i, x, y, z) {
            const c = new THREE.Color();
            if (state === 'scatter') {
                c.setHSL(Math.random(), 0.8, 0.6);
            } else if (state === 'sphere') {
                const depth = Math.sqrt(x*x+y*y+z*z) / 8;
                c.setHSL(0.5 + depth * 0.2, 0.7, 0.4 + depth * 0.3);
            } else if (state === 'square') {
                c.setHSL(0.05 + (i / count) * 0.15, 0.9, 0.55);
            }
            return c;
        }

        // ── init (start scattered) ────────────────────────────────────────

        const initPts = makeScatter();
        for (let i = 0; i < count; i++) {
            positions[i*3]   = initPts[i*3];
            positions[i*3+1] = initPts[i*3+1];
            positions[i*3+2] = initPts[i*3+2];
            const c = colorForState('scatter', i, 0, 0, 0);
            colors[i*3]=c.r; colors[i*3+1]=c.g; colors[i*3+2]=c.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.07,
            vertexColors: false,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.85,
            sizeAttenuation: true
        });

        const particles = new THREE.Points(geometry, material);
        scene.add(particles);

        // ── morph state ───────────────────────────────────────────────────

        let fromPts  = new Float32Array(positions);
        let toPts    = new Float32Array(count * 3);
        let fromClrs = new Float32Array(colors);
        let toClrs   = new Float32Array(count * 3);

        let progress      = 1;
        let morphDuration = 2.5;
        let morphStart    = 0;
        let currentState  = 'scatter';
        let phase         = 'hold';   // start in hold so first morph kicks off after delay
        let holdTimer     = 0;
        let holdDuration  = 1.5;
        let spinAngle     = 0;

        // loop: scatter → sphere → scatter → square → (repeat)
        const sequence = ['sphere', 'scatter', 'sphere', 'scatter'];
        let seqIndex = 0;

        function easeInOut(t) {
            return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
        }

        function startMorph(nextState) {
            const pos = geometry.attributes.position.array;
            const col = geometry.attributes.color.array;
            fromPts  = new Float32Array(pos);
            fromClrs = new Float32Array(col);

            if (nextState === 'sphere')  toPts = makeSphere();
            if (nextState === 'scatter') toPts = makeScatter();
            if (nextState === 'square')  toPts = makeSquare();

            for (let i = 0; i < count; i++) {
                const x = toPts[i*3], y = toPts[i*3+1], z = toPts[i*3+2];
                const c = colorForState(nextState, i, x, y, z);
                toClrs[i*3]=c.r; toClrs[i*3+1]=c.g; toClrs[i*3+2]=c.b;
            }

            progress     = 0;
            morphStart   = performance.now() / 1000;
            currentState = nextState;
            phase        = 'morph';
        }

        // short pause before first morph
        setTimeout(() => startMorph(sequence[seqIndex % sequence.length]), 800);

        // ── render loop ───────────────────────────────────────────────────

        let lastTime = performance.now() / 1000;

        function animate() {
            requestAnimationFrame(animate);
            const now = performance.now() / 1000;
            const dt  = now - lastTime;
            lastTime  = now;

            if (phase === 'morph' && progress < 1) {
                progress = Math.min((now - morphStart) / morphDuration, 1);
                const e  = easeInOut(progress);
                const pos = geometry.attributes.position.array;
                const col = geometry.attributes.color.array;

                for (let i = 0; i < count * 3; i++) {
                    pos[i] = fromPts[i]  + (toPts[i]  - fromPts[i])  * e;
                    col[i] = fromClrs[i] + (toClrs[i] - fromClrs[i]) * e;
                }

                geometry.attributes.position.needsUpdate = true;
                geometry.attributes.color.needsUpdate    = true;

                if (progress >= 1) {
                    phase     = 'hold';
                    holdTimer = 0;
                }
            } else if (phase === 'hold') {
                holdTimer += dt;
                if (holdTimer >= holdDuration) {
                    seqIndex++;
                    startMorph(sequence[seqIndex % sequence.length]);
                }
            }

            if (currentState === 'sphere') {
                spinAngle += 0.003;
                particles.rotation.y = spinAngle;
            } else {
                particles.rotation.y += 0.0004;
            }

            renderer.render(scene, camera);
        }

        animate();

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
