/* =========================
   ACCOUNT STATE
========================= */
const account = {
  usd: 882000,
  restricted: true
};


/* =========================
   MID-MARKET RATES (BASE)
========================= */
const midMarket = {
  EUR: 0.94,
  KRW: 1430
};


/* =========================
   BANK FX ENGINE (REALISTIC)
========================= */
function applyBankSpread(rate, currency){
  let spread;

  switch(currency){
    case "EUR":
      spread = 0.012; // 1.2%
      break;
    case "KRW":
      spread = 0.018; // 1.8%
      break;
    default:
      spread = 0.015;
  }

  return rate * (1 - spread);
}

function getBankRate(currency){
  return applyBankSpread(midMarket[currency], currency);
}


/* =========================
   FORMATTERS
========================= */
function formatCurrency(amount, currency){
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(amount);
}


/* =========================
   LOAD BALANCES (FIXED)
========================= */
function loadBalances(){

  const eurRate = getBankRate("EUR");
  const krwRate = getBankRate("KRW");

  document.getElementById("usdBalance").innerText =
    formatCurrency(account.usd, "USD");

  document.getElementById("eurBalance").innerText =
    formatCurrency(account.usd * eurRate, "EUR");

  document.getElementById("krwBalance").innerText =
    "₩" + Math.floor(account.usd * krwRate).toLocaleString();

  // OPTIONAL: show rate info (if element exists)
  if(document.getElementById("eurRateText")){
    document.getElementById("eurRateText").innerText =
      `1 USD ≈ ${eurRate.toFixed(4)} EUR`;
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


// AUTO POPUP (REALISTIC)
setTimeout(() => {
  if(account.restricted){
    showCompliance();
  }
}, 2000);


/* =========================
   BLOCKED ACTIONS
========================= */
function blocked(){
  if(account.restricted){
    showCompliance();
    return;
  }
}


/* =========================
   DRAWER + OVERLAY (FIXED)
========================= */
function openDrawer(){
  const drawer = document.getElementById("drawer");
  const overlay = document.getElementById("drawerOverlay");

  drawer.classList.toggle("open");
  overlay.classList.toggle("active");
}

function closeDrawer(){
  document.getElementById("drawer").classList.remove("open");
  document.getElementById("drawerOverlay").classList.remove("active");
}


/* =========================
   LOGOUT (SUPABASE SAFE)
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

document.getElementById("imgPicker").addEventListener("change", function(e){
  const file = e.target.files[0];
  if(!file) return;

  const reader = new FileReader();

  reader.onload = function(){
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
   BALANCE TOGGLE (FIXED)
========================= */
let hiddenState = {
  usd: false,
  eur: false,
  krw: false
};

function toggleBalance(btn){
  const card = btn.closest(".card");
  const balanceEl = card.querySelector("p");

  const eurRate = getBankRate("EUR");
  const krwRate = getBankRate("KRW");

  if(card.id === "usdCard"){
    hiddenState.usd = !hiddenState.usd;

    balanceEl.innerText = hiddenState.usd
      ? "••••"
      : formatCurrency(account.usd, "USD");

  } else if(balanceEl.id === "eurBalance"){
    hiddenState.eur = !hiddenState.eur;

    balanceEl.innerText = hiddenState.eur
      ? "••••"
      : formatCurrency(account.usd * eurRate, "EUR");

  } else if(balanceEl.id === "krwBalance"){
    hiddenState.krw = !hiddenState.krw;

    balanceEl.innerText = hiddenState.krw
      ? "••••"
      : "₩" + Math.floor(account.usd * krwRate).toLocaleString();
  }

  btn.innerText = btn.innerText === "Hide" ? "Show" : "Hide";
}


/* =========================
   CARD FLIP (OPTIMIZED)
========================= */
let flipInterval;

function startCardFlip(){
  flipInterval = setInterval(() => {
    document.getElementById("usdCard").classList.toggle("active");
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
