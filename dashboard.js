/* =========================
   ACCOUNT STATE
========================= */
const account = {
  usd: 882000,
  restricted: true
};


/* =========================
   FX ENGINE (BANK STYLE CACHE)
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

function computeFX(){
  // refresh every 60 seconds (real banking behavior)
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
  }).format(amount);
}

function formatTime(ts){
  if(!ts) return "";
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
}


/* =========================
   STATE (PERSISTENT)
========================= */
let hiddenState = JSON.parse(localStorage.getItem("hiddenState")) || {
  usd: false,
  eur: false,
  krw: false
};

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
      : "₩" + fx.krwValue.toLocaleString();
  }

  if(rateEl){
    rateEl.innerText =
      `1 USD ≈ ${fx.eurRate.toFixed(4)} EUR • ${formatTime(fx.timestamp)}`;
  }
}


/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  loadBalances();
  loadImage();
  initImagePicker();
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

// auto popup
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
   DRAWER (REAL FIX)
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


/* CLICK OUTSIDE FIX (SAFE) */
document.addEventListener("click", (e) => {
  const drawer = document.getElementById("drawer");
  const menuBtn = document.querySelector(".menuBtn");

  if(!drawer || !drawer.classList.contains("open")) return;

  if(
    !drawer.contains(e.target) &&
    menuBtn && !menuBtn.contains(e.target)
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
  } catch(e){}

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
   BALANCE TOGGLE
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

  btn.innerText = btn.innerText === "Hide" ? "Show" : "Hide";

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
   CARD FLIP (SMART)
========================= */
let flipInterval;

function startCardFlip(){
  stopCardFlip(); // prevent duplicates

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
