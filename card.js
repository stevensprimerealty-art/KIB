// cards.js
window.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "kib_card_state_v1";

  const defaultState = {
    krw: { enabled: true, flipped: false },
    usd: { enabled: true, flipped: false },
  };

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      const parsed = JSON.parse(raw);

      // merge safely
      return {
        krw: { ...defaultState.krw, ...(parsed.krw || {}) },
        usd: { ...defaultState.usd, ...(parsed.usd || {}) },
      };
    } catch {
      return structuredClone(defaultState);
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  const state = loadState();

  const toggles = document.querySelectorAll(".toggle-btn");
  const flipCards = document.querySelectorAll("[data-flip-card]");

  function applyUI(cardKey) {
    const toggleBtn = document.querySelector(`.toggle-btn[data-card="${cardKey}"]`);
    const flipBtn = document.querySelector(`[data-flip-card="${cardKey}"]`);

    if (!toggleBtn || !flipBtn) return;

    const enabled = !!state[cardKey]?.enabled;
    const flipped = !!state[cardKey]?.flipped;

    // toggle button text + aria
    toggleBtn.textContent = enabled ? "Card Enabled" : "Card Disabled";
    toggleBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
    toggleBtn.classList.toggle("is-off", !enabled);

    // disabled look
    flipBtn.classList.toggle("is-disabled", !enabled);

    // flip state
    flipBtn.classList.toggle("is-flipped", flipped);
  }

  // Init UI
  applyUI("krw");
  applyUI("usd");

  // Enable/disable click
  toggles.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.card; // "krw" | "usd"
      if (!key || !state[key]) return;

      state[key].enabled = !state[key].enabled;

      // Optional: if disabling, force front side
      if (!state[key].enabled) state[key].flipped = false;

      saveState(state);
      applyUI(key);
    });
  });

  // Flip click (tap card image)
  flipCards.forEach((cardBtn) => {
    cardBtn.addEventListener("click", () => {
      const key = cardBtn.dataset.flipCard; // "krw" | "usd"
      if (!key || !state[key]) return;

      // if disabled, don’t flip
      if (!state[key].enabled) return;

      state[key].flipped = !state[key].flipped;
      saveState(state);
      applyUI(key);
    });
  });
});
