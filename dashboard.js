window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  /* ================= STATE ================= */
  const state = {
    index: 1,
    startX: 0,
    currentX: 0,
    dragging: false,

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

  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v ?? 0);
  }

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  /* ================= BALANCE ================= */
  function renderBalances() {
    slides.forEach(slide => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      if (!currency || !el) return;

      el.textContent = formatMoney(state.balance[currency], currency);
    });
  }

  /* ================= SLIDER (REAL FIX) ================= */
  function getWidth() {
    return slider?.getBoundingClientRect().width || 0;
  }

  function updateSlider(animate = true) {
    if (!slider) return;

    const width = getWidth();

    if (!width || width < 10) {
      requestAnimationFrame(() => updateSlider(animate));
      return;
    }

    slider.style.transition = animate ? "transform .35s ease" : "none";
    slider.style.transform = `translateX(-${state.index * width}px)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index]?.classList.add("active");
  }

  /* TOUCH */
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
    slider.style.transform = `translateX(-${state.index * width + dx}px)`;
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

  /* VIEW ALL */
  $("viewAllTx")?.addEventListener("click", () => {
    renderTransactions(state.transactions.length);
  });

  /* ================= POPUP (FIXED CLEAN) ================= */
  function showPopup(html) {
    const popup = $("popup");
    const content = $("popupContent");

    if (!popup || !content) return;

    content.innerHTML = html;
    popup.hidden = false;

    requestAnimationFrame(() => popup.classList.add("show"));

    // 🔥 REPLACE handler (no stacking)
    popup.onclick = (e) => {
      if (e.target.id === "popup" || e.target.id === "closePopup") {
        popup.classList.remove("show");
        setTimeout(() => popup.hidden = true, 200);
      }
    };
  }

  $("transferBtn")?.addEventListener("click", () => {
    showPopup(`
      <h3>Transfer Restricted</h3>
      <button id="closePopup">Close</button>
    `);
  });

  $("notifBtn")?.addEventListener("click", () => {
    showPopup(`
      <h3>Account Restricted</h3>
      <button id="closePopup">Close</button>
    `);
  });

  /* ================= INIT ================= */
  function init() {
    renderBalances();
    renderTransactions(1);
    updateSlider(false);
  }

  // 🔥 DOUBLE FRAME FIX (better than setTimeout)
  requestAnimationFrame(() => {
    requestAnimationFrame(init);
  });

});
