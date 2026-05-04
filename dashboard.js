/* =========================
   ACCOUNT STATE
========================= */
const account = {
  usd: 882000,
  restricted: true
};


/* =========================
   FX ENGINE (CACHED LIKE BANK)
========================= */
const midMarket = {
  EUR: 0.94,
  KRW: 1430
};

let fx = {
  eurRate: 0,
  krwRate: 0,
  eurValue: 0,
  krwValue: 0
};

function computeFX(){
  const eurSpread = 0.012;
  const krwSpread = 0.018;

  fx.eurRate = midMarket.EUR * (1 - eurSpread);
  fx.krwRate = midMarket.KRW * (1 - krwSpread);

  fx.eurValue = account.usd * fx.eurRate;
  fx.krwValue = Math.floor(account.usd * fx.krwRate);
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


/* =========================
   LOAD BALANCES (SINGLE SOURCE)
========================= */
function loadBalances(){

  computeFX();

  document.getElementById("usdBalance").innerText =
    hiddenState.usd ? "••••" : formatCurrency(account.usd, "USD");

  document.getElementById("eurBalance").innerText =
    hiddenState.eur ? "••••" : formatCurrency(fx.eurValue, "EUR");

  document.getElementById("krwBalance").innerText =
    hiddenState.krw ? "••••" : "₩" + fx.krwValue.toLocaleString();

  const rateEl = document.getElementById("eurRateText");
  if(rateEl){
    rateEl.innerText = `1 USD ≈ ${fx.eurRate.toFixed(4)} EUR (bank rate)`;
  }
}

loadBalances();


/* =========================
   COMPLIANCE MODAL
========================= */
let modalOpen = false;

function showCompliance(){
  if(modalOpen) return;
  modalOpen = true;
  document.getElementById("modal").style.display = "flex";
}

function closeModal(){
  modalOpen = false;
  document.getElementById("modal").style.display = "none";
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
   DRAWER (SAFE)
========================= */
function openDrawer(){
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawerOverlay");

  drawer.classList.toggle("open");
  if(overlay) overlay.classList.toggle("active");
}

function closeDrawer(){
  document.getElementById("drawer").classList.remove("open");
  const overlay = document.getElementById("drawerOverlay");
  if(overlay) overlay.classList.remove("active");
}


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
   PROFILE IMAGE (PERSISTENT)
========================= */
function pickImage(){
  document.getElementById("imgPicker").click();
}

document.getElementById("imgPicker").addEventListener("change", e => {
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();

  reader.onload = () => {
    localStorage.setItem("profileImg", reader.result);
    loadImage();
  };

  reader.readAsDataURL(file);
});

function loadImage(){
  const img = localStorage.getItem("profileImg");

  if(img){
    document.getElementById("profileImg").src = img;
    document.getElementById("drawerImg").src = img;
  }
}

loadImage();


/* =========================
   BALANCE TOGGLE (STABLE)
========================= */
let hiddenState = {
  usd: false,
  eur: false,
  krw: false
};

function toggleBalance(btn){
  const card = btn.closest(".card");

  if(card.id === "usdCard"){
    hiddenState.usd = !hiddenState.usd;

  } else if(card.querySelector("#eurBalance")){
    hiddenState.eur = !hiddenState.eur;

  } else if(card.querySelector("#krwBalance")){
    hiddenState.krw = !hiddenState.krw;
  }

  btn.innerText = btn.innerText === "Hide" ? "Show" : "Hide";

  loadBalances(); // re-render properly
}


/* =========================
   TRANSACTION TOGGLE (NEW)
========================= */
function toggleTx(){
  const el = document.getElementById("txDetails");
  if(!el) return;

  el.style.display =
    el.style.display === "block" ? "none" : "block";
}


/* =========================
   CARD FLIP (OPTIMIZED)
========================= */
let flipInterval;

function startCardFlip(){
  flipInterval = setInterval(() => {
    const el = document.getElementById("usdCard");
    if(el) el.classList.toggle("active");
  }, 4000);
}

function stopCardFlip(){
  clearInterval(flipInterval);
}

document.addEventListener("visibilitychange", () => {
  if(document.hidden){
    stopCardFlip();
  } else {
    startCardFlip();
  }
});

startCardFlip();


/* =========================
   LOAD STATE
========================= */
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});
