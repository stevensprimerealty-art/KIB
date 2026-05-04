window.addEventListener("DOMContentLoaded", async () => {

  const $ = (id) => document.getElementById(id);
  const safeHide = (el, state) => el && (el.hidden = state);

  // -------------------------
  // AUTH GUARD
  // -------------------------
  try {
    const supabase =
      typeof getSupabase === "function" ? getSupabase() : null;

    if (!supabase) return window.location.replace("index.html");

    const { data } = await supabase.auth.getSession();
    if (!data?.session) return window.location.replace("index.html");

  } catch {
    return window.location.replace("index.html");
  }

  // -------------------------
  // STATE
  // -------------------------
  window.accountState = {
    status: "RESTRICTED",
    currency: "USD",
    balance: {
      USD: 882000,
      EUR: 0,
      KRW: 0
    }
  };

  let transactions = JSON.parse(localStorage.getItem("kib_tx") || "[]");

  // -------------------------
  // FX CONFIG
  // -------------------------
  const FX_CONFIG = {
    spread: { EUR: 0.018, KRW: 0.025 },
    fee: { EUR: 12, KRW: 3500 }
  };

  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v || 0);
  }

  function applyBankRates(usd, rate, currency) {
    const spread = FX_CONFIG.spread[currency] || 0.02;
    const fee = FX_CONFIG.fee[currency] || 0;
    const buyRate = rate * (1 - spread);

    return {
      converted: usd * buyRate - fee,
      buyRate,
      fee
    };
  }

  // -------------------------
  // FX LOAD (FIXED NO FREEZE)
  // -------------------------
  async function loadFX() {
    try {
      const res = await fetch("https://api.exchangerate.host/latest?base=USD");
      const data = await res.json();

      const usd = window.accountState.balance.USD;

      const eur = applyBankRates(usd, data.rates.EUR, "EUR");
      const krw = applyBankRates(usd, data.rates.KRW, "KRW");

      window.fxMeta = { EUR: eur, KRW: krw };

    } catch {
      window.fxMeta = {
        EUR: applyBankRates(882000, 0.85, "EUR"),
        KRW: applyBankRates(882000, 1470, "KRW")
      };
    }

    updateBalances(window.accountState.balance);
  }

  // -------------------------
  // BALANCE
  // -------------------------
  function updateBalances(balances) {
    document.querySelectorAll(".slide").forEach(slide => {
      const c = slide.dataset.currency;
      const val = balances[c];
      if (val == null) return;

      slide.querySelectorAll("[data-real]").forEach(el => {
        el.dataset.real = formatMoney(val, c);
      });
    });

    renderBalances();
  }

  let visible = localStorage.getItem("kib_balance_visible") === "true";

  function renderBalances() {
    document.querySelectorAll("[data-real]").forEach(el => {
      const real = el.dataset.real || "";
      el.textContent = visible ? real : "••••••••";
    });

    if ($("toggleBalance"))
      $("toggleBalance").textContent = visible ? "🙈" : "👁️";
  }

  $("toggleBalance")?.addEventListener("click", () => {
    visible = !visible;
    localStorage.setItem("kib_balance_visible", visible);
    renderBalances();
  });

  // -------------------------
  // SLIDER (REAL SWIPE)
  // -------------------------
  const slider = $("accountSlider");
  const slides = slider?.querySelectorAll(".slide") || [];
  let index = 1;

  function updateSlider() {
    slider.style.transform = `translateX(-${index * 100}%)`;

    const currency = slides[index]?.dataset.currency;
    window.accountState.currency = currency;

    $("transferCurrency") && ($("transferCurrency").value = currency);
    $("transferLabel") && ($("transferLabel").textContent = `Amount (${currency})`);
  }

  let startX = 0;

  slider?.addEventListener("touchstart", e => {
    startX = e.touches[0].clientX;
  });

  slider?.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - startX;

    if (dx > 50) index--;
    if (dx < -50) index++;

    index = Math.max(0, Math.min(index, slides.length - 1));

    updateSlider();
  });

  updateSlider();

  // -------------------------
  // NOTIFICATIONS
  // -------------------------
  $("notifBtn")?.addEventListener("click", () => {
    const panel = $("notifPanel");
    panel.hidden = !panel.hidden;
  });

  // -------------------------
  // RECENT TRANSACTIONS (FIXED)
  // -------------------------
  function renderTransactions() {
    const list = $("txList");
    if (!list) return;

    list.innerHTML = "";

    if (!transactions.length) {
      list.innerHTML = `<div style="padding:12px;color:#888">No transactions yet</div>`;
      return;
    }

    transactions.slice(0, 5).forEach(tx => {
      const el = document.createElement("div");
      el.className = "tx-item";

      el.innerHTML = `
        <div class="tx-left">
          <div class="tx-title">Outgoing Transfer</div>
          <div class="tx-sub">${tx.currency}</div>
          <div class="tx-meta">${tx.date}</div>
        </div>
        <div class="tx-right">
          <div class="tx-amount debit">-${formatMoney(tx.amount, "USD")}</div>
          <div class="tx-status">Completed</div>
        </div>
      `;

      list.appendChild(el);
    });
  }

  $("recentBtn")?.addEventListener("click", () => {
    const panel = $("recentPanel");

    const open = panel.classList.toggle("is-open");

    if (open) {
      panel.hidden = false;
      renderTransactions();
    } else {
      setTimeout(() => (panel.hidden = true), 300);
    }
  });

  // -------------------------
  // DRAWER
  // -------------------------
  const drawer = $("drawer");
  const backdrop = $("menuBackdrop");

  $("menuBtn")?.addEventListener("click", () => {
    drawer.classList.add("is-open");
    backdrop.hidden = false;
  });

  const closeDrawer = () => {
    drawer.classList.remove("is-open");
    backdrop.hidden = true;
  };

  $("closeDrawer")?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);

  // -------------------------
  // TRANSFER
  // -------------------------
  $("transferBtn")?.addEventListener("click", () => {

    if (window.accountState.status === "RESTRICTED") {
      safeHide($("compliancePopup"), false);
      return;
    }

    $("protocolPanel").hidden = false;
  });

  $("closeProtocol")?.addEventListener("click", () => {
    safeHide($("protocolPanel"), true);
  });

  const input = $("transferAmount");
  const confirmBtn = $("confirmTransferBtn");

  input?.addEventListener("input", () => {
    const val = parseFloat(input.value);

    if (!val || val <= 0) {
      confirmBtn.disabled = true;
      return;
    }

    confirmBtn.disabled = false;
  });

  confirmBtn?.addEventListener("click", () => {

    const amount = parseFloat(input.value);
    if (!amount) return;

    const tx = {
      id: Date.now(),
      amount,
      currency: window.accountState.currency,
      date: new Date().toLocaleString()
    };

    transactions.unshift(tx);
    localStorage.setItem("kib_tx", JSON.stringify(transactions));

    window.accountState.balance.USD -= amount;
    updateBalances(window.accountState.balance);

    renderTransactions();

    safeHide($("receiptPopup"), false);
  });

  // -------------------------
  // POPUPS
  // -------------------------
  $("closeReceipt")?.addEventListener("click", () => {
    safeHide($("receiptPopup"), true);
  });

  $("closePopup")?.addEventListener("click", () => {
    safeHide($("compliancePopup"), true);
  });

  // -------------------------
  // INIT
  // -------------------------
  await loadFX();
  renderTransactions();

});
