  /*
      Aspect-ratio-aware scaling:
      ────────────────────────────
      Rather than scaling uniformly (which fills a circle, not a rect),
      we scale X and Y axes independently so the 12px square morphs into
      a rectangle that exactly matches the viewport's width × height.
    */
    const VW = window.innerWidth;
    const VH = window.innerHeight;

    const scaleX = VW / 12;   // units needed to span full width
    const scaleY = VH / 12;   // units needed to span full height

    /* ── Timeline ───────────────────────────────────────────── */
    gsap.timeline({ delay: 0.5 })

      // PHASE 1 — 12px red square expands into a full-viewport
      //           white rectangle, morphing to the screen's exact ratio
      .to('#loader-square', {
        scaleX:          scaleX,
        scaleY:          scaleY,
        backgroundColor: '#FFFFFF',
        duration:        1.1,
        ease:            'power2.inOut',
      })

      // PHASE 2 — Loader exits; content enters
      .add(() => {
        document.body.style.overflow = '';

        // Remove loader (it's already white and full-screen)
        gsap.to('#loader', {
          autoAlpha: 0,
          duration:  0.2,
          onComplete: () => document.getElementById('loader').remove()
        });

        // Snap content visible (white square already covers the screen)
        gsap.set('#content', { visibility: 'visible' });
        gsap.to('#content', { opacity: 1, duration: 0.01 });

        // Stagger each element upward into view
        gsap.from([
          '.logo', 'nav a',
          '.eyebrow', 'h1', '.body-text', '.cta',
          '.float-label'
        ], {
          opacity:  0,
          y:        22,
          duration: 0.75,
          ease:     'power3.out',
          stagger:  0.07,
          delay:    0.05,
        });
      });
    
    
    
    const bannerMain = document.getElementById('bannerMain');
    const middle = document.getElementById('middle');
    const arrow = document.getElementById('arrow');
    const glow = document.getElementById('glow');

    let isRight = false; // false = showing banner1, true = showing banner2
    let proximityThreshold = 420; // px from center of .middle
    let isAnimating = false;

    // Track mouse position for proximity detection
    document.addEventListener('mousemove', (e) => {
        const rect = middle.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const midY = rect.top + rect.height / 2;
        const dist = Math.hypot(e.clientX - midX, e.clientY - midY);

        // Glow follows cursor near middle
        if (dist < proximityThreshold * 1.5) {
            glow.style.left = e.clientX + 'px';
            glow.style.top = e.clientY + 'px';
            const glowOpacity = Math.max(0, 1 - dist / (proximityThreshold * 1.5));
            gsap.to(glow, { opacity: glowOpacity, duration: 0.2 });
        } else {
            gsap.to(glow, { opacity: 0, duration: 0.3 });
        }

        // Proximity hover class
        if (dist < proximityThreshold) {
            middle.classList.add('hovered');

            // Pulse middle slightly on proximity
            if (!middle._pulsing) {
                middle._pulsing = true;
                gsap.to(middle, {
                    scaleX: 1.7,
                    // backgroundColor: "#000", 
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        } else {
            middle.classList.remove('hovered');
            if (middle._pulsing) {
                middle._pulsing = false;
                gsap.to(middle, {
                    scaleX: 1,
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        }
    });

    // Click to slide
    middle.addEventListener('mouseenter', () => {
        if (isAnimating) return;
        slide();
    });

    // Also trigger on proximity + hover for auto-slide feel (optional: auto on proximity)
    // Uncomment below to auto-slide when mouse hovers directly over .middle
    // middle.addEventListener('mouseenter', () => {
    //     if (!isAnimating) slide();
    // });

    function slide() {
        isAnimating = true;

        if (!isRight) {
            // Slide to the right → show banner2
            gsap.to(bannerMain, {
                x: '-98vw',
                duration: 0.85,
                ease: 'power3.inOut',
                onComplete: () => {
                    isRight = true;
                    isAnimating = false;
                    updateArrow();
                }
            });
        } else {
            // Slide back → show banner1
            gsap.to(bannerMain, {
                x: '0vw',
                duration: 0.85,
                ease: 'power3.inOut',
                onComplete: () => {
                    isRight = false;
                    isAnimating = false;
                    updateArrow();
                }
            });
        }

        // Flash the middle divider
        gsap.fromTo(middle,
            { backgroundColor: '#ffffff' },
            { backgroundColor: '#ff0000', duration: 0.5, ease: 'power2.out' }
        );
    }

    function updateArrow() {
        gsap.to(arrow, {
            rotation: isRight ? 180 : 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        });
    }











    
 const bnrTitle = document.getElementById("bnrTopTitle");
    const bnrLetters = bnrTitle.textContent.split("");
    bnrTitle.innerHTML = "";
    bnrLetters.forEach(letter => {
      const span = document.createElement("span");
      span.textContent = letter;
      bnrTitle.appendChild(span);
    });

    /* --------------------------------------
       3. MAIN TIMELINE
    -------------------------------------- */
    const tl = gsap.timeline({ delay: .2 });

    /* --------------------------------------
       4. Animate #bnrTopTitle AFTER #text
    -------------------------------------- */
    tl.from("#bnrTopTitle span", {
      opacity: 0,
      y: 20,
      // filter: "blur(5px)",
      ease: "power3.out",
      duration: 1.6,
      stagger: 0.08
    });













    
/* ═══════════════════════════════════════════════════════════
   GSAP INITIALISATION
═══════════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* ── Elements ── */
const inner       = document.getElementById('inner-container');
const progressBar = document.getElementById('progressBar');

/* ═══════════════════════════════════════════════════════════
   VIRTUAL SCROLL (lerp-based, drives inner-container Y)
   Body overflow:hidden — we translate #inner-container.
═══════════════════════════════════════════════════════════ */
let scrollY   = 0;   // current smooth position
let scrollDst = 0;   // target position
let maxScroll = 0;

function computeMax() {
  maxScroll = inner.scrollWidth  - window.innerWidth;
}
computeMax();
window.addEventListener('resize', computeMax);

/* Wheel */
window.addEventListener('wheel', e => {
  scrollDst = Math.max(0, Math.min(scrollDst + e.deltaY * 1, maxScroll));
}, { passive: true });

/* Touch */
let touchX0 = 0;
window.addEventListener('touchstart', e => { touchX0 = e.touches[0].clientX; });
window.addEventListener('touchmove', e => {
  const delta = touchX0 - e.touches[0].clientX;    // ← clientY → clientX
  touchX0 = e.touches[0].clientX;
  scrollDst = Math.max(0, Math.min(scrollDst + delta, maxScroll));
});
/* ═══════════════════════════════════════════════════════════
   CURSOR
═══════════════════════════════════════════════════════════ */
let mx = 0, my = 0, rx = 0, ry = 0;
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

/* ═══════════════════════════════════════════════════════════
   RAF LOOP — scroll lerp + parallax + cursor + progress
═══════════════════════════════════════════════════════════ */
function lerp(a, b, t) { return a + (b - a) * t; }

gsap.ticker.add(() => {
  /* ── smooth scroll ── */
  scrollY = lerp(scrollY, scrollDst, 0.085);
  gsap.set(inner, { x: -scrollY });

  /* ── CRITICAL: tell ScrollTrigger the scroll position changed
     Must be inside this ticker so it fires AFTER every lerp step.
     This is what makes onLeaveBack / reverse actually trigger. ── */
  ScrollTrigger.update();

  /* ── progress bar ── */
  progressBar.style.width = (scrollY / maxScroll * 100) + '%';

  /* ── cursor ── */
  rx = lerp(rx, mx, 0.14);
  ry = lerp(ry, my, 0.14);

  /* ── card parallax (bg + content layers) ── */
  document.querySelectorAll('.card').forEach(card => {
    const rect = card.getBoundingClientRect();
    if (rect.bottom < 0 || rect.top > window.innerHeight) return;

    const relX = (rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth;

    const bg      = card.querySelector('.card__bg');
    const content = card.querySelector('.card__content');

    if (bg)      gsap.set(bg,      { y: relX * 55 });
    if (content) gsap.set(content, { y: relX * -18 });
  });
});

/* ═══════════════════════════════════════════════════════════
   HERO ENTRANCE (one-shot on load)
═══════════════════════════════════════════════════════════ */
gsap.timeline({ delay: 0.3 })
  .from('.hero-kicker',     { opacity: 0, x: -20, duration: 0.8, ease: 'power3.out' })
  .from('.hero-title',      { opacity: 0, y: 40,  duration: 1.0, ease: 'expo.out'   }, '-=0.5')
  .from('.hero-body',       { opacity: 0, y: 20,  duration: 0.8, ease: 'power2.out' }, '-=0.5')
  .from('.hero-scroll-cue', { opacity: 0, duration: 0.6, ease: 'power1.out'          }, '-=0.3');

/* ═══════════════════════════════════════════════════════════
   CARD ENTRANCE — ScrollTrigger on the virtual scroller
   We use a proxy so ScrollTrigger reads our scrollY.
═══════════════════════════════════════════════════════════ */

/* ScrollTrigger proxy: tells GSAP our virtual scroll position */
ScrollTrigger.scrollerProxy(inner, {
  scrollLeft(val) {                                   // ← was scrollTop
    if (arguments.length) { scrollDst = val; scrollY = val; }
    return scrollY;
  },
  getBoundingClientRect() {
    return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
  },
  pinType: 'transform',
  horizontal: true                                    // ← add this
});

/* Update ScrollTrigger every frame — handled inside the main ticker above */
ScrollTrigger.defaults({ scroller: inner });

/* ── Card entrance + reverse animations ── */
document.querySelectorAll('.card').forEach((card, i) => {
 gsap.fromTo(card,
  { opacity: 0, scale: 0.75, x: 70, immediateRender: false },   // ← y→x
  {
    opacity: 1, scale: 1, x: 0,                                  // ← y→x
    duration: 0.9,
    ease: 'expo.out',
    scrollTrigger: {
      trigger: card,
      scroller: inner,
      horizontal: true,                   // ← add this
      start: 'left 92%',                 // ← top→left
      end:   'left 30%',                 // ← top→left
      toggleActions: 'play none none reverse',
    }
  }
);
});

