// ===== Slider (auto every 3s + swipe) =====
(function () {
  const root = document.querySelector("[data-slider]");
  if (root) {
    const slides = Array.from(root.querySelectorAll(".slide"));
    const dots = Array.from(root.querySelectorAll(".dot"));
    const prev = root.querySelector(".prev");
    const next = root.querySelector(".next");

    let index = 0;
    let timer = null;

    const show = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
      dots.forEach((d, n) => d.classList.toggle("is-active", n === index));
    };

    const start = () => {
      stop();
      timer = setInterval(() => show(index + 1), 3000);
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
    };

    prev?.addEventListener("click", () => { show(index - 1); start(); });
    next?.addEventListener("click", () => { show(index + 1); start(); });

    dots.forEach((d, i) => d.addEventListener("click", () => { show(i); start(); }));

    // Swipe support
    let x0 = null;
    root.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const x1 = e.changedTouches[0].clientX;
      const dx = x1 - x0;
      x0 = null;

      if (Math.abs(dx) > 40) {
        show(dx > 0 ? index - 1 : index + 1);
        start();
      }
    }, { passive: true });

    show(0);
    start();

    // pause while not visible (optional nice touch)
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });
  }
})();

// ===== Fade-in on scroll (like you asked) =====
(function () {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  items.forEach((el) => io.observe(el));
})();

// ===== Footer accordion behavior (same as Hope page) =====
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
