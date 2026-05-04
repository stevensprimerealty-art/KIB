window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  /* =========================
     STATE
  ========================= */
  const state = {
    index: 1, // start on USD
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

  /* =========================
     HELPERS
  ========================= */
  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v ?? 0);
  }

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  /* =========================
     BALANCE RENDER
  ========================= */
  function renderBalances() {
    slides.forEach(slide => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      if (!currency || !el) return;

      const value = state.balance[currency] ?? 0;
      el.textContent = formatMoney(value, currency);
    });
  }

  /* =========================
     SLIDER (FULL STABLE FIX)
  ========================= */
  function updateSlider(animate = true) {
    if (!slider || !slides.length) return;

    const width = slider.clientWidth || slider.getBoundingClientRect().width;

    // 🔥 retry until layout ready
    if (!width || width < 10) {
      return requestAnimationFrame(() => updateSlider(animate));
    }

    slider.style.transition = animate
      ? "transform .35s cubic-bezier(.22,.61,.36,1)"
      : "none";

    slider.style.transform = `translateX(-${state.index * width}px)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index]?.classList.add("active");
  }

  /* ===== Touch (iOS-feel safe) ===== */
  slider?.addEventListener("touchstart", (e) => {
    if (!slider) return;
    state.dragging = true;
    state.startX = e.touches[0].clientX;
    state.currentX = state.startX;
    slider.style.transition = "none";
  }, { passive: true });

  slider?.addEventListener("touchmove", (e) => {
    if (!state.dragging || !slider) return;

    state.currentX = e.touches[0].clientX;
    const dx = state.currentX - state.startX;

    const width = slider.clientWidth || 1;
    slider.style.transform = `translateX(-${state.index * width + dx}px)`;
  }, { passive: true });

  slider?.addEventListener("touchend", () => {
    if (!state.dragging) return;

    state.dragging = false;

    const dx = state.currentX - state.startX;

    if (dx > 70) state.index--;
    if (dx < -70) state.index++;

    state.index = Math.max(0, Math.min(state.index, slides.length - 1));

    state.startX = 0;
    state.currentX = 0;

    updateSlider(true);
  });

  /* =========================
     TRANSACTIONS
  ========================= */
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

      const sign = tx.amount > 0 ? "+" : "-";

      el.innerHTML = `
        <div>
          <div class="tx-title">${tx.type}</div>
          <small>${tx.date}</small>
        </div>
        <div class="tx-amount ${tx.amount > 0 ? "credit" : "debit"}">
          ${sign}${formatMoney(Math.abs(tx.amount), tx.currency)}
        </div>
      `;

      el.addEventListener("click", () => openReceipt(tx));
      txList.appendChild(el);
    });
  }

  /* =========================
     RECEIPT MODAL
  ========================= */
  function openReceipt(tx) {
    const modal = $("receiptModal");
    const content = $("receiptContent");
    if (!modal || !content) return;

    content.innerHTML = `
      <h3>Transaction Receipt</h3>
      <p><b>Reference:</b> ${tx.id}</p>
      <p><b>Type:</b> ${tx.type}</p>
      <p><b>Amount:</b> ${formatMoney(tx.amount, tx.currency)}</p>
      <p><b>Status:</b> ${tx.status}</p>
      <p><b>Date:</b> ${tx.date}</p>

      <button id="downloadBtn" class="primary-btn">Download</button>
      <button id="closeReceipt" class="secondary-btn">Close</button>
    `;

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("show"));

    $("closeReceipt")?.addEventListener("click", () => {
      modal.classList.remove("show");
      setTimeout(() => (modal.hidden = true), 200);
    });

    $("downloadBtn")?.addEventListener("click", () => {
      const blob = new Blob([JSON.stringify(tx, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${tx.id}.json`;
      a.click();
    });
  }

  /* =========================
     VIEW ALL
  ========================= */
  $("viewAllTx")?.addEventListener("click", () => {
    renderTransactions(state.transactions.length);
  });

  /* =========================
     DRAWER
  ========================= */
  const drawer = $("drawer");
  const backdrop = $("drawerBackdrop");

  $("menuBtn")?.addEventListener("click", () => {
    drawer?.classList.add("open");
    if (backdrop) backdrop.hidden = false;
  });

  function closeDrawer() {
    drawer?.classList.remove("open");
    if (backdrop) backdrop.hidden = true;
  }

  backdrop?.addEventListener("click", closeDrawer);
  $("closeDrawer")?.addEventListener("click", closeDrawer);

  /* =========================
     POPUP SYSTEM
  ========================= */
  function showPopup(html) {
    const popup = $("popup");
    const content = $("popupContent");
    if (!popup || !content) return;

    content.innerHTML = html;

    popup.hidden = false;
    requestAnimationFrame(() => popup.classList.add("show"));

    popup.querySelector("#closePopup")?.addEventListener("click", () => {
      popup.classList.remove("show");
      setTimeout(() => (popup.hidden = true), 200);
    });
  }

  /* =========================
     ACTION BUTTONS
  ========================= */
  $("transferBtn")?.addEventListener("click", () => {
    showPopup(`
      <h3>Transfer Restricted</h3>
      <p class="popup-text">Transfers are disabled under ADM regulation.</p>
      <button id="closePopup" class="primary-btn">Close</button>
    `);
  });

  $("notifBtn")?.addEventListener("click", () => {
    showPopup(`
      <h3>Account Status</h3>
      <p class="popup-text">Restricted under Italian Administrative Authority (ADM)</p>
      <button id="closePopup" class="primary-btn">Close</button>
    `);
  });

  $("scanBtn")?.addEventListener("click", () => {
    alert("📷 Scan activated");
  });

  $("cardsBtn")?.addEventListener("click", () => {
    $("cardsScreen") && ($("cardsScreen").hidden = false);
  });

  $("drawerCardsBtn")?.addEventListener("click", () => {
    $("cardsScreen") && ($("cardsScreen").hidden = false);
    closeDrawer();
  });

  $("closeCards")?.addEventListener("click", () => {
    $("cardsScreen") && ($("cardsScreen").hidden = true);
  });

  /* =========================
     AUTO POPUP
  ========================= */
  setTimeout(() => {
    showPopup(`
      <h3>Account Notice</h3>
      <p class="popup-text">This account remains under administrative restriction.</p>
      <button id="closePopup" class="primary-btn">Close</button>
    `);
  }, 2000);

  /* =========================
     RESIZE FIX
  ========================= */
  window.addEventListener("resize", () => {
    updateSlider(false);
  });

  /* =========================
     INIT (FINAL FIX)
  ========================= */
  function init() {
    renderBalances();
    updateSlider(false);
    renderTransactions(1);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(init);
  });

});
