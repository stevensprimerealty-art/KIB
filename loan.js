/* -------------------------
   Header mobile menu
-------------------------- */
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");

function setMenu(open) {
  hamburgerBtn.setAttribute("aria-expanded", open ? "true" : "false");
  mobileMenu.style.display = open ? "block" : "none";
  mobileMenu.setAttribute("aria-hidden", open ? "false" : "true");
}
setMenu(false);

hamburgerBtn.addEventListener("click", () => {
  const isOpen = hamburgerBtn.getAttribute("aria-expanded") === "true";
  setMenu(!isOpen);
});

/* -------------------------
   Hero slider (auto 3s + swipe)
-------------------------- */
const heroTrack = document.getElementById("heroTrack");
const heroDotsWrap = document.getElementById("heroDots");
const dots = Array.from(heroDotsWrap.querySelectorAll(".dot"));

let slideIndex = 0;
let autoTimer = null;

function renderSlide(index, animate = true) {
  slideIndex = index;
  if (!animate) heroTrack.style.transition = "none";
  heroTrack.style.transform = `translateX(-${index * 100}%)`;
  if (!animate) {
    // force reflow then restore transition
    void heroTrack.offsetHeight;
    heroTrack.style.transition = "transform 520ms ease";
  }

  dots.forEach((d, i) => {
    d.classList.toggle("dot-active", i === index);
  });
}

function nextSlide() {
  const next = (slideIndex + 1) % 3;
  renderSlide(next);
}

function startAuto() {
  stopAuto();
  autoTimer = setInterval(nextSlide, 3000);
}
function stopAuto() {
  if (autoTimer) clearInterval(autoTimer);
  autoTimer = null;
}

dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    renderSlide(i);
    startAuto();
  });
});

startAuto();

/* Touch swipe */
let startX = 0;
let currentX = 0;
let dragging = false;

heroTrack.addEventListener("touchstart", (e) => {
  stopAuto();
  dragging = true;
  startX = e.touches[0].clientX;
  currentX = startX;
}, { passive: true });

heroTrack.addEventListener("touchmove", (e) => {
  if (!dragging) return;
  currentX = e.touches[0].clientX;
}, { passive: true });

heroTrack.addEventListener("touchend", () => {
  if (!dragging) return;
  dragging = false;

  const diff = currentX - startX;
  const threshold = 50;

  if (diff > threshold) {
    // swipe right
    const prev = (slideIndex - 1 + 3) % 3;
    renderSlide(prev);
  } else if (diff < -threshold) {
    // swipe left
    const next = (slideIndex + 1) % 3;
    renderSlide(next);
  }
  startAuto();
});

/* -------------------------
   Fade-in on scroll (reveal)
-------------------------- */
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealEls.forEach((el) => io.observe(el));

/* -------------------------
   Footer accordion
-------------------------- */
const accHeads = document.querySelectorAll(".acc-head");
accHeads.forEach((btn) => {
  btn.addEventListener("click", () => {
    const body = btn.nextElementSibling;
    const isOpen = body.style.display === "block";

    // close others (match clean mobile feel)
    document.querySelectorAll(".acc-body").forEach((b) => (b.style.display = "none"));

    body.style.display = isOpen ? "none" : "block";
  });
});
