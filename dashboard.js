window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  /* =========================
     STATE
  ========================= */
  const state = {
    index: 1,
    startX: 0,
    currentX: 0,
    isDragging: false,
    transactions: JSON.parse(localStorage.getItem("kib_tx") || "[]")
  };

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const txList = $("txList");
  const popup = $("popup");

  /* =========================
     SLIDER (iOS PHYSICS)
  ========================= */

  function setTranslate(x, animate = false) {
    slider.style.transition = animate
      ? "transform 0.35s cubic-bezier(.22,.61,.36,1)"
      : "none";

    slider.style.transform = `translateX(${x}px)`;
  }

  function updateSlider(animate = true) {
    const width = slider.offsetWidth;
    setTranslate(-state.index * width, animate);

    dots.forEach(d => d.classList.remove("active"));
    if (dots[state.index]) dots[state.index].classList.add("active");
  }

  slider.addEventListener("touchstart", (e) => {
    state.isDragging = true;
    state.startX = e.touches[0].clientX;
    state.currentX = state.startX;
    slider.style.transition = "none";
  });

  slider.addEventListener("touchmove", (e) => {
    if (!state.isDragging) return;

    state.currentX = e.touches[0].clientX;
    let dx = state.currentX - state.startX;

    const width = slider.offsetWidth;
    let offset = -state.index * width + dx;

    // edge resistance
    if (state.index === 0 && dx > 0) offset *= 0.4;
    if (state.index === slides.length - 1 && dx < 0) offset *= 0.4;

    setTranslate(offset);
  });

  slider.addEventListener("touchend", () => {
    state.isDragging = false;

    const dx = state.currentX - state.startX;

    if (dx > 80) state.index--;
    if (dx < -80) state.index++;

    state.index = Math.max(0, Math.min(state.index, slides.length - 1));

    updateSlider(true);
  });

  updateSlider();

  /* =========================
     TRANSACTIONS
  ========================= */

  // fallback default if empty
  if (!state.transactions.length) {
    state.transactions.push({
      id: Date.now(),
      type: "Incoming SWIFT",
      amount: 882000,
      date: "04 May 2026"
    });
    localStorage.setItem("kib_tx", JSON.stringify(state.transactions));
  }

  function formatMoney(amount) {
    return (amount > 0 ? "+" : "-") + "$" + Math.abs(amount).toLocaleString();
  }

  function renderTransactions() {
    txList.innerHTML = "";

    if (!state.transactions.length) {
      txList.innerHTML = `<div class="empty">No transactions yet</div>`;
      return;
    }

    state.transactions.slice(0, 5).forEach(tx => {
      const el = document.createElement("div");
      el.className = "tx";

      el.innerHTML = `
        <div>
          <div class="tx-title">${tx.type}</div>
          <small>${tx.date}</small>
        </div>
        <div class="tx-amount ${tx.amount > 0 ? "credit" : "debit"}">
          ${formatMoney(tx.amount)}
        </div>
      `;

      txList.appendChild(el);
    });
  }

  renderTransactions();

  /* =========================
     TRANSFER
  ========================= */

  $("transferBtn")?.addEventListener("click", () => {

    const amount = parseFloat(prompt("Enter transfer amount"));
    if (!amount || amount <= 0) return;

    const tx = {
      id: Date.now(),
      type: "Transfer",
      amount: -amount,
      date: new Date().toLocaleString()
    };

    state.transactions.unshift(tx);
    localStorage.setItem("kib_tx", JSON.stringify(state.transactions));

    renderTransactions();
    generateReceipt(tx);
  });

  /* =========================
     RECEIPT (DOWNLOAD)
  ========================= */

  function generateReceipt(tx) {

    const content = `
KIB BANK RECEIPT
------------------------
Transaction ID: ${tx.id}
Type: ${tx.type}
Amount: ${formatMoney(tx.amount)}
Date: ${tx.date}
Status: Completed
------------------------
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${tx.id}.txt`;
    a.click();
  }

  /* =========================
     NOTIFICATION POPUP
  ========================= */

  $("notifBtn")?.addEventListener("click", () => {
    popup.hidden = false;
    popup.classList.add("show");
  });

  $("closePopup")?.addEventListener("click", () => {
    popup.classList.remove("show");
    setTimeout(() => popup.hidden = true, 200);
  });

  popup?.addEventListener("click", (e) => {
    if (e.target === popup) {
      popup.classList.remove("show");
      setTimeout(() => popup.hidden = true, 200);
    }
  });

  /* =========================
     SCAN BUTTON
  ========================= */

  $("scanBtn")?.addEventListener("click", () => {
    alert("📷 Scan system ready (QR / URL)");
  });

});
