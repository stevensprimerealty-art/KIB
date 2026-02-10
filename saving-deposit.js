// ===== Fade-in on scroll =====
(function () {
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.12 }
  );

  els.forEach((el) => io.observe(el));
})();

// ===== Footer accordion behavior =====
(function () {
  const items = document.querySelectorAll(".acc-item");
  if (!items.length) return;

  items.forEach((item) => {
    const btn = item.querySelector(".acc-btn");
    const panel = item.querySelector(".acc-panel");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // close all
      items.forEach((it) => {
        const b = it.querySelector(".acc-btn");
        const p = it.querySelector(".acc-panel");
        if (!b || !p) return;
        b.setAttribute("aria-expanded", "false");
        p.hidden = true;
      });

      // open this if it was closed
      if (!isOpen) {
        btn.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });
})();

// ===== Hero slider (auto 3s + swipe) =====
(function () {
  const track = document.getElementById("heroTrack");
  const slider = document.getElementById("heroSlider");
  const dotsWrap = document.getElementById("heroDots");
  if (!track || !slider || !dotsWrap) return;

  const slides = Array.from(track.children);
  let index = 0;
  let timer = null;

  // build dots
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => go(i, true));
    dotsWrap.appendChild(b);
    return b;
  });

  function updateDots() {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function go(i, userAction = false) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    updateDots();
    if (userAction) restart();
  }

  function start() {
    stop();
    timer = setInterval(() => go(index + 1), 3000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    start();
  }

  // swipe support
  let startX = 0;
  let dx = 0;
  let isDown = false;

  slider.addEventListener(
    "touchstart",
    (e) => {
      isDown = true;
      startX = e.touches[0].clientX;
      dx = 0;
      stop();
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchmove",
    (e) => {
      if (!isDown) return;
      dx = e.touches[0].clientX - startX;
    },
    { passive: true }
  );

  slider.addEventListener("touchend", () => {
    if (!isDown) return;
    isDown = false;

    const threshold = 50;
    if (dx > threshold) go(index - 1, true);
    else if (dx < -threshold) go(index + 1, true);
    else restart();
  });

  // init
  go(0);
  start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });
})();
