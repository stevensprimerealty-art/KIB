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

    requestAnimationFrame(() => {
      popup.classList.add("show");
    });

    popup.querySelectorAll("#closePopup").forEach(btn => {
      btn.onclick = closePopup;
    });
  }

  function closePopup() {
    const popup = $("popup");
    popup.classList.remove("show");

    setTimeout(() => {
      popup.hidden = true;
      popup.innerHTML = "";
    }, 200);
  }

  /* =========================
     SLIDER (REAL iOS PHYSICS)
  ========================= */

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  function setTranslate(x, animate = false) {
    slider.style.transition = animate
      ? "transform .35s cubic-bezier(.22,.61,.36,1)"
      : "none";

    slider.style.transform = `translateX(${x}px)`;
  }

  function updateSlider(animate = true) {
    const width = slider.offsetWidth;

    setTranslate(-state.index * width, animate);

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index]?.classList.add("active");

    updateAllBalances();
  }

  slider.addEventListener("touchstart", (e) => {
    state.dragging = true;
    state.startX = e.touches[0].clientX;
    slider.style.transition = "none";
  });

  slider.addEventListener("touchmove", (e) => {
    if (!state.dragging) return;

    state.currentX = e.touches[0].clientX;
    let dx = state.currentX - state.startX;

    const width = slider.offsetWidth;
    let offset = -state.index * width + dx;

    // resistance edges
    if (state.index === 0 && dx > 0) offset *= 0.4;
    if (state.index === slides.length - 1 && dx < 0) offset *= 0.4;

    setTranslate(offset);
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
     BALANCE (FIXED ALL SLIDES)
  ========================= */

  function updateAllBalances() {
    document.querySelectorAll(".slide").forEach(slide => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      if (!el) return;

      el.textContent = state.balanceVisible
        ? formatMoney(state.balance[currency], currency)
        : "••••••••";
    });
  }

  /* =========================
     TRANSACTIONS (FIXED)
  ========================= */

  const txList = $("txList");

  function renderTransactions() {
    if (!txList) return;

    txList.innerHTML = "";

    if (!state.transactions.length) {
      txList.innerHTML = `<div class="empty">No transactions</div>`;
      return;
    }

    state.transactions.slice(0, 5).forEach(tx => {
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
     RECEIPT (PROPER MODAL)
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

    $("closeReceipt").onclick = () => modal.hidden = true;

    $("downloadBtn").onclick = () => {
      const blob = new Blob([JSON.stringify(tx, null, 2)], {
        type: "application/json"
      });

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

  $("viewAllTx")?.addEventListener("click", () => {
    txList.innerHTML = "";
    state.transactions.forEach(tx => {
      const el = document.createElement("div");
      el.className = "tx";
      el.innerHTML = `${tx.type} - ${formatMoney(tx.amount, tx.currency)}`;
      txList.appendChild(el);
    });
  });

  /* =========================
     DRAWER (FIXED UI)
  ========================= */

  function openDrawer() {
    $("drawer").classList.add("open");
    $("drawerBackdrop").hidden = false;
  }

  function closeDrawer() {
    $("drawer").classList.remove("open");
    $("drawerBackdrop").hidden = true;
  }

  $("menuBtn")?.addEventListener("click", openDrawer);
  $("drawerBackdrop")?.addEventListener("click", closeDrawer);
  $("closeDrawer")?.addEventListener("click", closeDrawer);

  /* =========================
     CARDS SCREEN (REAL)
  ========================= */

  $("cardsBtn")?.addEventListener("click", () => {
    $("cardsScreen").hidden = false;
  });

  $("closeCards")?.addEventListener("click", () => {
    $("cardsScreen").hidden = true;
  });

  /* =========================
     TRANSFER (STRICT BLOCK)
  ========================= */

  $("transferBtn")?.addEventListener("click", () => {
    showPopup(`
      <div class="popup-box">
        <h3>Transfer Restricted</h3>
        <p>This account is under ADM restriction.</p>
        <button id="closePopup">Close</button>
      </div>
    `);
  });

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
     SCAN
  ========================= */

  $("scanBtn")?.addEventListener("click", () => {
    showPopup(`
      <div class="popup-box">
        <h3>Scan System</h3>
        <p>QR / URL scanning activated.</p>
        <button id="closePopup">Close</button>
      </div>
    `);
  });

  /* =========================
     AUTO NOTICE (REAL BANK FEEL)
  ========================= */

  setTimeout(() => {
    showPopup(`
      <div class="popup-box">
        <h3>Administrative Notice</h3>
        <p>This account remains restricted under ADM supervision.</p>
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
