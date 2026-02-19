/* ===== HERO SLIDER: auto every 3s + swipe ===== */
(function () {
  const track = document.getElementById("heroTrack");
  const dotsWrap = document.getElementById("heroDots");
  const slider = document.getElementById("heroSlider");
  if (!track || !dotsWrap || !slider) return;

  const slides = Array.from(track.children);
  const total = slides.length;
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

  function render() {
    track.style.transform = `translateX(${-index * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  }

  function go(i, userAction) {
    index = (i + total) % total;
    render();
    if (userAction) restart();
  }

  function next() {
    go(index + 1, false);
  }

  function start() {
    stop();
    timer = setInterval(next, 3000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    start();
  }

  // touch swipe
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  slider.addEventListener("touchstart", (e) => {
    if (!e.touches[0]) return;
    dragging = true;
    startX = e.touches[0].clientX;
    currentX = startX;
    stop();
  }, { passive: true });

  slider.addEventListener("touchmove", (e) => {
    if (!dragging || !e.touches[0]) return;
    currentX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", () => {
    if (!dragging) return;
    const diff = currentX - startX;
    dragging = false;

    if (Math.abs(diff) > 40) {
      if (diff < 0) go(index + 1, true);
      else go(index - 1, true);
    } else {
      restart();
    }
  });

  // pause on hover (desktop)
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  render();
  start();
})();

/* ===== REVEAL ON SCROLL (fade in) ===== */
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || !els.length) {
    els.forEach(el => el.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((ent) => {
      if (ent.isIntersecting) {
        ent.target.classList.add("in-view");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();

/* ===== FOOTER ACCORDION ===== */
(function () {
  document.querySelectorAll(".acc-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.parentElement.querySelector(".acc-panel");
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!isOpen));
      panel.hidden = isOpen;
    });
  });
})();
