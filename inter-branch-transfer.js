document.getElementById("year").textContent = new Date().getFullYear();

// Drawer
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const menuClose = document.getElementById("menuClose");
const drawerBackdrop = document.getElementById("drawerBackdrop");

function openDrawer(){
  drawer.classList.add("is-open");
  drawer.setAttribute("aria-hidden","false");
  menuBtn.setAttribute("aria-expanded","true");
}
function closeDrawer(){
  drawer.classList.remove("is-open");
  drawer.setAttribute("aria-hidden","true");
  menuBtn.setAttribute("aria-expanded","false");
}
menuBtn?.addEventListener("click", openDrawer);
menuClose?.addEventListener("click", closeDrawer);
drawerBackdrop?.addEventListener("click", closeDrawer);

// Slider (auto 3s + swipe)
const track = document.getElementById("heroTrack");
const dotsWrap = document.getElementById("heroDots");
const dots = dotsWrap ? Array.from(dotsWrap.querySelectorAll(".dot")) : [];

let index = 0;
let timer = null;

function setSlide(i){
  index = (i + 3) % 3;
  track.style.transform = `translateX(-${index * 100}%)`;
  dots.forEach((d, di) => d.classList.toggle("is-active", di === index));
}
function startAuto(){
  stopAuto();
  timer = setInterval(() => setSlide(index + 1), 3000);
}
function stopAuto(){
  if (timer) clearInterval(timer);
  timer = null;
}

dots.forEach((d, i) => {
  d.addEventListener("click", () => {
    setSlide(i);
    startAuto();
  });
});

let startX = 0;
let currentX = 0;
let isDown = false;

track.addEventListener("touchstart", (e) => {
  stopAuto();
  isDown = true;
  startX = e.touches[0].clientX;
}, {passive:true});

track.addEventListener("touchmove", (e) => {
  if (!isDown) return;
  currentX = e.touches[0].clientX;
}, {passive:true});

track.addEventListener("touchend", () => {
  if (!isDown) return;
  const dx = currentX - startX;
  const threshold = 40;

  if (dx > threshold) setSlide(index - 1);
  else if (dx < -threshold) setSlide(index + 1);

  isDown = false;
  startX = 0;
  currentX = 0;
  startAuto();
});

setSlide(0);
startAuto();

// Fade-in on scroll
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

reveals.forEach(el => io.observe(el));
