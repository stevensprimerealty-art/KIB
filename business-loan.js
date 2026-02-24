/* ===== HERO SLIDER: auto 3s + touch swipe ===== */
(function () {
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll(".dot"));
  let idx = 0;
  let timer = null;

  function setActive(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-active", k === idx));
    dots.forEach((d, k) => d.classList.toggle("is-on", k === idx));
  }

  function start() {
    stop();
    timer = setInterval(() => setActive(idx + 1), 3000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // touch swipe
  let startX = 0;
  let isDown = false;

  slider.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].clientX;
    stop();
  }, { passive: true });

  slider.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    // do nothing; just tracking
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    if (!isDown) return;
    isDown = false;
    const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
    const diff = endX - startX;

    if (Math.abs(diff) > 40) {
      if (diff < 0) setActive(idx + 1);
      else setActive(idx - 1);
    }
    start();
  });

  // click dots (optional)
  dots.forEach((d, i) => d.addEventListener("click", () => { setActive(i); start(); }));

  setActive(0);
  start();
})();

/* ===== Scroll Fade-In ===== */
(function () {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();
