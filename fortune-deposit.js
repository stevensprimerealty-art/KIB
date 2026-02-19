// ===== Hero slider (auto every 3s + swipe) =====
(() => {
  const slider = document.getElementById("heroSlider");
  const track  = document.getElementById("heroTrack");
  const dotsEl = document.getElementById("heroDots");
  if (!slider || !track || !dotsEl) return;

  const slides = Array.from(track.children);
  let index = 0;
  let timer = null;
  let x0 = null;

  // build dots
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsEl.appendChild(b);
    return b;
  });

  const setActiveDot = () => {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
  };

  const go = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot();
  };

  const start = () => {
    stop();
    timer = setInterval(() => go(index + 1), 3000);
  };

  const stop = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  // swipe
  slider.addEventListener("touchstart", (e) => {
    x0 = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const x1 = e.changedTouches[0].clientX;
    const dx = x1 - x0;
    x0 = null;

    if (Math.abs(dx) > 40) {
      go(dx > 0 ? index - 1 : index + 1);
      start();
    }
  }, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  go(0);
  start();
})();

// ===== Fade-in on scroll =====
(() => {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add("is-visible");
    });
  }, { threshold: 0.12 });

  items.forEach((el) => io.observe(el));
})();

// ===== Footer accordion (same behavior as Hope page) =====
(() => {
  const btns = document.querySelectorAll(".acc-btn");
  btns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.parentElement.querySelector(".acc-panel");
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      btn.setAttribute("aria-expanded", String(!isOpen));
      if (!panel) return;

      panel.hidden = isOpen;
    });
  });
})();
