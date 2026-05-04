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
    balanceVisible: true,
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

  function showPopup(html) {
    const popup = $("popup");
    popup.innerHTML = html;
    popup.hidden = false;

    setTimeout(() => popup.classList.add("show"), 10);

    const closeBtn = popup.querySelector("#closePopup");
    if (closeBtn) {
      closeBtn.onclick = closePopup;
    }
  }

  function closePopup() {
    const popup = $("popup");
    popup.classList.remove("show");
    setTimeout(() => popup.hidden = true, 200);
  }

  /* =========================
     SLIDER (FIXED)
  ========================= */

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  function updateSlider(animate = true) {
    const width = slider.offsetWidth;
    slider.style.transition = animate ? "transform .35s ease" : "none";
    slider.style.transform = `translateX(-${state.index * width}px)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index]?.classList.add("active");

    updateBalanceDisplay();
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

    if (dx > 80) state.index--;
    if (dx < -80) state.index++;

    state.index = Math.max(0, Math.min(state.index, slides.length - 1));

    updateSlider(true);
  });

  /* =========================
     BALANCE DISPLAY
  ========================= */

  function updateBalanceDisplay() {
    const currencies = ["EUR", "USD", "KRW"];
    const current = currencies[state.index];

    const amountEl = slides[state.index]?.querySelector(".amount");

    if (!amountEl) return;

    amountEl.textContent = state.balanceVisible
      ? formatMoney(state.balance[current], current)
      : "••••••••";
  }

  /* =========================
     TRANSACTIONS
  ========================= */

  const txList = $("txList");

  function renderTransactions() {
    if (!txList) return;

    txList.innerHTML = "";

    state.transactions.forEach(tx => {
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
     RECEIPT
  ========================= */

  function openReceipt(tx) {
    showPopup(`
      <div class="popup-box">
        <h3>Transaction Receipt</h3>

        <p><b>Reference:</b> ${tx.id}</p>
        <p><b>Type:</b> ${tx.type}</p>
        <p><b>Amount:</b> ${formatMoney(tx.amount, tx.currency)}</p>
        <p><b>Status:</b> ${tx.status}</p>
        <p><b>Date:</b> ${tx.date}</p>

        <button id="downloadBtn">Download</button>
        <button id="closePopup">Close</button>
      </div>
    `);

    $("downloadBtn").onclick = () => {
      const blob = new Blob([JSON.stringify(tx, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${tx.id}.json`;
      a.click();
    };
  }

  /* =========================
     VIEW ALL
  ========================= */

  $("viewAllTx")?.addEventListener("click", renderTransactions);

  /* =========================
     DRAWER (FIXED)
  ========================= */

  $("menuBtn")?.addEventListener("click", () => {
    $("drawer")?.classList.add("open");
    $("drawerBackdrop")?.hidden = false;
  });

  $("drawerBackdrop")?.addEventListener("click", closeDrawer);
  $("closeDrawer")?.addEventListener("click", closeDrawer);

  function closeDrawer() {
    $("drawer")?.classList.remove("open");
    $("drawerBackdrop")?.hidden = true;
  }

  /* =========================
     TRANSFER (RESTRICTED)
  ========================= */

  function showRestriction() {
    showPopup(`
      <div class="popup-box">
        <h3>Transfer Restricted</h3>
        <p>Transfers are disabled under ADM regulation.</p>
        <button id="closePopup">Close</button>
      </div>
    `);
  }

  $("transferBtn")?.addEventListener("click", showRestriction);

  /* =========================
     BELL
  ========================= */

  $("notifBtn")?.addEventListener("click", () => {
    showPopup(`
      <div class="popup-box">
        <h3>Account Status</h3>
        <p>Restricted under Italian Administrative Authority (ADM)</p>
        <button id="closePopup">Close</button>
      </div>
    `);
  });

  /* =========================
     ACTION BUTTONS
  ========================= */

  $("scanBtn")?.addEventListener("click", () => {
    alert("📷 Scan activated");
  });

  $("cardsBtn")?.addEventListener("click", () => {
    showPopup(`
      <div class="popup-box">
        <h3>Cards</h3>
        <p>Digital cards will appear here.</p>
        <button id="closePopup">Close</button>
      </div>
    `);
  });

  $("cashoutBtn")?.addEventListener("click", () => {
    showPopup(`
      <div class="popup-box">
        <h3>Cash-Out</h3>
        <p>This feature is currently unavailable.</p>
        <button id="closePopup">Close</button>
      </div>
    `);
  });

  /* =========================
     AUTO POPUP (2s)
  ========================= */

  setTimeout(() => {
    showPopup(`
      <div class="popup-box">
        <h3>Account Notice</h3>
        <p>This account remains under administrative restriction.</p>
        <button id="closePopup">Close</button>
      </div>
    `);
  }, 2000);

  /* =========================
     INIT
  ========================= */

  updateSlider();
  renderTransactions();

});
