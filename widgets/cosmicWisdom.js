(function () {
  window.ALIEN_TABLET.register(({ pick, glyphBurst, lockButton }) => {
    const btn = document.getElementById("btn-wisdom");
    const out = document.getElementById("res-wisdom");
    if (!btn || !out) return;

    btn.addEventListener("click", async () => {
      const list = window.WISDOMLIST || [];
      const msg = list.length ? pick(list) : "WISDOMLIST missing.";
      lockButton(btn);
      await glyphBurst(out, msg, { duration: 980, tickMs: 34 });
    });
  });
})();
