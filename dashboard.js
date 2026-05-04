/* =========================
   ACCOUNT STATE
========================= */
const account = {
  usd: 882000,
  eurRate: 0.92,
  krwRate: 1430,
  restricted: true
};


/* =========================
   FORMATTERS
========================= */
function formatCurrency(amount, currency){
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}


/* =========================
   INIT BALANCES
========================= */
function loadBalances(){
  document.getElementById("usdBalance").innerText =
    formatCurrency(account.usd, "USD");

  document.getElementById("eurBalance").innerText =
    formatCurrency(account.usd * account.eurRate, "EUR");

  document.getElementById("krwBalance").innerText =
    "₩" + (account.usd * account.krwRate).toLocaleString();
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


// AUTO POPUP
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
   DRAWER
========================= */
function openDrawer(){
  const drawer = document.getElementById("drawer");
  drawer.classList.toggle("open");
}

// close drawer on outside click
document.addEventListener("click", (e) => {
  const drawer = document.getElementById("drawer");
  if(drawer.classList.contains("open")){
    if(!drawer.contains(e.target) && !e.target.closest(".topbar")){
      drawer.classList.remove("open");
    }
  }
});


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
  }

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
   BALANCE TOGGLE (REAL FIX)
========================= */
let hiddenState = {
  usd: false,
  eur: false,
  krw: false
};

function toggleBalance(btn){
  const card = btn.closest(".card");
  const balanceEl = card.querySelector("p");

  if(card.id === "usdCard"){
    hiddenState.usd = !hiddenState.usd;

    balanceEl.innerText = hiddenState.usd
      ? "****"
      : formatCurrency(account.usd, "USD");

  } else if(balanceEl.id === "eurBalance"){
    hiddenState.eur = !hiddenState.eur;

    balanceEl.innerText = hiddenState.eur
      ? "****"
      : formatCurrency(account.usd * account.eurRate, "EUR");

  } else if(balanceEl.id === "krwBalance"){
    hiddenState.krw = !hiddenState.krw;

    balanceEl.innerText = hiddenState.krw
      ? "****"
      : "₩" + (account.usd * account.krwRate).toLocaleString();
  }

  btn.innerText = btn.innerText === "Hide" ? "Show" : "Hide";
}


/* =========================
   CARD FLIP (SMART)
========================= */
let flipInterval = null;

function startCardFlip(){
  flipInterval = setInterval(() => {
    document.getElementById("usdCard").classList.toggle("active");
  }, 4000);
}

function stopCardFlip(){
  clearInterval(flipInterval);
}

// only flip when visible
document.addEventListener("visibilitychange", () => {
  if(document.hidden){
    stopCardFlip();
  } else {
    startCardFlip();
  }
});

startCardFlip();


/* =========================
   EXTRA REALISM
========================= */

// simulate banking loading delay
window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});
