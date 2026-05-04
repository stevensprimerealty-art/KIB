import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
  "YOUR_SUPABASE_URL",
  "YOUR_ANON_KEY"
)

window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  const state = {
    index: 0,
    masked: false,

    balance: { USD: 0, EUR: 0, KRW: 0 },
    transactions: [],
    filteredCurrency: null,

    compliance: {
      restricted: false,
      reason: "Administrative Hold (ADM)"
    },

    fxRates: { EURUSD: 1.08, KRWUSD: 1300 },
    notifications: []
  };

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");
  const txList = $("txList");

  /* ================= AUTH (🔥 FIXED) ================= */

  async function getSession() {

    // 🔥 CRITICAL FIX (handles magic link token)
    const { data: urlSession } = await supabase.auth.getSessionFromUrl({
      storeSession: true
    })

    if (urlSession?.session) return urlSession.session

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      openPopup("Session expired. Please login again.")
      return null
    }

    return session
  }

  /* ================= COMPLIANCE ================= */

  async function loadCompliance(userId) {
    const { data } = await supabase
      .from("accounts")
      .select("restricted, restriction_reason")
      .eq("user_id", userId)
      .single()

    if (!data) return

    state.compliance.restricted = data.restricted
    state.compliance.reason = data.restriction_reason || "Restricted"
  }

  window.openTransfer = function () {
    if (state.compliance.restricted) {
      openPopup(state.compliance.reason)
      return
    }
    openPopup("Transfer allowed")
  }

  /* ================= BALANCE ================= */

  async function loadBalances(userId) {
    const { data } = await supabase
      .from("accounts")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (!data) {
      openPopup("No account data found")
      return
    }

    state.balance = {
      USD: data.usd_balance || 0,
      EUR: data.eur_balance || 0,
      KRW: data.krw_balance || 0
    }

    renderBalances()
  }

  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v ?? 0);
  }

  function mask(v) {
    return state.masked ? "••••••" : v;
  }

  function renderBalances() {
    slides.forEach((slide, i) => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");

      el.textContent = mask(formatMoney(state.balance[currency], currency));

      slide.onclick = () => {
        state.index = i

        state.filteredCurrency =
          state.filteredCurrency === currency ? null : currency

        updateSlider()
        renderTransactions(5)
      };
    });

    updateFX();
  }

  /* ================= FX ================= */

  async function loadFX() {
    try {
      const res = await fetch("https://api.exchangerate.host/latest?base=USD")
      const data = await res.json()

      if (data?.rates) {
        state.fxRates.EURUSD = 1 / data.rates.EUR
        state.fxRates.KRWUSD = data.rates.KRW
      }
    } catch {}
  }

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

  async function loadTransactions(userId) {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    state.transactions = data || []

    renderTransactions(1)
  }

  function renderTransactions(limit = 1) {
    txList.innerHTML = ""

    let data = state.transactions

    if (state.filteredCurrency) {
      data = data.filter(tx => tx.currency === state.filteredCurrency)
    }

    data = data.slice(0, limit)

    if (!data.length) {
      txList.innerHTML = `<div class="tx">No transactions</div>`
      return
    }

    data.forEach(tx => {
      const el = document.createElement("div")
      el.className = "tx"

      el.innerHTML = `
        <div>
          <div>${tx.type || "Transaction"}</div>
          <small>${new Date(tx.created_at).toLocaleString()}</small>
        </div>
        <div class="${tx.amount > 0 ? "credit" : "debit"}">
          ${tx.amount > 0 ? "+" : "-"}${formatMoney(Math.abs(tx.amount), tx.currency)}
        </div>
      `

      el.onclick = () => showReceipt(tx)

      txList.appendChild(el)
    })
  }

  /* ================= RECEIPT ================= */

  function showReceipt(tx) {
    openPopup(`
      <h3>SWIFT Receipt</h3>
      <p><b>Ref:</b> ${tx.id}</p>
      <p><b>Amount:</b> ${formatMoney(tx.amount, tx.currency)}</p>
      <p><b>Status:</b> ${tx.status || "Completed"}</p>
    `)
  }

  /* ================= NOTIFICATIONS ================= */

  async function loadNotifications(userId) {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)

    state.notifications = data || []
  }

  window.openNotifications = function () {
    if (!state.notifications.length) {
      openPopup("No notifications")
      return
    }

    openPopup(state.notifications.map(n => `<p>${n.message}</p>`).join(""))
  }

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
  }

  window.closePopup = function () {
    $("popup").hidden = true;
  }

  /* ================= INIT ================= */

  async function init() {
    const session = await getSession();
    if (!session) return;

    const userId = session.user.id;

    await loadFX()
    await loadCompliance(userId)
    await loadBalances(userId)
    await loadTransactions(userId)
    await loadNotifications(userId)

    setTimeout(updateSlider, 100);
  }

  init();

});
