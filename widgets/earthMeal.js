(function () {
  window.ALIEN_TABLET.register(({ pick, glyphBurst, lockButton }) => {
    const btn = document.getElementById("btn-meal");
    const out = document.getElementById("res-meal");
    if (!btn || !out) return;

    btn.addEventListener("click", async () => {
      const list = window.DINNERLIST || window.FOODLIST || [];
      const meal = list.length ? pick(list) : "Dinner list missing.";
      lockButton(btn);
      await glyphBurst(out, meal, { duration: 920, tickMs: 34 });
    });
  });
})();
