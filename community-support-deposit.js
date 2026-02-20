// ===== Fade-in on scroll =====
const reveals = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  },
  { threshold: 0.12 }
);
reveals.forEach((el) => io.observe(el));

// ===== Hero slider: auto 3s + dots + swipe =====
const slider = document.getElementById("heroSlider");
const track = document.getElementById("heroTrack");
const dotsWrap = document.getElementById("heroDots");
const slides = Array.from(track.children);

let index = 0;
let autoTimer = null;

function renderDots() {
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = i === index ? "is-active" : "";
    b.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(b);
  });
}

function goTo(i) {
  index = (i + slides.length) % slides.length;
  track.style.transform = `translateX(-${index * 100}%)`;
  renderDots();
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(() => goTo(index + 1), 3000);
}
function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

renderDots();
startAuto();

// Pause auto when interacting
slider.addEventListener("pointerdown", stopAuto);
slider.addEventListener("pointerup", startAuto);
slider.addEventListener("pointercancel", startAuto);

// Swipe support
let startX = 0;
let dx = 0;
let dragging = false;

slider.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
  dx = 0;
  dragging = true;
  stopAuto();
}, { passive: true });

slider.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  dx = e.touches[0].clientX - startX;
}, { passive: true });

slider.addEventListener("touchend", () => {
  dragging = false;

  if (Math.abs(dx) > 45) {
    if (dx < 0) goTo(index + 1);
    else goTo(index - 1);
  }
  startAuto();
});
