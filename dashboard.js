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
    }).format(v ?? 0);
  }

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  /* =========================
     BALANCE RENDER + TOGGLE
  ========================= */
  function renderBalances() {
    slides.forEach(slide => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      if (!currency || !el) return;

      el.textContent = state.balanceVisible
        ? formatMoney(state.balance[currency], currency)
        : "••••••••";
    });
  }

  /* =========================
     SLIDER (STABLE)
  ========================= */
  function updateSlider(animate = true) {
    if (!slider) return;

    const width = slider.getBoundingClientRect().width;

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

    updateSlider(true);
  });

  /* =========================
     TRANSACTIONS (FIXED)
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
     VIEW ALL (FIXED)
  ========================= */
  const viewAllBtn = $("viewAllTx");

  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", () => {
      renderTransactions(state.transactions.length);
    });
  }

  /* =========================
     RECEIPT
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

      <button id="closeReceipt" class="primary-btn">Close</button>
    `;

    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("show"));

    $("closeReceipt").onclick = () => {
      modal.classList.remove("show");
      setTimeout(() => modal.hidden = true, 200);
    };
  }

  /* =========================
     DRAWER (FIXED)
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
     AVATAR UPLOAD (PERSISTENT)
  ========================= */
  const avatar = $("avatar");

  function loadAvatar() {
    const saved = localStorage.getItem("kib_avatar");
    if (saved && avatar) {
      avatar.style.backgroundImage = `url(${saved})`;
      avatar.style.backgroundSize = "cover";
    }
  }

  avatar?.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = () => {
      const file = input.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        localStorage.setItem("kib_avatar", reader.result);
        loadAvatar();
      };
      reader.readAsDataURL(file);
    };

    input.click();
  });

  /* =========================
     INIT (FINAL)
  ========================= */
  function init() {
    loadAvatar();
    renderBalances();
    renderTransactions(1);
    updateSlider(false);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(init);
  });

  window.addEventListener("resize", () => updateSlider(false));

});
