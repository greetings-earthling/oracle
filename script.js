/* Clean Luck Meter widgets (no eval, CSP safe)
   - Most widgets: one use per page load (refresh to reset)
   - Dinner + Watch: rerolls allowed
   - Uses window.WATCHLIST, window.DINNERLIST (or window.FOODLIST), window.FORTUNES (optional)
*/

window.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // -------- reveal animation (glyph scramble) --------
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789⌁⟡⟢⌬⟣⟠⟟⟞⌇⌁";
  function scrambleTo(el, finalText, opts = {}) {
    const durationMs = opts.durationMs ?? 520;
    const fps = opts.fps ?? 30;
    const steps = Math.max(8, Math.floor((durationMs / 1000) * fps));
    let i = 0;

    const target = String(finalText);
    const len = clamp(target.length, 6, 64);

    const timer = setInterval(() => {
      i++;
      const lock = Math.floor((i / steps) * len);

      let out = "";
      for (let k = 0; k < len; k++) {
        if (k < lock) out += target[k] ?? " ";
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      el.textContent = out.trimEnd();

      if (i >= steps) {
        clearInterval(timer);
        el.textContent = target;
      }
    }, Math.floor(1000 / fps));
  }

  // -------- one-use button helper --------
  function oneShot(btn, sub, after, onRun) {
    if (!btn) return;
    btn.addEventListener("click", () => {
      if (btn.disabled) return;
      btn.disabled = true;
      if (sub) sub.textContent = "Received.";
      if (typeof onRun === "function") onRun();
      if (after) after.hidden = false;
    });
  }

  // -------- data (starter content) --------
  const WISDOM = [
    "Proceed. But do not rush the outcome.",
    "Take the obvious win. Ignore the dramatic one.",
    "Ask for the smaller thing. It arrives faster.",
    "Today rewards precision, not volume.",
    "If it feels loud, it is not for you.",
    "Do one useful thing. Then stop.",
    "Choose the option that leaves you calm after."
  ];

  const JOKES = [
    "I tried to read a book on anti-gravity. Couldn’t put it down.",
    "I told my computer I needed a break. It said: no problem, I’ll go to sleep.",
    "I’m on a whiskey diet. I’ve lost three days.",
    "My psychic told me I’d avoid tragedy. So I stayed home and stubbed my toe."
  ];

  const FACTS = [
    "Honey never spoils. Archaeologists have found edible honey in ancient tombs.",
    "Octopuses have three hearts.",
    "A day on Venus is longer than a year on Venus.",
    "Bananas are berries. Strawberries are not."
  ];

  const WORDS = [
    { w: "sonder", d: "the realization that every person has a life as vivid as yours" },
    { w: "liminal", d: "in-between, at a threshold" },
    { w: "reverie", d: "a state of daydreaming" },
    { w: "quietude", d: "calmness and stillness" }
  ];

  const TAROT = [
    { c: "The Fool", m: "Start. Learn by moving." },
    { c: "The Magician", m: "Use what you already have." },
    { c: "The High Priestess", m: "Keep it private. Trust the signal." },
    { c: "The Wheel of Fortune", m: "Timing is the whole trick." },
    { c: "The Sun", m: "Say yes to what is simple." }
  ];

  const PLACES = [
    "A quiet diner",
    "A used bookstore",
    "A lakeshore parking lot at dusk",
    "A museum gift shop",
    "A small town arena",
    "A grocery store aisle you never use"
  ];

  const TEASERS = [
    "Brain Teaser: What has keys but can’t open locks?",
    "Brain Teaser: What gets wetter the more it dries?",
    "Brain Teaser: What can travel around the world while staying in a corner?"
  ];
  const TEASER_ANSWERS = {
    "Brain Teaser: What has keys but can’t open locks?": "A piano.",
    "Brain Teaser: What gets wetter the more it dries?": "A towel.",
    "Brain Teaser: What can travel around the world while staying in a corner?": "A stamp."
  };

  // -------- Luck Aura scoring --------
  function randNormal(mean, sd) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * sd;
  }
  function rollAura() {
    // Usually closer to 70, but can swing
    const raw = randNormal(70, 14);
    return Math.round(clamp(raw, 0, 100));
  }
  function auraLine(pct) {
    if (pct <= 25) return "Low luck. Proceed with caution.";
    if (pct <= 45) return "Luck is low. Keep it simple.";
    if (pct <= 65) return "Neutral luck. You steer.";
    if (pct <= 82) return "Favourable luck. Take the easy wins.";
    return "High luck. Momentum is real.";
  }
  function auraAfter(pct) {
    if (pct <= 45) return "It’s a make-your-own-luck kind of day.";
    if (pct <= 65) return "Nothing dramatic. Just be consistent.";
    return "If there’s a good opening, take it.";
  }

  // -------- Colour pair (nice colours via HSL -> hex) --------
  function hslToHex(h, s, l) {
    // h 0-360, s/l 0-100
    s /= 100; l /= 100;
    const c = (1 - Math.abs(2*l - 1)) * s;
    const x = c * (1 - Math.abs(((h/60) % 2) - 1));
    const m = l - c/2;
    let r=0,g=0,b=0;

    if (h < 60) { r=c; g=x; b=0; }
    else if (h < 120) { r=x; g=c; b=0; }
    else if (h < 180) { r=0; g=c; b=x; }
    else if (h < 240) { r=0; g=x; b=c; }
    else if (h < 300) { r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }

    const toHex = (v) => {
      const n = Math.round((v + m) * 255);
      return n.toString(16).padStart(2, "0");
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  function rollNiceHex() {
    const h = Math.floor(Math.random() * 360);
    const s = 62 + Math.floor(Math.random() * 26);  // 62-87
    const l = 44 + Math.floor(Math.random() * 16);  // 44-59
    return hslToHex(h, s, l);
  }

  // -------- Numbers --------
  function rollOneToTen() {
    return 1 + Math.floor(Math.random() * 10);
  }
  function rollLotto6() {
    const set = new Set();
    while (set.size < 6) set.add(1 + Math.floor(Math.random() * 49));
    return Array.from(set).sort((a,b)=>a-b);
  }

  // -------- Watch list meta --------
  function fmtWatchMeta(item){
    if (!item) return "";
    const t = item.type || "";
    const y = item.year || "";
    return [t, y].filter(Boolean).join(" • ");
  }

  // -------- Widgets wiring --------

  // Wisdom
  oneShot($("wisdomBtn"), $("wisdomSub"), $("wisdomAfter"), () => {
    const el = $("wisdomReveal");
    const msg = pick(WISDOM);
    scrambleTo(el, msg);
    $("wisdomAfter").textContent = "Keep it small. One move is enough.";
  });

  // Aura
  oneShot($("auraBtn"), $("auraSub"), $("auraAfter"), () => {
    const pct = rollAura();
    const el = $("auraReveal");
    scrambleTo(el, `${pct}%  ${auraLine(pct)}`);
    $("auraAfter").textContent = auraAfter(pct);
  });

  // Colours (pair)
  oneShot($("colorsBtn"), $("colorsSub"), $("colorsAfter"), () => {
    const c1 = rollNiceHex();
    let c2 = rollNiceHex();
    while (c2 === c1) c2 = rollNiceHex();

    const sw1 = $("sw1");
    const sw2 = $("sw2");
    if (sw1) sw1.style.background = c1;
    if (sw2) sw2.style.background = c2;

    const txt = $("colorsText");
    scrambleTo(txt, `${c1}  +  ${c2}`, { durationMs: 420 });

    $("colorsAfter").textContent = "Use them for a choice, a mood, or a tie-breaker.";
  });

  // Numbers
  oneShot($("numsBtn"), $("numsSub"), $("numsAfter"), () => {
    const one = rollOneToTen();
    const lotto = rollLotto6();
    const el = $("numsReveal");
    scrambleTo(el, `Sign: ${one}   |   Lotto: ${lotto.join(", ")}`, { durationMs: 560 });
    $("numsAfter").textContent = "Notice the sign number today. Treat it like a nudge.";
  });

  // Dinner (rerolls allowed)
  const dinnerBtn = $("dinnerBtn");
  if (dinnerBtn) {
    dinnerBtn.addEventListener("click", () => {
      const list = window.DINNERLIST || window.FOODLIST || [];
      const el = $("dinnerReveal");
      if (!el) return;

      if (!list.length) {
        el.textContent = "Add dinnerlist.js (window.DINNERLIST).";
        const after = $("dinnerAfter");
        if (after) { after.hidden = false; after.textContent = "No list loaded."; }
        return;
      }

      const pickItem = pick(list);
      const out = typeof pickItem === "string" ? pickItem : (pickItem.title || "—");
      scrambleTo(el, out, { durationMs: 420 });

      const after = $("dinnerAfter");
      if (after) { after.hidden = false; after.textContent = "Reroll if it’s not speaking to you."; }
    });
  }

  // Watch (rerolls allowed)
  const watchBtn = $("watchBtn");
  if (watchBtn) {
    watchBtn.addEventListener("click", () => {
      const list = window.WATCHLIST || [];
      const el = $("watchReveal");
      const meta = $("watchMeta");
      if (!el || !meta) return;

      if (!list.length) {
        el.textContent = "Add watchlist.js (window.WATCHLIST).";
        meta.textContent = "";
        const after = $("watchAfter");
        if (after) { after.hidden = false; after.textContent = "No list loaded."; }
        return;
      }

      // light tick effect, but fast
      let steps = 18 + Math.floor(Math.random() * 10);
      let delay = 18;

      const tick = () => {
        const item = pick(list);
        el.textContent = item.title || "—";
        meta.textContent = fmtWatchMeta(item);
        steps--;

        if (steps > 0) {
          delay += 10;
          setTimeout(tick, delay);
        } else {
          // final pick with scramble
          const final = pick(list);
          scrambleTo(el, final.title || "—", { durationMs: 360 });
          meta.textContent = fmtWatchMeta(final);

          const after = $("watchAfter");
          if (after) { after.hidden = false; after.textContent = "Reroll if you hate it."; }
        }
      };

      tick();
    });
  }

  // Joke
  oneShot($("jokeBtn"), $("jokeSub"), $("jokeAfter"), () => {
    const el = $("jokeReveal");
    const msg = pick(JOKES);
    scrambleTo(el, msg, { durationMs: 520 });
    $("jokeAfter").textContent = "You’re welcome. I’m sorry.";
  });

  // Fact
  oneShot($("factBtn"), $("factSub"), $("factAfter"), () => {
    const el = $("factReveal");
    const msg = pick(FACTS);
    scrambleTo(el, msg, { durationMs: 520 });
    $("factAfter").textContent = "Do nothing with that information. Just keep it.";
  });

  // Word
  oneShot($("wordBtn"), $("wordSub"), $("wordAfter"), () => {
    const el = $("wordReveal");
    const item = pick(WORDS);
    scrambleTo(el, `${item.w.toUpperCase()}: ${item.d}`, { durationMs: 560 });
    $("wordAfter").textContent = "Try using it once today.";
  });

  // Tarot
  oneShot($("tarotBtn"), $("tarotSub"), $("tarotAfter"), () => {
    const el = $("tarotReveal");
    const item = pick(TAROT);
    scrambleTo(el, `${item.c}  |  ${item.m}`, { durationMs: 560 });
    $("tarotAfter").textContent = "Treat it like a prompt, not a prophecy.";
  });

  // Place
  oneShot($("placeBtn"), $("placeSub"), $("placeAfter"), () => {
    const el = $("placeReveal");
    const msg = pick(PLACES);
    scrambleTo(el, msg, { durationMs: 520 });
    $("placeAfter").textContent = "If you can’t go there, imagine it for ten seconds.";
  });

  // Teaser
  oneShot($("teaserBtn"), $("teaserSub"), $("teaserAfter"), () => {
    const el = $("teaserReveal");
    const q = pick(TEASERS);
    scrambleTo(el, q, { durationMs: 520 });

    const after = $("teaserAfter");
    after.textContent = `Answer: ${TEASER_ANSWERS[q] || "—"}`;
  });

});
