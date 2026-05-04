/* =========================
   ACCOUNT STATE
========================= */
const account = {
  usd: 882000,
  restricted: true
};


/* =========================
   FIXED FX (CALCULATOR VALUES)
========================= */
const fixedFX = {
  EUR: 0.85,
  KRW: 1469
};

let fx = {
  eurRate: fixedFX.EUR,
  krwRate: fixedFX.KRW,
  eurValue: 0,
  krwValue: 0,
  timestamp: null
};


/* =========================
   ITALY TIME
========================= */
function getItalyTimeString(){
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}


/* =========================
   FX COMPUTE (FIXED)
========================= */
function computeFX(){
  fx.eurRate = fixedFX.EUR;
  fx.krwRate = fixedFX.KRW;

  fx.eurValue = Math.round(account.usd * fx.eurRate);     // 751,817
  fx.krwValue = Math.round(account.usd * fx.krwRate);     // 1,295,480,718

  fx.timestamp = Date.now();
}


/* =========================
   FORMATTERS
========================= */
function formatCurrency(amount, currency){
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function formatKRW(amount){
  return "₩" + Number(amount || 0).toLocaleString("en-US");
}


/* =========================
   STATE
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
      : formatCurrency(fx.eurValue, "EUR");
  }

  if(krwEl){
    krwEl.innerText = hiddenState.krw
      ? "••••"
      : formatKRW(fx.krwValue);
  }

  if(rateEl){
    rateEl.innerText =
      `1 USD = ${fx.eurRate.toFixed(2)} EUR · ${getItalyTimeString()}`;
  }

  syncButtons();
}


/* =========================
   BUTTON SYNC
========================= */
function syncButtons(){
  document.querySelectorAll(".card").forEach(card=>{
    const btn = card.querySelector("button");
    if(!btn) return;

    if(card.id === "usdCard"){
      btn.innerText = hiddenState.usd ? "Show" : "Hide";
    } 
    else if(card.querySelector("#eurBalance")){
      btn.innerText = hiddenState.eur ? "Show" : "Hide";
    } 
    else if(card.querySelector("#krwBalance")){
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

  setTimeout(() => {
    if(account.restricted) showCompliance();
  }, 1500);
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


/* =========================
   BLOCKED
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
  document.getElementById("drawer")?.classList.add("open");
  document.getElementById("drawerOverlay")?.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeDrawer(){
  document.getElementById("drawer")?.classList.remove("open");
  document.getElementById("drawerOverlay")?.classList.remove("active");
  document.body.style.overflow = "";
}


/* =========================
   ESC
========================= */
document.addEventListener("keydown", (e) => {
  if(e.key === "Escape"){
    closeDrawer();
    closeModal();
  }
});


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
  if(!img) return;

  document.getElementById("profileImg")?.setAttribute("src", img);
  document.getElementById("drawerImg")?.setAttribute("src", img);
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
  else if(card.querySelector("#eurBalance")){
    hiddenState.eur = !hiddenState.eur;
  } 
  else if(card.querySelector("#krwBalance")){
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
   LOAD STATE
========================= */
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});
