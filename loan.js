// loan.js

// ---------- Mobile menu toggle ----------
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener("click", () => {
    const open = mobileMenu.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", String(open));
    mobileMenu.setAttribute("aria-hidden", String(!open));
  });
}

// ---------- Accordions (header menu + footer) ----------
function setupAccordions(selectorBtn, selectorPanelPrefix = "") {
  const btns = document.querySelectorAll(selectorBtn);
  btns.forEach(btn => {
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-acc");
      if (!id) return;
      const panel = document.getElementById(id);
      if (!panel) return;

      const isOpen = panel.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(isOpen));

      // rotate chevron by toggling aria-expanded (CSS handles it where needed)
      // Close other panels in the same group (nice mobile behavior)
      btns.forEach(other => {
        if (other === btn) return;
        const otherId = other.getAttribute("data-acc");
        const otherPanel = otherId ? document.getElementById(otherId) : null;
        if (otherPanel) otherPanel.classList.remove("is-open");
        other.setAttribute("aria-expanded", "false");
      });
    });
  });
}

setupAccordions(".accordion-btn");
setupAccordions(".footer-acc-btn");

// ---------- Fade-in on scroll ----------
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("in-view");
  });
}, { threshold: 0.12 });

revealEls.forEach(el => io.observe(el));

// ---------- Hero slider (3 images, auto 3s, touch swipe) ----------
const slider = document.getElementById("heroSlider");
const slidesEl = document.getElementById("slides");
const dotsEl = document.getElementById("dots");

let index = 0;
let timer = null;

function slideCount() {
  return slidesEl ? slidesEl.children.length : 0;
}

function renderDots() {
  if (!dotsEl || !slidesEl) return;
  dotsEl.innerHTML = "";
  for (let i = 0; i < slideCount(); i++) {
    const d = document.createElement("div");
    d.className = "dot" + (i === index ? " is-active" : "");
    d.addEventListener("click", () => goTo(i, true));
    dotsEl.appendChild(d);
  }
}

function goTo(i, userAction = false) {
  if (!slidesEl) return;
  const n = slideCount();
  if (n === 0) return;

  index = (i + n) % n;
  slidesEl.style.transform = `translateX(${-index * 100}%)`;
  renderDots();

  if (userAction) restartAuto();
}

function next() {
  goTo(index + 1);
}

function restartAuto() {
  if (timer) clearInterval(timer);
  timer = setInterval(next, 3000);
}

// Touch swipe
let startX = 0;
let dx = 0;
let dragging = false;

function onTouchStart(e) {
  if (!slidesEl) return;
  dragging = true;
  startX = e.touches[0].clientX;
  dx = 0;
  if (timer) clearInterval(timer);
}

function onTouchMove(e) {
  if (!dragging) return;
  dx = e.touches[0].clientX - startX;
}

function onTouchEnd() {
  if (!dragging) return;
  dragging = false;

  const threshold = 50; // px
  if (dx > threshold) goTo(index - 1, true);
  else if (dx < -threshold) goTo(index + 1, true);
  else restartAuto();
}

if (slider && slidesEl) {
  renderDots();
  restartAuto();

  slider.addEventListener("touchstart", onTouchStart, { passive: true });
  slider.addEventListener("touchmove", onTouchMove, { passive: true });
  slider.addEventListener("touchend", onTouchEnd);
  slider.addEventListener("touchcancel", onTouchEnd);
}

// Safety: if images fail to load (because you haven't added .jpg yet), keep layout clean
document.querySelectorAll("img").forEach(img => {
  img.addEventListener("error", () => {
    img.style.display = "none";
    const parent = img.parentElement;
    if (parent) parent.style.background =
      "linear-gradient(135deg, rgba(11,103,178,.18), rgba(13,23,38,.06))";
  });
});
