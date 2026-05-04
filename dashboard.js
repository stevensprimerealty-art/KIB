window.addEventListener("DOMContentLoaded", async () => {

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

  const $ = (id) => document.getElementById(id);
  const safeHide = (el, state) => el && (el.hidden = state);

  // -------------------------
  // SYSTEM STATE
  // -------------------------
  window.accountState = window.accountState || {
    status: "RESTRICTED",
    currency: "USD",
    balance: {
      USD: 882000,
      EUR: 0,
      KRW: 0
    }
  };

  // -------------------------
  // FX CONFIG
  // -------------------------
  const FX_CONFIG = {
    spread: { EUR: 0.018, KRW: 0.025 },
    fee: { EUR: 12, KRW: 3500 }
  };

  // -------------------------
  // HELPERS
  // -------------------------
  function formatMoney(value, currency) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency
    }).format(value || 0);
  }

  // -------------------------
  // FX ENGINE
  // -------------------------
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

  function updateBalances(balances) {
    document.querySelectorAll(".slide").forEach(slide => {
      const c = slide.dataset.currency;
      const val = balances[c];
      if (val == null) return;

      const formatted = formatMoney(val, c);

      slide.querySelectorAll("[data-real]").forEach(el => {
        el.dataset.real = formatted;
      });
    });

    renderBalances();
  }

  async function loadFX() {
    try {
      const res = await fetch("https://api.exchangerate.host/latest?base=USD");
      const data = await res.json();

      const usd = window.accountState.balance.USD;

      const eur = applyBankRates(usd, data.rates.EUR, "EUR");
      const krw = applyBankRates(usd, data.rates.KRW, "KRW");

      window.fxMeta = { EUR: eur, KRW: krw };

      updateBalances({
        USD: usd,
        EUR: eur.converted,
        KRW: krw.converted
      });

    } catch {
      const usd = window.accountState.balance.USD;

      const eur = applyBankRates(usd, 0.85, "EUR");
      const krw = applyBankRates(usd, 1470, "KRW");

      window.fxMeta = { EUR: eur, KRW: krw };

      updateBalances({
        USD: usd,
        EUR: eur.converted,
        KRW: krw.converted
      });
    }
  }

  // -------------------------
  // BALANCE VISIBILITY
  // -------------------------
  const eyeBtn = $("toggleBalance");
  let visible = localStorage.getItem("kib_balance_visible") === "true";

  function maskMoney(text) {
    const symbol = text?.match(/^[^\d]+/)?.[0] || "";
    return symbol + "••••••••";
  }

  function renderBalances() {
    document.querySelectorAll("[data-real]").forEach(el => {
      const real = el.dataset.real || "";
      el.textContent = visible ? real : maskMoney(real);
    });

    if (eyeBtn) eyeBtn.textContent = visible ? "🙈" : "👁️";
  }

  eyeBtn?.addEventListener("click", () => {
    visible = !visible;
    localStorage.setItem("kib_balance_visible", visible);
    renderBalances();
  });

  // -------------------------
  // SLIDER
  // -------------------------
  const slider = $("accountSlider");
  const slides = slider?.querySelectorAll(".slide") || [];
  let currentIndex = 1;

  function updateSlider(i) {
    if (!slides.length) return;

    currentIndex = (i + slides.length) % slides.length;

    slides.forEach((s, idx) =>
      s.classList.toggle("active", idx === currentIndex)
    );

    const currency = slides[currentIndex].dataset.currency;
    window.accountState.currency = currency;

    $("transferCurrency") && ($("transferCurrency").value = currency);
    $("transferLabel") && ($("transferLabel").textContent = `Amount (${currency})`);
  }

  slider?.addEventListener("touchstart", e => {
    slider.startX = e.touches[0].clientX;
  });

  slider?.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - slider.startX;
    if (dx > 50) updateSlider(currentIndex - 1);
    if (dx < -50) updateSlider(currentIndex + 1);
  });

  updateSlider(currentIndex);

  // -------------------------
  // TRANSFER BUTTON (FIXED UX)
  // -------------------------
  const transferBtn = $("transferBtn");
  const protocolPanel = $("protocolPanel");

  transferBtn?.addEventListener("click", () => {

    if (!window.fxMeta) {
      alert("System loading...");
      return;
    }

    if (window.accountState.status === "RESTRICTED") {
      safeHide($("compliancePopup"), false);
      return;
    }

    if (protocolPanel) protocolPanel.hidden = false;
  });

  $("closeProtocol")?.addEventListener("click", () => {
    safeHide(protocolPanel, true);
  });

  // -------------------------
  // INPUT VALIDATION
  // -------------------------
  const input = $("transferAmount");
  const error = $("transferError");
  const confirmBtn = $("confirmTransferBtn");

  function validateInput() {
    if (!input) return null;

    const val = parseFloat(input.value);
    const max = window.accountState.balance.USD;

    if (!val || val <= 0) {
      safeHide(error, false);
      error.textContent = "Enter a valid amount";
      confirmBtn.disabled = true;
      return null;
    }

    if (val > max) {
      safeHide(error, false);
      error.textContent = "Amount exceeds balance";
      confirmBtn.disabled = true;
      return null;
    }

    safeHide(error, true);
    confirmBtn.disabled = false;
    return val;
  }

  input?.addEventListener("input", () => {
    const amount = validateInput();

    if (!amount) {
      safeHide($("fxBreakdown"), true);
      safeHide($("confirmTransferBox"), true);
      confirmBtn.disabled = true;
      return;
    }

    const currency = $("transferCurrency").value;
    const meta = window.fxMeta?.[currency];
    if (!meta) return;

    const receive = Math.floor(amount * meta.buyRate - meta.fee);

    $("fxRate").textContent = `1 USD = ${meta.buyRate.toFixed(4)} ${currency}`;
    $("fxFee").textContent = formatMoney(meta.fee, currency);
    $("fxReceive").textContent = formatMoney(receive, currency);

    safeHide($("fxBreakdown"), false);
    safeHide($("confirmTransferBox"), false);
  });

  // -------------------------
  // ADD TRANSACTION (FIXED)
  // -------------------------
  function addTransaction(tx) {
    const list = $("txList");
    if (!list) return;

    const el = document.createElement("div");
    el.className = "tx-item";

    el.innerHTML = `
      <div class="tx-left">
        <div class="tx-title">Outgoing Transfer</div>
        <div class="tx-sub">${tx.currency} conversion</div>
        <div class="tx-meta">${tx.date}</div>
      </div>
      <div class="tx-right">
        <div class="tx-amount debit">-${formatMoney(tx.amount, "USD")}</div>
        <div class="tx-status">Completed</div>
      </div>
    `;

    list.prepend(el);
  }

  // -------------------------
  // TRANSFER EXECUTION
  // -------------------------
  const loading = $("transferLoading");
  const receiptPopup = $("receiptPopup");
  const receiptContent = $("receiptContent");

  confirmBtn?.addEventListener("click", () => {

    const amount = validateInput();
    if (!amount) return;

    confirmBtn.disabled = true;
    safeHide(loading, false);

    setTimeout(() => {

      const currency = $("transferCurrency").value;
      const meta = window.fxMeta[currency];

      const receive = Math.floor(amount * meta.buyRate - meta.fee);

      const tx = {
        id: "TX-" + Date.now(),
        amount,
        currency,
        receive,
        rate: meta.buyRate,
        fee: meta.fee,
        date: new Date().toLocaleString()
      };

      window.accountState.balance.USD -= amount;

      updateBalances(window.accountState.balance);
      addTransaction(tx);

      receiptContent.innerHTML = `
        <p><b>ID:</b> ${tx.id}</p>
        <p><b>Sent:</b> ${formatMoney(amount, "USD")}</p>
        <p><b>Currency:</b> ${currency}</p>
        <p><b>Rate:</b> ${tx.rate.toFixed(4)}</p>
        <p><b>Fee:</b> ${formatMoney(tx.fee, currency)}</p>
        <p><b>Received:</b> ${formatMoney(tx.receive, currency)}</p>
        <p><b>Date:</b> ${tx.date}</p>
      `;

      safeHide(receiptPopup, false);

      // RESET (FIXED)
      input.value = "";
      safeHide(error, true);
      safeHide($("fxBreakdown"), true);
      safeHide($("confirmTransferBox"), true);
      confirmBtn.disabled = true;
      safeHide(loading, true);
      safeHide(protocolPanel, true);

    }, 1200);
  });

  $("closeReceipt")?.addEventListener("click", () => {
    safeHide(receiptPopup, true);
  });

  $("closePopup")?.addEventListener("click", () => {
    safeHide($("compliancePopup"), true);
  });

  // -------------------------
  // INIT
  // -------------------------
  await loadFX();
});
