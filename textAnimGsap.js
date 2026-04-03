/* ════════════════════════════════════════════════
   .gsapTextBlurAnim  —  copy this block to your project
   ════════════════════════════════════════════════ */
function initBlurTextAnim() {
  const targets = document.querySelectorAll('.gsapTextBlurAnim');

  targets.forEach(el => {
    // ── 1. Split text into individual <span class="char"> ──
    const originalHTML = el.innerHTML;

    // Walk child nodes so we don't break nested tags (e.g. <strong>)
    function wrapChars(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        [...node.textContent].forEach(ch => {
          const span = document.createElement('span');
          span.className = 'char';
          span.textContent = ch;
          frag.appendChild(span);
        });
        return frag;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        node.childNodes.forEach(child => clone.appendChild(wrapChars(child)));
        return clone;
      }
      return node.cloneNode(true);
    }

    el.innerHTML = '';
    // Re-parse original HTML safely
    const tmp = document.createElement('div');
    tmp.innerHTML = originalHTML;
    tmp.childNodes.forEach(n => el.appendChild(wrapChars(n)));

    const chars = el.querySelectorAll('.char');

    // ── 2. Set initial hidden state ──
    gsap.set(chars, {
      filter: 'blur(3px)',
      y: -10,
      opacity: 0,
    });

    // ── 3. ScrollTrigger animation ──
    gsap.to(chars, {
      filter:   'blur(0px)',
      y:        0,
      opacity:  1,
      duration: 0.55,
      ease:     'power2.out',
      stagger:  0.04,           // delay between each character

      scrollTrigger: {
        trigger: el,
        start:   'top 85%',      // fires when element top hits 85% of viewport
        toggleActions: 'play none none none',
      }
    });
  });
}

initBlurTextAnim();
/* ════════════════════════════════════════════════ */