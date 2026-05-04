/* =========================
   ACCOUNT STATE
========================= */
const account = {
  usd: 882000,
  restricted: true
};


/* =========================
   FX ENGINE (REALISTIC CACHE + ITALY TIME)
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
  timestamp: null
};

/* =========================
   ITALY TIME HELPERS
========================= */
function getItalyDate(){
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Europe/Rome" })
  );
}

function getItalyTimeString(){
  return getItalyDate().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

/* =========================
   FX COMPUTE
========================= */
function computeFX(){
  const now = Date.now();

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

function formatTime(){
  return getItalyTimeString(); // always Italy
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
   LOAD BALANCES
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
      : formatCurrency(fx.eurValue || 0, "EUR");
  }

  if(krwEl){
    krwEl.innerText = hiddenState.krw
      ? "••••"
      : formatKRW(fx.krwValue || 0);
  }

  if(rateEl && fx.eurRate){
    rateEl.innerText =
      `1 USD ≈ ${fx.eurRate.toFixed(4)} EUR · ${formatTime()}`;
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
    }

    if(card.querySelector("#eurBalance")){
      btn.innerText = hiddenState.eur ? "Show" : "Hide";
    }

    if(card.querySelector("#krwBalance")){
      btn.innerText = hiddenState.krw ? "Show" : "Hide";
    }
  });
}


/* =========================
   INIT
========================= */
let fxInterval;

document.addEventListener("DOMContentLoaded", () => {
  loadBalances();
  loadImage();
  initImagePicker();

  if(!fxInterval){
    fxInterval = setInterval(loadBalances, 60000);
  }
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
   DRAWER
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


/* =========================
   CLICK OUTSIDE
========================= */
document.addEventListener("click", (e) => {
  const drawer = document.getElementById("drawer");
  const menuBtn = document.querySelector(".menuBtn");

  if(!drawer || !drawer.classList.contains("open")) return;

  if(!drawer.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))){
    closeDrawer();
  }
});


/* =========================
   ESC SUPPORT
========================= */
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
  document.getElementById("imgPicker")?.click();
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
    document.getElementById("profileImg").src = img;
    document.getElementById("drawerImg").src = img;
  }
}


/* =========================
   BALANCE TOGGLE
========================= */
function toggleBalance(btn){
  const card = btn.closest(".card");
  if(!card) return;

  if(card.id === "usdCard"){
    hiddenState.usd = !hiddenState.usd;
  }

  if(card.querySelector("#eurBalance")){
    hiddenState.eur = !hiddenState.eur;
  }

  if(card.querySelector("#krwBalance")){
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
    document.getElementById("usdCard")?.classList.toggle("active");
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
