// Core boot + helpers (no modules, works on GitHub Pages)

(function () {
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Alien glyph animation
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟠⟟⟐⟣⟤⟢∿⋇⋈⋉⋊⍜⍝⍟";

  function glyphBurst(el, finalText, opts = {}) {
    const duration = opts.duration ?? 900;
    const tickMs = opts.tickMs ?? 36;
    const prefix = opts.prefix ?? "";

    const start = performance.now();
    const len = Math.max(6, String(finalText).length);
    el.textContent = "";

    return new Promise((resolve) => {
      const t = setInterval(() => {
        const now = performance.now();
        const p = clamp((now - start) / duration, 0, 1);

        const keep = Math.floor(p * len);
        const fixed = String(finalText).slice(0, keep);
        let noise = "";
        for (let i = 0; i < (len - keep); i++) noise += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

        el.textContent = prefix + fixed + noise;

        if (p >= 1) {
          clearInterval(t);
          el.textContent = prefix + String(finalText);
          resolve();
        }
      }, tickMs);
    });
  }

  function lockButton(btn) {
    btn.disabled = true;
    btn.blur();
  }

  // Registry
  window.ALIEN_TABLET = {
    clamp,
    pick,
    glyphBurst,
    lockButton,
    widgets: [],
    register(fn) { this.widgets.push(fn); }
  };

  window.addEventListener("DOMContentLoaded", () => {
    window.ALIEN_TABLET.widgets.forEach((fn) => {
      try { fn(window.ALIEN_TABLET); } catch (e) { console.error(e); }
    });
  });
})();
