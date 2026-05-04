/* =========================
   ACCOUNT STATE
========================= */
const account = {
  usd: 882000,
  restricted: true
};


/* =========================
   FX ENGINE (REALISTIC CACHE)
========================= */
const midMarket = {
  EUR: 0.94,
  KRW: 1430
};

let fx = {
  eurRate: 0,
  krwRate: 0,
  eurValue: 0,
  krwValue: 0,
  timestamp: 0
};

function computeFX(){
  const now = Date.now();

  // refresh every 60s
  if (fx.timestamp && (now - fx.timestamp) < 60000) return;

  const eurSpread = 0.012;
  const krwSpread = 0.018;

  fx.eurRate = midMarket.EUR * (1 - eurSpread);
  fx.krwRate = midMarket.KRW * (1 - krwSpread);

  fx.eurValue = account.usd * fx.eurRate;
  fx.krwValue = Math.floor(account.usd * fx.krwRate);

  fx.timestamp = now;
}


/* =========================
   FORMATTERS
========================= */
function formatCurrency(amount, currency){
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatKRW(amount){
  return "₩" + Number(amount || 0).toLocaleString("en-US");
}

function formatTime(ts){
  if(!ts) return "";
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}


/* =========================
   STATE (SAFE)
========================= */
function getSavedState(){
  try {
    return JSON.parse(localStorage.getItem("hiddenState")) || {
      usd:false, eur:false, krw:false
    };
  } catch {
    return { usd:false, eur:false, krw:false };
  }
}

let hiddenState = getSavedState();

function saveState(){
  localStorage.setItem("hiddenState", JSON.stringify(hiddenState));
}


/* =========================
   LOAD BALANCES (FIXED)
========================= */
function loadBalances(){

  computeFX();

  const usdEl = document.getElementById("usdBalance");
  const eurEl = document.getElementById("eurBalance");
  const krwEl = document.getElementById("krwBalance");
  const rateEl = document.getElementById("eurRateText");

  if(usdEl){
    usdEl.innerText = hiddenState.usd
      ? "••••"
      : formatCurrency(account.usd, "USD");
  }

  if(eurEl){
    eurEl.innerText = hiddenState.eur
      ? "••••"
      : formatCurrency(fx.eurValue, "EUR");
  }

  if(krwEl){
    krwEl.innerText = hiddenState.krw
      ? "••••"
      : formatKRW(fx.krwValue);
  }

  if(rateEl){
    rateEl.innerText =
      `1 USD ≈ ${fx.eurRate.toFixed(4)} EUR • ${formatTime(fx.timestamp)}`;
  }

  syncButtons();
}


/* =========================
   BUTTON STATE SYNC
========================= */
function syncButtons(){
  document.querySelectorAll(".card").forEach(card=>{
    const btn = card.querySelector("button");
    if(!btn) return;

    if(card.id === "usdCard"){
      btn.innerText = hiddenState.usd ? "Show" : "Hide";
    } else if(card.querySelector("#eurBalance")){
      btn.innerText = hiddenState.eur ? "Show" : "Hide";
    } else if(card.querySelector("#krwBalance")){
      btn.innerText = hiddenState.krw ? "Show" : "Hide";
    }
  });
}


/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadBalances();
  loadImage();
  initImagePicker();

  // refresh FX every 60s (real app behavior)
  setInterval(loadBalances, 60000);
});


/* =========================
   MODAL
========================= */
let modalOpen = false;

function showCompliance(){
  if(modalOpen) return;

  const modal = document.getElementById("modal");
  if(!modal) return;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modalOpen = true;
}

function closeModal(){
  const modal = document.getElementById("modal");
  if(!modal) return;

  modal.style.display = "none";
  document.body.style.overflow = "";

  modalOpen = false;
}

setTimeout(() => {
  if(account.restricted) showCompliance();
}, 2000);


/* =========================
   BLOCKED ACTIONS
========================= */
function blocked(){
  if(account.restricted){
    showCompliance();
  }
}


/* =========================
   DRAWER (STABLE)
========================= */
function openDrawer(){
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawerOverlay");

  if(!drawer || !overlay) return;

  drawer.classList.add("open");
  overlay.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeDrawer(){
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawerOverlay");

  if(!drawer || !overlay) return;

  drawer.classList.remove("open");
  overlay.classList.remove("active");
  document.body.style.overflow = "";
}


/* CLICK OUTSIDE */
document.addEventListener("click", (e) => {
  const drawer = document.getElementById("drawer");
  const menuBtn = document.querySelector(".menuBtn");

  if(!drawer || !drawer.classList.contains("open")) return;

  if(
    !drawer.contains(e.target) &&
    (!menuBtn || !menuBtn.contains(e.target))
  ){
    closeDrawer();
  }
});


/* ESC SUPPORT */
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape"){
    closeDrawer();
    closeModal();
  }
});


/* =========================
   LOGOUT
========================= */
async function logout(){
  try {
    if(window.supabase){
      await supabase.auth.signOut();
    }
  } catch {}

  localStorage.clear();
  window.location.href = "index.html";
}


/* =========================
   PROFILE IMAGE
========================= */
function pickImage(){
  const input = document.getElementById("imgPicker");
  if(input) input.click();
}

function initImagePicker(){
  const input = document.getElementById("imgPicker");
  if(!input) return;

  input.addEventListener("change", e => {
    const file = e.target.files[0];
    if(!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      localStorage.setItem("profileImg", reader.result);
      loadImage();
    };

    reader.readAsDataURL(file);
  });
}

function loadImage(){
  const img = localStorage.getItem("profileImg");

  if(img){
    const profile = document.getElementById("profileImg");
    const drawer = document.getElementById("drawerImg");

    if(profile) profile.src = img;
    if(drawer) drawer.src = img;
  }
}


/* =========================
   BALANCE TOGGLE (FIXED)
========================= */
function toggleBalance(btn){
  const card = btn.closest(".card");
  if(!card) return;

  if(card.id === "usdCard"){
    hiddenState.usd = !hiddenState.usd;
  } else if(card.querySelector("#eurBalance")){
    hiddenState.eur = !hiddenState.eur;
  } else if(card.querySelector("#krwBalance")){
    hiddenState.krw = !hiddenState.krw;
  }

  saveState();
  loadBalances();
}


/* =========================
   TRANSACTION TOGGLE
========================= */
function toggleTx(){
  const el = document.getElementById("txDetails");
  if(!el) return;

  el.style.display =
    el.style.display === "block" ? "none" : "block";
}


/* =========================
   CARD FLIP
========================= */
let flipInterval;

function startCardFlip(){
  stopCardFlip();

  flipInterval = setInterval(() => {
    const el = document.getElementById("usdCard");
    if(el) el.classList.toggle("active");
  }, 4000);
}

function stopCardFlip(){
  if(flipInterval) clearInterval(flipInterval);
}

document.addEventListener("visibilitychange", () => {
  document.hidden ? stopCardFlip() : startCardFlip();
});

startCardFlip();


/* =========================
   LOAD STATE
========================= */
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});
