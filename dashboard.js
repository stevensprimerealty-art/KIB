window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  /* ================= STATE ================= */
  const state = {
    index: 0,
    startX: 0,
    currentX: 0,
    dragging: false,
    masked: false,

    balance: {
      USD: 882000,
      EUR: 749700,
      KRW: 1299186000
    },

    transactions: JSON.parse(localStorage.getItem("kib_tx")) || [
      {
        id: "REF-882000-KIB",
        type: "Incoming SWIFT Transfer",
        amount: 882000,
        currency: "USD",
        date: "04 May 2026 • 11:05 AM",
        status: "Restricted"
      }
    ]
  };

  /* ================= HELPERS ================= */

  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v ?? 0);
  }

  function mask(v) {
    return state.masked ? "••••••" : v;
  }

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  /* ================= PROFILE IMAGE ================= */

  const avatar = $("avatar");
  const drawerAvatar = $("drawerAvatar");
  const avatarInput = $("avatarInput");

  const saved = localStorage.getItem("kib_avatar");
  const fallback = "https://i.imgur.com/6VBx3io.png";

  function setAvatar(src) {
    if (avatar) avatar.src = src;
    if (drawerAvatar) drawerAvatar.src = src;
  }

  setAvatar(saved || fallback);

  avatar?.addEventListener("click", () => avatarInput?.click());

  avatarInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      localStorage.setItem("kib_avatar", base64);
      setAvatar(base64);
    };
    reader.readAsDataURL(file);
  });

  /* ================= BALANCES ================= */

  function renderBalances() {
    slides.forEach(slide => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      if (!currency || !el) return;

      el.textContent = mask(formatMoney(state.balance[currency], currency));
    });

    updateFX();
  }

  /* ================= FX ================= */

  function updateFX() {
    const fxEl = $("fxValue");
    if (!fxEl) return;

    // base = USD
    const currentCurrency = slides[state.index]?.dataset.currency;

    let valueUSD = state.balance.USD;

    if (currentCurrency === "EUR") valueUSD = state.balance.EUR * 1.08;
    if (currentCurrency === "KRW") valueUSD = state.balance.KRW / 1300;

    fxEl.textContent = mask(formatMoney(valueUSD, "USD"));
  }

  /* ================= SLIDER (REAL FIX) ================= */

  function getWidth() {
    return slider?.parentElement?.offsetWidth || 0;
  }

  function updateSlider(animate = true) {
    if (!slider) return;

    const width = getWidth();

    // 🔥 HARD FAILSAFE
    if (!width) {
      setTimeout(() => updateSlider(animate), 60);
      return;
    }

    slider.style.transition = animate
      ? "transform .35s cubic-bezier(.22,.61,.36,1)"
      : "none";

    slider.style.transform = `translate3d(-${state.index * width}px,0,0)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index]?.classList.add("active");

    updateFX();
  }

  /* ================= TOUCH ================= */

  slider?.addEventListener("touchstart", (e) => {
    state.dragging = true;
    state.startX = e.touches[0].clientX;
    state.currentX = state.startX;
    slider.style.transition = "none";
  }, { passive: true });

  slider?.addEventListener("touchmove", (e) => {
    if (!state.dragging) return;

    state.currentX = e.touches[0].clientX;
    const dx = state.currentX - state.startX;

    const width = getWidth() || 1;

    slider.style.transform = `translate3d(-${state.index * width + dx}px,0,0)`;
  }, { passive: true });

  slider?.addEventListener("touchend", () => {
    if (!state.dragging) return;

    state.dragging = false;

    const dx = state.currentX - state.startX;

    if (dx > 60) state.index--;
    if (dx < -60) state.index++;

    state.index = Math.max(0, Math.min(state.index, slides.length - 1));

    updateSlider(true);
  });

  /* ================= MASK TOGGLE ================= */

  $("toggleBalance")?.addEventListener("click", () => {
    state.masked = !state.masked;
    renderBalances();
  });

  /* ================= TRANSACTIONS ================= */

  const txList = $("txList");

  function renderTransactions(limit = 1) {
    if (!txList) return;

    txList.innerHTML = "";

    const data = state.transactions.slice(0, limit);

    if (!data.length) {
      txList.innerHTML = `<div class="empty">No transactions</div>`;
      return;
    }

    data.forEach(tx => {
      const el = document.createElement("div");
      el.className = "tx";

      el.innerHTML = `
        <div>
          <div class="tx-title">${tx.type}</div>
          <small>${tx.date}</small>
        </div>
        <div class="tx-amount ${tx.amount > 0 ? "credit" : "debit"}">
          ${tx.amount > 0 ? "+" : "-"}${formatMoney(Math.abs(tx.amount), tx.currency)}
        </div>
      `;

      txList.appendChild(el);
    });
  }

  /* ================= VIEW ALL ================= */

  let expanded = false;

  $("viewAllTx")?.addEventListener("click", () => {
    expanded = !expanded;
    renderTransactions(expanded ? state.transactions.length : 1);
  });

  /* ================= POPUP ================= */

  function showPopup(html) {
    const popup = $("popup");
    const content = $("popupContent");

    if (!popup || !content) return;

    content.innerHTML = html;
    popup.hidden = false;

    requestAnimationFrame(() => popup.classList.add("show"));

    popup.onclick = (e) => {
      if (e.target.id === "popup" || e.target.id === "closePopup") {
        popup.classList.remove("show");
        setTimeout(() => popup.hidden = true, 200);
      }
    };
  }

  $("transferBtn")?.addEventListener("click", () => {
    showPopup(`<h3>Transfer Restricted</h3><button id="closePopup">Close</button>`);
  });

  $("notifBtn")?.addEventListener("click", () => {
    showPopup(`<h3>Account Notice</h3><button id="closePopup">Close</button>`);
  });

  /* ================= DRAWER ================= */

  const drawer = $("drawer");
  const backdrop = $("drawerBackdrop");

  $("menuBtn")?.addEventListener("click", () => {
    drawer?.classList.add("open");
    backdrop.hidden = false;
  });

  function closeDrawer() {
    drawer?.classList.remove("open");
    backdrop.hidden = true;
  }

  backdrop?.addEventListener("click", closeDrawer);
  $("closeDrawer")?.addEventListener("click", closeDrawer);

  /* ================= INIT (REAL FIX) ================= */

  function init() {
    renderBalances();
    renderTransactions(1);
    state.index = 0;

    // 🔥 guaranteed layout ready
    setTimeout(() => {
      updateSlider(false);
    }, 80);
  }

  window.addEventListener("load", init);

});
