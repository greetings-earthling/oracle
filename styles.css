// script.js
window.addEventListener("DOMContentLoaded", () => {
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟢⌬⟣⟠⟟⟞⌇";

  function isLongText(t){
    const s = String(t || "");
    return s.length > 18 || /\s/.test(s);
  }

  function ensureInner(btn){
    if (!btn.querySelector(".revealInner")) {
      btn.innerHTML = `<span class="revealInner"></span>`;
    }
    return btn.querySelector(".revealInner");
  }

  function setRevealContent(btn, text){
    const t = String(text);
    const inner = ensureInner(btn);
    inner.textContent = t;

    if (isLongText(t)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");
  }

  function scrambleTo(btn, finalText, ms = 420){
    const target = String(finalText);
    const len = clamp(target.length, 4, 40);
    const steps = 14;
    let i = 0;

    const inner = ensureInner(btn);

    if (isLongText(target)) btn.classList.add("isLong");
    else btn.classList.remove("isLong");

    const timer = setInterval(() => {
      i++;
      const lock = Math.floor((i / steps) * len);
      let out = "";

      for (let k = 0; k < len; k++) {
        out += (k < lock) ? (target[k] || "") : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }

      inner.textContent = out;

      if (i >= steps) {
        clearInterval(timer);
        inner.textContent = target;
      }
    }, ms / steps);
  }

  function markDone(btn){
    btn.classList.add("isDone");
    btn.disabled = true;
  }

  function bind(id, mode, run){
    const btn = document.getElementById(id);
    if (!btn) return;

    // initial inner wrapper (makes layout stable)
    ensureInner(btn);
    btn.querySelector(".revealInner").textContent = btn.textContent.trim() || "TAP TO REVEAL";

    btn.addEventListener("click", () => {
      if (mode === "oneshot" && btn.disabled) return;
      run(btn);
      if (mode === "oneshot") markDone(btn);
    });
  }

  /* DATA */
  const WISDOM = [
    "Proceed. But do not rush.",
    "Choose the calm option.",
    "One useful move is enough.",
    "Take the obvious win.",
    "Quiet beats loud today."
  ];

  const TAROT = [
    ["The Fool", "Start. Learn by moving."],
    ["The Sun", "Say yes to what is simple."],
    ["The Magician", "Use what you have."],
    ["Wheel of Fortune", "Timing matters."]
  ];

  const FACTS = [
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "Bananas are berries."
  ];

  const JOKES = [
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I’m on a whiskey diet. I’ve lost three days."
  ];

  // Weighted Luck Meter messages (edit these later)
  const AURA = [
    { w: 2, text: "Low Fortune Today. Luck is quiet. Move carefully and keep decisions small." },
    { w: 3, text: "Uneven Currents. Things may not flow smoothly. Double-check before committing." },
    { w: 4, text: "Thin Air. Energy is light. Keep expectations realistic." },
    { w: 6, text: "Slight Interference. Minor friction. Stay patient." },
    { w: 10, text: "Neutral Field. Balanced. It’s a make-your-own-luck kind of day." },
    { w: 10, text: "Subtle Tailwind. A small lift is present. Take the simple win." },
    { w: 7, text: "Favorable Momentum. Timing is leaning in your direction." },
    { w: 5, text: "Strong Fortune. Good odds today. Move forward." },
    { w: 2, text: "High Alignment. Momentum is real. Trust the opening." },
    { w: 1, text: "Rare Alignment. Unusually lucky. This is a green-light day." }
  ];

  function pickWeighted(list){
    const total = list.reduce((sum, it) => sum + (it.w || 0), 0);
    let r = Math.random() * total;
    for (const it of list){
      r -= (it.w || 0);
      if (r <= 0) return it;
    }
    return list[list.length - 1];
  }

  function rollNiceHex(){
    const h = Math.floor(Math.random() * 360);
    const s = 70, l = 55;
    const a = s / 100, l2 = l / 100;
    const c = (1 - Math.abs(2 * l2 - 1)) * a;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l2 - c / 2;

    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }

    const toHex = (v) => Math.round((v + m) * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /* WIDGETS */
  bind("reveal-aura", "oneshot", (btn) => {
    const item = pickWeighted(AURA);
    scrambleTo(btn, item.text, 520);
    btn.classList.add("isLong");
  });

  bind("reveal-colours", "oneshot", (btn) => {
    btn.classList.add("colours", "isDone");
    btn.disabled = true;
    btn.innerHTML = "";

    const a = rollNiceHex();
    let b = rollNiceHex();
    while (b === a) b = rollNiceHex();

    const box1 = document.createElement("div");
    box1.className = "colourBox";
    box1.style.background = a;
    box1.textContent = a;

    const box2 = document.createElement("div");
    box2.className = "colourBox";
    box2.style.background = b;
    box2.textContent = b;

    btn.appendChild(box1);
    btn.appendChild(box2);
  });

  bind("reveal-wisdom", "oneshot", (btn) => {
    const msg = pick(WISDOM);
    scrambleTo(btn, msg, 520);
    btn.classList.add("isLong");
  });

  bind("reveal-number", "oneshot", (btn) => {
    const n = 1 + Math.floor(Math.random() * 10);
    scrambleTo(btn, n, 360);
  });

  bind("reveal-joke", "oneshot", (btn) => {
    scrambleTo(btn, pick(JOKES), 560);
    btn.classList.add("isLong");
  });

  bind("reveal-tarot", "oneshot", (btn) => {
    const [card, msg] = pick(TAROT);
    // show both in the reveal panel, but keep it simple
    scrambleTo(btn, `${card}. ${msg}`, 560);
    btn.classList.add("isLong");
  });

  bind("reveal-dinner", "reroll", (btn) => {
    const list = window.DINNERLIST || [];
    const text = list.length ? pick(list) : "Add dinnerlist.js";
    setRevealContent(btn, text);
    btn.classList.add("isDone", "isLong");
    btn.disabled = false;
  });

  bind("reveal-watch", "reroll", (btn) => {
    const list = window.WATCHLIST || [];
    const text = list.length ? (pick(list).title || "—") : "Add watchlist.js";
    setRevealContent(btn, text);
    btn.classList.add("isDone", "isLong");
    btn.disabled = false;
  });

  bind("reveal-fact", "oneshot", (btn) => {
    scrambleTo(btn, pick(FACTS), 520);
    btn.classList.add("isLong");
  });
});
