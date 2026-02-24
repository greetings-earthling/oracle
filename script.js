/* Luck Meter site logic
   - Uses window.WATCHLIST, window.FORTUNES, window.FOODLIST from separate files
   - Add ?test=1 to URL to show Reset + allow re-spin
*/

const TEST_MODE = new URLSearchParams(location.search).get("test") === "1";

const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* ---------- 8-ball + fortunes ---------- */
const eightAnswers = [
  "Signs point to yes.",
  "Yes.",
  "No.",
  "Ask again later.",
  "Outlook not so good.",
  "Cannot predict now.",
  "Don’t count on it.",
  "Without a doubt."
];

$("eightBall").addEventListener("click", () => {
  $("eightResult").textContent = pick(eightAnswers);
});

$("cookie").addEventListener("click", () => {
  const list = window.FORTUNES || [];
  $("fortuneResult").textContent = list.length ? pick(list) : "Add fortunes.js (window.FORTUNES).";
});

/* ---------- Mini tiles ---------- */
const emojis = ["🍀","✨","😌","🔥","🧠","🌈","🧿","🪄","🫶","😈","😇","🌀"];

const colors = [
  { name: "Green", hex: "#22c55e" },
  { name: "Purple", hex: "#875da6" },
  { name: "Sky", hex: "#60a5fa" },
  { name: "Gold", hex: "#f59e0b" },
  { name: "Coral", hex: "#fb7185" },
  { name: "Mint", hex: "#34d399" },
  { name: "Indigo", hex: "#6366f1" }
];

$("miniNum").addEventListener("click", () => {
  $("numVal").textContent = String(Math.floor(Math.random() * 10)); // 0-9
});

$("miniLetter").addEventListener("click", () => {
  $("letterVal").textContent = String.fromCharCode(65 + Math.floor(Math.random() * 26));
});

$("miniEmoji").addEventListener("click", () => {
  $("emojiVal").textContent = pick(emojis);
});

$("miniColor").addEventListener("click", () => {
  const c = pick(colors);
  $("colorSwatch").style.background = c.hex;
  // keep the 3 lines, just swap line 1 to show name/hex
  $("colorLines").innerHTML = `${c.name} ${c.hex}<br>Wear it if you want.<br>Fight about it later.`;
});

/* ---------- Watch spinner (randomized tick order) ---------- */
const watchBtn = $("watch-spin");
let watchSpinning = false;

function fmtMeta(item){
  if (!item) return "";
  const t = item.type || "";
  const y = item.year || "";
  return [t, y].filter(Boolean).join(" • ");
}

function randomTickSpin(list, onPick){
  // Looks random while spinning (no alphabetical run)
  const minSteps = 24;
  const maxSteps = 38;
  const totalSteps = minSteps + Math.floor(Math.random() * (maxSteps - minSteps + 1));
  let step = 0;
  let delay = 28;
  const delayIncrease = 7;

  function tick(){
    const item = pick(list);
    onPick(item, true);

    step++;
    if (step < totalSteps){
      delay += delayIncrease;
      setTimeout(tick, delay);
    } else {
      const finalPick = pick(list);
      onPick(finalPick, false);
      watchSpinning = false;
      watchBtn.disabled = false;
    }
  }
  tick();
}

watchBtn.addEventListener("click", () => {
  if (watchSpinning) return;

  const list = window.WATCHLIST || [];
  if (!list.length){
    $("watch-title").textContent = "Add watchlist.js (window.WATCHLIST).";
    $("watch-meta").textContent = "";
    return;
  }

  watchSpinning = true;
  watchBtn.disabled = true;

  randomTickSpin(list, (item, isTick) => {
    $("watch-title").textContent = item.title || "—";
    $("watch-meta").textContent = fmtMeta(item);
    // subtle “tick” feel without resizing anything
    $("watch-title").style.transform = isTick ? "translateY(1px)" : "translateY(0)";
  });
});

/* ---------- Luck Meter (bounce + daily lock) ---------- */
const luckSpinBtn = $("luckSpin");
const lmResult = $("lmResult");
const lmMeta = $("lmMeta");
const lmTrack = $("lmTrack");
const lmBall = $("lmBall");
const lmWash = $("lmWash");
const lmBar = $("lmBar");
const devRow = $("devRow");
const resetLuckBtn = $("resetLuck");

let lmSpinning = false;
let lastScore = 5;

function trackWidth(){
  return lmTrack.getBoundingClientRect().width;
}
function tickX(score){
  return (score / 10) * trackWidth();
}
function setBallPx(x){
  lmBall.style.left = `${x}px`;
}

function randNormal(mean, sd){
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return mean + z * sd;
}
function rollLuckScore(){
  // Slightly positive bell curve
  const raw = randNormal(5.8, 1.7);
  return Math.round(clamp(raw, 0, 10));
}

/* Per-number message (you can replace these anytime, emojis included) */
const luckMessages = {
  0: "🧨 0/10. Avoid chaos. Drink water.",
  1: "🪦 1/10. Low luck. High caution.",
  2: "🌧️ 2/10. Quiet day. Don’t push it.",
  3: "🧊 3/10. Small wins only.",
  4: "⚖️ 4/10. Slightly off. Keep it simple.",
  5: "⚖️ 5/10. Neutral. You steer the day.",
  6: "🍀 6/10. Slightly lucky. Small risks pay.",
  7: "✨ 7/10. Good luck. Say yes to ease.",
  8: "🔥 8/10. Strong luck. Go do the thing.",
  9: "🚀 9/10. Big luck. Take the clean shot.",
  10:"👑 10/10. Mega luck. Be bold."
};

function metaForScore(s){
  return luckMessages[s] || `${s}/10.`;
}

function setColourFromT(t){
  // t 0..1. Keep wash consistent: left is red, right is green.
  const badAmt = clamp((0.5 - t) / 0.5, 0, 1);
  const goodAmt = clamp((t - 0.5) / 0.5, 0, 1);

  lmBar.style.background =
    `linear-gradient(90deg,
      rgba(185,28,28,${0.12 + badAmt*0.55}) 0%,
      rgba(107,114,128,0.10) 50%,
      rgba(22,163,74,${0.12 + goodAmt*0.55}) 100%
    )`;

  const xPct = (t * 100).toFixed(2);

  // Force same-side bias (no weird red + green mismatch)
  const leftTone  = 0.06 + badAmt * 0.35;
  const rightTone = 0.06 + goodAmt * 0.35;

  lmWash.style.background =
    `radial-gradient(circle at ${xPct}% 45%,
      rgba(0,0,0,0.02) 0%,
      rgba(0,0,0,0) 18%),
     linear-gradient(90deg,
      rgba(185,28,28,${leftTone}) 0%,
      rgba(107,114,128,0.05) 50%,
      rgba(22,163,74,${rightTone}) 100%
     )`;
}

function setToScore(score){
  lastScore = score;
  setBallPx(tickX(score));
  lmResult.textContent = `Score: ${score} / 10`;
  lmMeta.textContent = metaForScore(score);
  setColourFromT(score / 10);
}

/* daily lock */
function todayKey(){
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function lockIfAlreadySpun(){
  if (TEST_MODE) return false;
  const saved = localStorage.getItem("LUCK_METER_SPUN_DATE");
  if (saved === todayKey()){
    luckSpinBtn.disabled = true;
    luckSpinBtn.textContent = "Come back tomorrow";
    return true;
  }
  return false;
}
function markSpun(){
  if (!TEST_MODE) localStorage.setItem("LUCK_METER_SPUN_DATE", todayKey());
}
function resetSpun(){
  localStorage.removeItem("LUCK_METER_SPUN_DATE");
}

/* triangle wave + settle (no jump) */
function tri01(p){
  const x = p % 1;
  return x < 0.5 ? x * 2 : 2 - x * 2;
}
function easeOutCubic(t){
  return 1 - Math.pow(1 - t, 3);
}

function animateBounceTo(targetScore){
  const w = trackWidth();
  const targetT = targetScore / 10;

  const duration = 5600;
  const bounces = 6;
  const settleMs = 950;

  const start = performance.now();
  const startT = 0.5; // start at 5
  const startDir = Math.random() < 0.5 ? -1 : 1;

  function frame(now){
    const elapsed = now - start;

    if (elapsed < duration){
      const t = elapsed / duration;
      const slow = easeOutCubic(t);

      const phase = bounces * slow;
      let pos = tri01(phase);
      if (startDir < 0) pos = 1 - pos;

      const blend = clamp(elapsed / 520, 0, 1);
      const pos01 = (1 - blend) * startT + blend * pos;

      setBallPx(pos01 * w);
      setColourFromT(pos01);

      requestAnimationFrame(frame);
      return;
    }

    const settleStart = performance.now();
    const ballLeft = lmBall.getBoundingClientRect().left;
    const trackLeft = lmTrack.getBoundingClientRect().left;
    const currentX = clamp(ballLeft - trackLeft, 0, w);
    const currentT = currentX / w;

    function settleStep(n){
      const e = n - settleStart;
      const tt = clamp(e / settleMs, 0, 1);
      const eased = easeOutCubic(tt);

      const pos01 = currentT + (targetT - currentT) * eased;
      setBallPx(pos01 * w);
      setColourFromT(pos01);

      if (tt < 1){
        requestAnimationFrame(settleStep);
      } else {
        lmSpinning = false;
        setToScore(targetScore);
        markSpun();
        luckSpinBtn.disabled = true;
        luckSpinBtn.textContent = "Come back tomorrow";
      }
    }

    requestAnimationFrame(settleStep);
  }

  requestAnimationFrame(frame);
}

function setNeutralStart(){
  setToScore(5);
  lmMeta.textContent = "Neutral start. Tap the button.";
  luckSpinBtn.disabled = false;
  luckSpinBtn.textContent = "How lucky am I today?";
}

/* init */
luckSpinBtn.addEventListener("click", () => {
  if (lmSpinning) return;
  if (lockIfAlreadySpun()) return;

  lmSpinning = true;
  luckSpinBtn.disabled = true;

  lmResult.textContent = "Score: deciding…";
  lmMeta.textContent = "Consulting fate…";

  const score = rollLuckScore();
  animateBounceTo(score);
});

if (TEST_MODE){
  devRow.style.display = "flex";
  resetLuckBtn.addEventListener("click", () => {
    resetSpun();
    setNeutralStart();
    lmMeta.textContent = "Reset. Spin again.";
  });
}

window.addEventListener("load", () => {
  setNeutralStart();
  lockIfAlreadySpun();
});

window.addEventListener("resize", () => {
  if (!lmSpinning){
    setBallPx(tickX(lastScore));
    setColourFromT(lastScore / 10);
  }
});
