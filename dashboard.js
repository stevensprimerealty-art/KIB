const account = {
  usd: 882000,
  eurRate: 0.92,
  krwRate: 1430,
  restricted: true
};

// FX conversion
document.getElementById("eurBalance").innerText =
  "€" + (account.usd * account.eurRate).toLocaleString();

document.getElementById("krwBalance").innerText =
  "₩" + (account.usd * account.krwRate).toLocaleString();


// AUTO POPUP AFTER 2s
setTimeout(showCompliance, 2000);


// BLOCKED ACTION
function blocked(){
  showCompliance();
}


// MODAL
function showCompliance(){
  document.getElementById("modal").style.display = "flex";
}

function closeModal(){
  document.getElementById("modal").style.display = "none";
}


// DRAWER
function openDrawer(){
  document.getElementById("drawer").classList.toggle("open");
}


// LOGOUT
function logout(){
  localStorage.clear();
  window.location.href = "index.html";
}


// PROFILE IMAGE
function pickImage(){
  document.getElementById("imgPicker").click();
}

document.getElementById("imgPicker").addEventListener("change", function(e){
  const file = e.target.files[0];
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


// TOGGLE BALANCE
function toggleBalance(btn){
  const p = btn.previousElementSibling;
  if(p.innerText.includes("*")){
    location.reload();
  } else {
    p.innerText = "****";
  }
}


// CARD AUTO FLIP
setInterval(()=>{
  document.getElementById("usdCard").classList.toggle("active");
}, 4000);
