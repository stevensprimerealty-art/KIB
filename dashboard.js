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
        type: "Incoming SWIFT",
        amount: 882000,
        currency: "USD",
        date: "04 May 2026 • 11:05 AM",
        status: "Restricted"
      }
    ]
  };

  /* =========================
     SLIDER (REAL iOS FEEL)
  ========================= */

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  function setTranslate(x, animate = false) {
    slider.style.transition = animate ? "transform 0.35s cubic-bezier(.22,.61,.36,1)" : "none";
    slider.style.transform = `translateX(${x}px)`;
  }

  function updateSlider(animate = true) {
    const width = slider.offsetWidth;
    setTranslate(-state.index * width, animate);

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index].classList.add("active");

    updateBalanceDisplay();
  }

  slider.addEventListener("touchstart", (e) => {
    state.dragging = true;
    state.startX = e.touches[0].clientX;
  });

  slider.addEventListener("touchmove", (e) => {
    if (!state.dragging) return;

    state.currentX = e.touches[0].clientX;
    let dx = state.currentX - state.startX;

    const width = slider.offsetWidth;
    setTranslate(-state.index * width + dx);
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

  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v);
  }

  function updateBalanceDisplay() {
    const currencies = ["EUR", "USD", "KRW"];
    const current = currencies[state.index];

    const amountEl = slides[state.index].querySelector(".amount");

    if (!state.balanceVisible) {
      amountEl.textContent = "••••••••";
    } else {
      amountEl.textContent = formatMoney(state.balance[current], current);
    }
  }

  /* =========================
     TRANSACTIONS
  ========================= */

  const txList = $("txList");

  function renderTransactions() {
    txList.innerHTML = "";

    state.transactions.forEach(tx => {
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

      el.onclick = () => openReceipt(tx);
      txList.appendChild(el);
    });
  }

  /* =========================
     RECEIPT SYSTEM (REAL)
  ========================= */

  function openReceipt(tx) {
    const popup = $("popup");

    popup.innerHTML = `
      <div class="popup-box">
        <h3>Transaction Receipt</h3>

        <p><b>Reference:</b> ${tx.id}</p>
        <p><b>Type:</b> ${tx.type}</p>
        <p><b>Amount:</b> ${formatMoney(tx.amount, tx.currency)}</p>
        <p><b>Status:</b> ${tx.status}</p>
        <p><b>Date:</b> ${tx.date}</p>

        <button class="primary-btn" id="downloadBtn">Download</button>
        <button class="secondary-btn" id="closePopup">Close</button>
      </div>
    `;

    popup.hidden = false;
    setTimeout(() => popup.classList.add("show"), 10);

    $("closePopup").onclick = closePopup;

    $("downloadBtn").onclick = () => {
      const blob = new Blob([JSON.stringify(tx, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${tx.id}.json`;
      a.click();
    };
  }

  function closePopup() {
    const popup = $("popup");
    popup.classList.remove("show");
    setTimeout(() => popup.hidden = true, 200);
  }

  /* =========================
     VIEW ALL BUTTON
  ========================= */

  document.querySelector(".tx-header button")?.addEventListener("click", () => {
    renderTransactions(); // ensures full list
    alert("Showing all transactions");
  });

  /* =========================
     DRAWER
  ========================= */

  $("menuBtn")?.addEventListener("click", () => {
    $("drawer")?.classList.add("open");
    $("drawerBackdrop")?.removeAttribute("hidden");
  });

  $("drawerBackdrop")?.addEventListener("click", () => {
    $("drawer")?.classList.remove("open");
    $("drawerBackdrop")?.setAttribute("hidden", true);
  });

  /* =========================
     TRANSFER (RESTRICTED)
  ========================= */

  $("transferBtn")?.addEventListener("click", () => {
    showRestriction();
  });

  function showRestriction() {
    const popup = $("popup");

    popup.innerHTML = `
      <div class="popup-box">
        <h3>Transfer Restricted</h3>
        <p class="popup-text">
          Transfers are disabled under Italian Administrative Authority (ADM).
        </p>

        <button class="primary-btn">Contact Bank</button>
        <button class="secondary-btn" id="closePopup">Close</button>
      </div>
    `;

    popup.hidden = false;
    setTimeout(() => popup.classList.add("show"), 10);

    $("closePopup").onclick = closePopup;
  }

  /* =========================
     NOTIFICATION (BELL)
  ========================= */

  $("notifBtn")?.addEventListener("click", showRestriction);

  /* =========================
     SCAN
  ========================= */

  $("scanBtn")?.addEventListener("click", () => {
    alert("📷 Scan system activated");
  });

  /* =========================
     CARDS BUTTON
  ========================= */

  document.querySelectorAll(".actions button")[2]?.addEventListener("click", () => {
    alert("Digital cards coming soon");
  });

  /* =========================
     INIT
  ========================= */

  updateSlider();
  renderTransactions();
});
