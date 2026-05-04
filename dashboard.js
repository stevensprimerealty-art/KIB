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
    fee: { EUR: 12, KRW: 3500 },
    displayAdjustment: 0.995
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
    const sellRate = rate * (1 + spread);

    return {
      display: usd * rate * FX_CONFIG.displayAdjustment,
      converted: usd * buyRate - fee,
      buyRate,
      sellRate,
      fee
    };
  }

  function updateBalances(balances) {
    document.querySelectorAll(".slide").forEach(slide => {
      const c = slide.dataset.currency;
      const val = balances[c];

      if (val == null) return; // FIXED

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

      if (!data?.rates) throw new Error("Invalid FX");

      const usd = window.accountState.balance.USD;

      const eur = applyBankRates(usd, data.rates.EUR, "EUR");
      const krw = applyBankRates(usd, data.rates.KRW, "KRW");

      window.accountState.balance.EUR = eur.display;
      window.accountState.balance.KRW = krw.display;

      window.fxMeta = { EUR: eur, KRW: krw };

      updateBalances({
        USD: usd,
        EUR: eur.display,
        KRW: krw.display
      });

    } catch {
      console.warn("FX fallback");

      const usd = window.accountState.balance.USD;

      const eur = applyBankRates(usd, 0.85, "EUR");
      const krw = applyBankRates(usd, 1470, "KRW");

      window.fxMeta = { EUR: eur, KRW: krw };

      updateBalances({
        USD: usd,
        EUR: eur.display,
        KRW: krw.display
      });
    }
  }

  // -------------------------
  // BALANCE VISIBILITY
  // -------------------------
  const eyeBtn = $("toggleBalance");
  let visible = localStorage.getItem("kib_balance_visible") === "true";

  function maskMoney(text) {
    if (!text) return "••••••••";
    const symbol = text.match(/^[^\d]+/)?.[0] || "";
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
  // SLIDER (SAFE)
  // -------------------------
  const slider = $("accountSlider");
  const slides = slider?.querySelectorAll(".slide") || [];

  let currentIndex = 1;

  function updateSlider(i) {
    if (!slides.length) return;

    slides.forEach((s, idx) => s.classList.toggle("active", idx === i));
    window.accountState.currency = slides[i].dataset.currency;
  }

  slider?.addEventListener("touchstart", e => {
    slider.startX = e.touches[0].clientX;
  });

  slider?.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - slider.startX;

    if (dx > 50) currentIndex--;
    if (dx < -50) currentIndex++;

    currentIndex = (currentIndex + slides.length) % slides.length;
    updateSlider(currentIndex);
  });

  updateSlider(currentIndex);

  // -------------------------
  // FX BREAKDOWN
  // -------------------------
  const fxBox = $("fxBreakdown");
  const fxRate = $("fxRate");
  const fxFee = $("fxFee");
  const fxReceive = $("fxReceive");

  function showFx(currency) {
    const meta = window.fxMeta?.[currency];
    if (!meta) return;

    const receive = Math.floor(meta.converted);

    fxRate.textContent = `1 USD = ${meta.buyRate.toFixed(4)} ${currency}`;
    fxFee.textContent = formatMoney(meta.fee, currency);
    fxReceive.textContent = formatMoney(receive, currency);

    if (fxBox) fxBox.hidden = false;
  }

  // -------------------------
  // TRANSFER ENGINE
  // -------------------------
  const confirmBox = $("confirmTransferBox");
  const confirmBtn = $("confirmTransferBtn");
  const receiptPopup = $("receiptPopup");
  const receiptContent = $("receiptContent");

  let pendingTransfer = null;

  function prepareTransfer(currency) {
    const meta = window.fxMeta?.[currency];
    if (!meta) return;

    const usd = window.accountState.balance.USD;
    const receive = Math.floor(meta.converted);

    pendingTransfer = {
      id: "TX-" + Date.now(),
      from: "USD",
      to: currency,
      usd,
      rate: meta.buyRate,
      fee: meta.fee,
      receive,
      date: new Date().toLocaleString()
    };

    if (confirmBox) confirmBox.hidden = false;
  }

  function showReceipt(tx) {
    if (!receiptContent) return;

    receiptContent.innerHTML = `
      <p><b>ID:</b> ${tx.id}</p>
      <p><b>From:</b> USD</p>
      <p><b>To:</b> ${tx.to}</p>
      <p><b>Sent:</b> $${tx.usd.toLocaleString()}</p>
      <p><b>Rate:</b> ${tx.rate.toFixed(4)}</p>
      <p><b>Fee:</b> ${formatMoney(tx.fee, tx.to)}</p>
      <p><b>Received:</b> ${formatMoney(tx.receive, tx.to)}</p>
      <p><b>Date:</b> ${tx.date}</p>
    `;

    if (receiptPopup) receiptPopup.hidden = false;
  }

  confirmBtn?.addEventListener("click", () => {
    if (!pendingTransfer) return;

    if (window.accountState.status === "RESTRICTED") {
      $("compliancePopup")?.classList.remove("hidden");
      return;
    }

    // deduct balance
    window.accountState.balance.USD = 0;

    // re-render UI 🔥
    updateBalances(window.accountState.balance);

    // store history
    const history =
      JSON.parse(localStorage.getItem("kib_tx_history") || "[]");

    history.unshift(pendingTransfer);
    localStorage.setItem("kib_tx_history", JSON.stringify(history));

    showReceipt(pendingTransfer);
  });

  $("closeReceipt")?.addEventListener("click", () => {
    if (receiptPopup) receiptPopup.hidden = true;
  });

  $("downloadReceipt")?.addEventListener("click", () => {
    if (!pendingTransfer) return;

    const blob = new Blob([JSON.stringify(pendingTransfer, null, 2)], {
      type: "application/json"
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${pendingTransfer.id}.json`;
    a.click();

    URL.revokeObjectURL(url);
  });

  // -------------------------
  // PROTOCOL BUTTONS
  // -------------------------
  document.querySelectorAll(".protocol-btn").forEach(btn => {
    btn.addEventListener("click", () => {

      const currency = window.accountState.currency;

      if (currency === "USD") {
        fxBox && (fxBox.hidden = true);
        confirmBox && (confirmBox.hidden = true);
        return;
      }

      showFx(currency);
      prepareTransfer(currency);
    });
  });

  // -------------------------
  // INIT
  // -------------------------
  await loadFX();

});
