window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  /* =========================
     STATE
  ========================= */
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

  /* =========================
     HELPERS
  ========================= */
  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v);
  }

  /* =========================
     SLIDER (FIXED PROPERLY)
  ========================= */

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  function renderBalances() {
    slides.forEach(slide => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      if (currency && el) {
        el.textContent = formatMoney(state.balance[currency], currency);
      }
    });
  }

  function updateSlider(animate = true) {
    const width = slider.offsetWidth;

    slider.style.transition = animate ? "transform .35s cubic-bezier(.22,.61,.36,1)" : "none";
    slider.style.transform = `translateX(-${state.index * width}px)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index]?.classList.add("active");
  }

  slider.addEventListener("touchstart", (e) => {
    state.dragging = true;
    state.startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchmove", (e) => {
    if (!state.dragging) return;

    state.currentX = e.touches[0].clientX;
    const dx = state.currentX - state.startX;

    const width = slider.offsetWidth;
    slider.style.transform = `translateX(-${state.index * width + dx}px)`;
  });

  slider.addEventListener("touchend", () => {
    state.dragging = false;

    const dx = state.currentX - state.startX;

    if (dx > 70) state.index--;
    if (dx < -70) state.index++;

    state.index = Math.max(0, Math.min(state.index, slides.length - 1));

    updateSlider(true);
  });

  /* =========================
     TRANSACTIONS (FIXED)
  ========================= */

  const txList = $("txList");

  function renderTransactions(limit = 1) {
    txList.innerHTML = "";

    const data = state.transactions.slice(0, limit);

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

      el.onclick = () => openReceipt(tx);
      txList.appendChild(el);
    });
  }

  /* =========================
     RECEIPT (REAL MODAL)
  ========================= */

  function openReceipt(tx) {
    const modal = $("receiptModal");
    const content = $("receiptContent");

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
    setTimeout(() => modal.classList.add("show"), 10);

    $("closeReceipt").onclick = closeReceipt;

    $("downloadBtn").onclick = () => {
      const blob = new Blob([JSON.stringify(tx, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${tx.id}.json`;
      a.click();
    };
  }

  function closeReceipt() {
    const modal = $("receiptModal");
    modal.classList.remove("show");
    setTimeout(() => modal.hidden = true, 200);
  }

  /* =========================
     VIEW ALL (FIXED)
  ========================= */

  $("viewAllTx").onclick = () => {
    renderTransactions(state.transactions.length);
  };

  /* =========================
     DRAWER (FULL FIX)
  ========================= */

  $("menuBtn").onclick = () => {
    $("drawer").classList.add("open");
    $("drawerBackdrop").hidden = false;
  };

  function closeDrawer() {
    $("drawer").classList.remove("open");
    $("drawerBackdrop").hidden = true;
  }

  $("drawerBackdrop").onclick = closeDrawer;
  $("closeDrawer").onclick = closeDrawer;

  /* =========================
     POPUP SYSTEM
  ========================= */

  function showPopup(html) {
    const popup = $("popup");
    $("popupContent").innerHTML = html;

    popup.hidden = false;
    setTimeout(() => popup.classList.add("show"), 10);

    popup.querySelector("#closePopup")?.addEventListener("click", () => {
      popup.classList.remove("show");
      setTimeout(() => popup.hidden = true, 200);
    });
  }

  /* =========================
     BUTTON ACTIONS
  ========================= */

  $("transferBtn").onclick = () => {
    showPopup(`
      <h3>Transfer Restricted</h3>
      <p class="popup-text">
        Transfers are disabled under Italian Administrative Authority (ADM).
      </p>
      <button id="closePopup" class="primary-btn">Close</button>
    `);
  };

  $("notifBtn").onclick = () => {
    showPopup(`
      <h3>Account Status</h3>
      <p class="popup-text">
        Restricted under Italian Administrative Authority (ADM)
      </p>
      <button id="closePopup" class="primary-btn">Close</button>
    `);
  };

  $("scanBtn").onclick = () => {
    alert("📷 Scan activated");
  };

  /* =========================
     CARDS SCREEN (FIXED)
  ========================= */

  $("cardsBtn").onclick = () => {
    $("cardsScreen").hidden = false;
  };

  $("drawerCardsBtn").onclick = () => {
    $("cardsScreen").hidden = false;
    closeDrawer();
  };

  $("closeCards").onclick = () => {
    $("cardsScreen").hidden = true;
  };

  /* =========================
     AUTO POPUP (2s)
  ========================= */

  setTimeout(() => {
    showPopup(`
      <h3>Account Notice</h3>
      <p class="popup-text">
        This account remains under administrative restriction.
      </p>
      <button id="closePopup" class="primary-btn">Close</button>
    `);
  }, 2000);

  /* =========================
     INIT
  ========================= */

  renderBalances();        // 🔥 FIXED (your main issue)
  updateSlider(false);
  renderTransactions(1);

});
