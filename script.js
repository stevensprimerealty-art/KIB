window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  const state = {
    index: 0,
    masked: false,

    balance: { USD: 0, EUR: 0, KRW: 0 },
    transactions: [],
    filteredCurrency: null,

    compliance: {
      restricted: true,
      reason: "Administrative Hold (ADM)"
    },

    fxRates: { EURUSD: 1.08, KRWUSD: 1300 },
    notifications: []
  };

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const txList = $("txList");

  /* ================= FORMAT ================= */

  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v ?? 0);
  }

  function mask(v) {
    return state.masked ? "••••••" : v;
  }

  /* ================= BALANCES ================= */

  function renderBalances() {
    slides.forEach((slide, i) => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      if (!el) return;

      el.textContent = mask(formatMoney(state.balance[currency], currency));

      slide.onclick = () => {
        state.index = i;

        state.filteredCurrency =
          state.filteredCurrency === currency ? null : currency;

        updateSlider();
        renderTransactions(5);
      };
    });

    updateFX();
  }

  /* ================= FX ================= */

  function updateFX() {
    const fxEl = $("fxValue");
    if (!fxEl) return;

    const current = slides[state.index]?.dataset.currency;

    let valueUSD = state.balance.USD;

    if (current === "EUR") valueUSD = state.balance.EUR * state.fxRates.EURUSD;
    if (current === "KRW") valueUSD = state.balance.KRW / state.fxRates.KRWUSD;

    fxEl.textContent = mask(formatMoney(valueUSD, "USD"));
  }

  /* ================= TRANSACTIONS ================= */

  function renderTransactions(limit = 1) {
    txList.innerHTML = "";

    let data = state.transactions;

    if (state.filteredCurrency) {
      data = data.filter(tx => tx.currency === state.filteredCurrency);
    }

    data = data.slice(0, limit);

    if (!data.length) {
      txList.innerHTML = `<div class="tx">No transactions</div>`;
      return;
    }

    data.forEach(tx => {
      const el = document.createElement("div");
      el.className = "tx";

      el.innerHTML = `
        <div>
          <div>${tx.type}</div>
          <small>${new Date(tx.created_at).toLocaleString()}</small>
        </div>
        <div class="tx-amount ${tx.amount > 0 ? "credit" : "debit"}">
          ${tx.amount > 0 ? "+" : "-"}${formatMoney(Math.abs(tx.amount), tx.currency)}
        </div>
      `;

      el.onclick = () => showReceipt(tx);

      txList.appendChild(el);
    });
  }

  /* ================= RECEIPT ================= */

  function showReceipt(tx) {
    openPopup(`
      <h3>SWIFT Receipt</h3>
      <p><b>Ref:</b> ${tx.id}</p>
      <p><b>Type:</b> ${tx.type}</p>
      <p><b>Amount:</b> ${formatMoney(tx.amount, tx.currency)}</p>
      <p><b>Status:</b> ${tx.status || "Completed"}</p>
    `);
  }

  /* ================= NOTIFICATIONS ================= */

  window.openNotifications = function () {
    if (!state.notifications.length) {
      openPopup("No notifications");
      return;
    }

    openPopup(
      "<h3>Notifications</h3>" +
      state.notifications.map(n => `<p>${n.message}</p>`).join("")
    );
  };

  /* ================= TRANSFER ================= */

  window.openTransfer = function () {
    if (state.compliance.restricted) {
      openPopup(state.compliance.reason);
      return;
    }
    openPopup("Transfer allowed");
  };

  /* ================= SLIDER ================= */

  function getWidth() {
    return slider?.parentElement?.offsetWidth || 0;
  }

  function updateSlider(retry = 0) {
    const width = getWidth();

    if (!width) {
      if (retry < 5) setTimeout(() => updateSlider(retry + 1), 80);
      return;
    }

    slider.style.transition = "transform .35s ease";
    slider.style.transform = `translateX(-${state.index * width}px)`;

    dots.forEach(d => d.classList.remove("active"));
    dots[state.index]?.classList.add("active");

    updateFX();
  }

  /* ================= MASK ================= */

  window.toggleFallback = function () {
    state.masked = !state.masked;
    renderBalances();
  };

  /* ================= POPUP ================= */

  window.openPopup = function (html) {
    $("popupText").innerHTML = html || "No data";
    $("popup").hidden = false;
  };

  window.closePopup = function () {
    $("popup").hidden = true;
  };

  /* ================= INIT (🔥 FINAL FIX) ================= */

  function init() {

    // ✅ BALANCES
    state.balance = {
      USD: 882000,
      EUR: 749700,
      KRW: 1299186000
    };

    // ✅ TRANSACTIONS
    state.transactions = [
      {
        id: "KIB-882000",
        type: "Incoming SWIFT",
        amount: 882000,
        currency: "USD",
        created_at: new Date().toISOString(),
        status: "Completed"
      },
      {
        id: "KIB-002",
        type: "Card Payment",
        amount: -250,
        currency: "EUR",
        created_at: new Date(Date.now() - 86400000).toISOString()
      }
    ];

    // ✅ NOTIFICATIONS
    state.notifications = [
      { message: "Deposit of $882,000 received" },
      { message: "Account under ADM compliance review" }
    ];

    renderBalances();
    renderTransactions(1);

    requestAnimationFrame(() => updateSlider());
  }

  init();

});
