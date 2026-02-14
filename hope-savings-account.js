/* ===== HERO SLIDER (auto 3s + swipe) ===== */
(function () {
  const slider = document.getElementById("heroSlider");
  const track = document.getElementById("heroTrack");
  const dotsWrap = document.getElementById("heroDots");
  if (!slider || !track || !dotsWrap) return;

  const slides = Array.from(track.children);
  let index = 0;
  let timer = null;

  function renderDots() {
    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = i === index ? "is-active" : "";
      b.setAttribute("aria-label", `Go to slide ${i + 1}`);
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    });
  }

  function goTo(i, user = false) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    renderDots();
    if (user) restart();
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(index + 1), 3000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    start();
  }

  // Touch swipe
  let startX = 0;
  let dx = 0;
  let isDown = false;

  slider.addEventListener("touchstart", (e) => {
    stop();
    isDown = true;
    startX = e.touches[0].clientX;
    dx = 0;
  }, { passive: true });

  slider.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    dx = e.touches[0].clientX - startX;
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    if (!isDown) return;
    isDown = false;

    const threshold = 40; // px
    if (dx > threshold) goTo(index - 1);
    else if (dx < -threshold) goTo(index + 1);

    start();
  });

  renderDots();
  goTo(0);
  start();
})();

/* ===== Fade-in on scroll ===== */
(function () {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  els.forEach((el) => io.observe(el));
})();

/* ===== Footer accordion ===== */
(function () {
  const btns = document.querySelectorAll(".acc-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.parentElement.querySelector(".acc-panel");
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  });
})();
