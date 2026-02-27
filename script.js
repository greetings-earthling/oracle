// script.js
window.addEventListener("DOMContentLoaded", () => {

  // smoke video
  const FX_SRC = "./ads/Smoke.mp4";

  // timing
  const SMOKE_ONLY_MS     = 1500;  // 0–1.5s smoke only
  const SMOKE_FADE_START  = 1500;  // start fade at 1.5s
  const SMOKE_FADE_MS     = 1000;  // 1.5–2.5 fade out
  const TEXT_START_MS     = 2000;  // start text at 2.0s (while smoke fading)
  const TEXT_FADE_MS      = 1500;  // 2.0–3.5 fade in
  const TOTAL_MS          = 3500;  // end

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  function isLongText(t){
    const s = String(t || "");
    return s.length > 18 || /\s/.test(s);
  }

  function ensureInner(btn){
    let inner = btn.querySelector(".revealInner");
    if (!inner){
      btn.innerHTML = `<span class="revealInner">TAP TO REVEAL</span>`;
      inner = btn.querySelector(".revealInner");
    }
    return inner;
  }

  function ensureFX(btn){
    let video = btn.querySelector(".fxVideo");
    if (!video){
      video = document.createElement("video");
      video.className = "fxVideo";
      video.src = FX_SRC;
      video.muted = true;
      video.playsInline = true;
      video.preload = "auto";
      btn.insertBefore(video, btn.firstChild);
    }

    let tint = btn.querySelector(".fxTint");
    if (!tint){
      tint = document.createElement("div");
      tint.className = "fxTint";
      btn.insertBefore(tint, video.nextSibling);
    }

    return { video, tint };
  }

  // colour “blob” gradients (complex, not stripes)
  const rint = (a,b)=> a + Math.floor(Math.random()*(b-a+1));
  const hsla = (h,a)=> `hsla(${h}, 85%, 58%, ${a})`;

  function buildTintGradient(hues){
    const [h1,h2,h3] = hues;

    const blobs = [
      { h:h1, x:rint(18,82), y:rint(18,82), a:0.55, s:rint(40,78) },
      { h:h2, x:rint(18,82), y:rint(18,82), a:0.50, s:rint(38,74) },
      { h:h3, x:rint(18,82), y:rint(18,82), a:0.50, s:rint(36,72) },
      { h:h1, x:rint(18,82), y:rint(18,82), a:0.35, s:rint(45,85) },
    ];

    return blobs.map(b =>
      `radial-gradient(${b.s}% ${b.s}% at ${b.x}% ${b.y}%,
        ${hsla(b.h, b.a)} 0%,
        rgba(0,0,0,0) 64%)`
    ).join(", ");
  }

  // per-widget palettes (hues)
  // Colour widget = no tint (greyscale smoke)
  const PALETTES = {
    "reveal-meter":  [135, 155, 285], // green, deep green, purple
    "reveal-wisdom": [250, 275, 205],
    "reveal-number": [35,  15,  300],
    "reveal-colour": null,
    "reveal-joke":   [320, 285, 205],
    "reveal-tarot":  [190, 165, 275],
    "reveal-dinner": [24,  10,  300],
    "reveal-watch":  [210, 235, 190],
    "reveal-fact":   [265, 285, 160],
  };

  // ----- data -----

  const WISDOM = [
    "Proceed. But do not rush.",
    "Choose the calm option.",
    "One useful move is enough.",
    "Take the obvious win.",
    "Quiet beats loud today.",
  ];

  const JOKES = [
    "Parallel lines have so much in common. It’s a shame they’ll never meet.",
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I told my computer I needed a break. It said: no problem, I’ll go to sleep.",
    "I’m reading a book about teleportation. It’s bound to take me places."
  ];

  const FACTS = [
    "Honey never spoils.",
    "Octopuses have three hearts.",
    "Bananas are berries.",
    "A day on Venus is longer than a year on Venus.",
    "Some turtles can breathe through their butts."
  ];

  const TAROT = [
    ["The Fool","Start. Learn by moving."],
    ["The Sun","Say yes to what is simple."],
    ["The Magician","Use what you have."],
    ["Wheel of Fortune","Timing matters."],
    ["The Hermit","Less noise. More signal."],
    ["Justice","Choose what is fair, not fast."],
    ["Strength","Soft control wins."],
    ["The Star","Stay steady. Keep going."]
  ];

  // Luck meter: text only, weighted (center heavy)
  const METER = [
    { t: "Luck levels are low today. Proceed with caution.", w: 7 },
    { t: "Low luck reading. Keep it simple. No big swings.", w: 9 },
    { t: "Slightly low. Double-check details before you commit.", w: 12 },
    { t: "A little off. Go steady. Choose the sure thing.", w: 14 },
    { t: "Normal luck. It’s a make your own luck kind of day.", w: 20 },
    { t: "Normal luck reading. Consistency wins today.", w: 20 },
    { t: "A bit luckier than usual. Take the easy wins.", w: 16 },
    { t: "Good luck reading. Momentum is real. Use it.", w: 12 },
    { t: "Very lucky. Push the good idea forward.", w: 7 },
    { t: "Big luck. Bold moves are oddly welcome.", w: 3 }
  ];

  function weightedPick(items){
    const total = items.reduce((sum, x) => sum + x.w, 0);
    let r = Math.random() * total;
    for (const it of items){
      r -= it.w;
      if (r <= 0) return it;
    }
    return items[items.length - 1];
  }

  // colour (HSL -> HEX)
  function hslToHex(h, s, l){
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs((h/60) % 2 - 1));
    const m = l - c/2;
    let r=0,g=0,b=0;

    if (h < 60) { r=c; g=x; b=0; }
    else if (h < 120) { r=x; g=c; b=0; }
    else if (h < 180) { r=0; g=c; b=x; }
    else if (h < 240) { r=0; g=x; b=c; }
    else if (h < 300) { r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }

    const toHex = (v) => Math.round((v+m)*255).toString(16).padStart(2,"0");
    return (`#${toHex(r)}${toHex(g)}${toHex(b)}`).toUpperCase();
  }

  function rollNiceHex(){
    const h = Math.floor(Math.random()*360);
    return hslToHex(h, 72, 52);
  }

  function hexToRgb(hex){
    const h = hex.replace("#","");
    return {
      r: parseInt(h.slice(0,2),16),
      g: parseInt(h.slice(2,4),16),
      b: parseInt(h.slice(4,6),16),
    };
  }

  function isDark(hex){
    const {r,g,b} = hexToRgb(hex);
    const lum = (0.2126*r + 0.7152*g + 0.0722*b) / 255;
    return lum < 0.55;
  }

  // ----- reveal sequence (smoke -> fade -> text fades in) -----

  function startSequence(btn, finalText, mode){
    if (btn.classList.contains("isBusy")) return;

    // oneshot lock
    if (mode === "oneshot" && btn.classList.contains("isDone")) return;

    btn.classList.add("isBusy", "isRevealing");
    btn.classList.remove("isDone", "isLong", "isColour");

    const inner = ensureInner(btn);
    const { video, tint } = ensureFX(btn);

    // TAP TO REVEAL disappears immediately
    inner.style.transition = "none";
    inner.style.opacity = "0";
    inner.textContent = "";

    // long/short sizing
    if (isLongText(finalText)) btn.classList.add("isLong");

    // base goes black immediately (so smoke reveals black)
    btn.style.background = "#0b0d12";
    btn.style.color = "#ffffff";

    // tint palette per widget
    const hues = PALETTES[btn.id] ?? [260, 290, 180];
    if (hues){
      tint.style.display = "block";
      tint.style.backgroundImage = buildTintGradient(hues);
      tint.style.opacity = "0.55";
    } else {
      tint.style.display = "none";
      tint.style.opacity = "0";
      tint.style.backgroundImage = "none";
    }

    // start video
    video.style.display = "block";
    video.style.transition = "none";
    tint.style.transition  = "none";
    video.style.opacity = "1";

    try{
      video.pause();
      video.currentTime = 0;
    }catch(e){}

    video.play().catch(()=>{});

    // start text fade-in while smoke is fading
    setTimeout(() => {
      inner.textContent = String(finalText);
      inner.style.transition = `opacity ${TEXT_FADE_MS}ms ease`;
      inner.style.opacity = "1";
    }, TEXT_START_MS);

    // fade smoke + tint away
    setTimeout(() => {
      video.style.transition = `opacity ${SMOKE_FADE_MS}ms ease`;
      tint.style.transition  = `opacity ${SMOKE_FADE_MS}ms ease`;
      video.style.opacity = "0";
      tint.style.opacity  = "0";

      setTimeout(() => {
        video.style.display = "none";
        tint.style.display = "none";
      }, SMOKE_FADE_MS + 30);

    }, SMOKE_FADE_START);

    // finalize
    setTimeout(() => {
      btn.classList.remove("isBusy", "isRevealing");
      btn.classList.add("isDone");

      if (mode === "oneshot") btn.disabled = true;
      else btn.disabled = false;

    }, TOTAL_MS);
  }

  // ----- binds -----

  function bind(id, mode, getText){
    const btn = document.getElementById(id);
    if (!btn) return;

    btn.disabled = false;
    ensureInner(btn);
    ensureFX(btn);

    btn.addEventListener("click", () => {
      const text = getText(btn);
      startSequence(btn, text, mode);
    });
  }

  // meter
  bind("reveal-meter", "oneshot", () => weightedPick(METER).t);

  // colour
  bind("reveal-colour", "oneshot", (btn) => {
    const hex = rollNiceHex();

    // special: after the sequence ends, we want the swatch state.
    // We still run smoke + text fade, but the "finalText" is the hex label.
    // Then we turn it into a swatch right after TOTAL_MS.
    setTimeout(() => {
      btn.classList.add("isColour");
      btn.style.background = hex;

      const label = document.createElement("span");
      label.className = "swatchLabel";
      label.textContent = hex;

      const dark = isDark(hex);
      label.style.color = dark ? "#ffffff" : "#0b0d12";
      label.style.borderColor = dark ? "rgba(255,255,255,.35)" : "rgba(0,0,0,.18)";
      label.style.background = dark ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.45)";

      btn.innerHTML = "";
      btn.appendChild(label);
    }, TOTAL_MS + 10);

    return hex;
  });

  // wisdom
  bind("reveal-wisdom", "oneshot", () => pick(WISDOM));

  // number
  bind("reveal-number", "oneshot", () => String(1 + Math.floor(Math.random()*10)));

  // joke
  bind("reveal-joke", "oneshot", () => pick(JOKES));

  // tarot
  bind("reveal-tarot", "oneshot", () => {
    const [card, msg] = pick(TAROT);
    return `${card} — ${msg}`;
  });

  // dinner (reroll)
  bind("reveal-dinner", "reroll", () => {
    const list = window.DINNERLIST || [];
    return list.length ? pick(list) : "Add dinnerlist.js";
  });

  // watch (reroll)
  bind("reveal-watch", "reroll", () => {
    const list = window.WATCHLIST || [];
    if (!list.length) return "Add watchlist.js";
    const item = pick(list);
    return (typeof item === "string") ? item : (item.title || "—");
  });

  // fact
  bind("reveal-fact", "oneshot", () => pick(FACTS));
});
