/* =========================
   HERO SLIDER (3 slides)
   - auto every 3 seconds
   - touch swipe
   - fade transition
========================= */

(function(){
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  const dots = Array.from(slider.querySelectorAll(".dot"));

  let index = 0;
  let timer = null;

  function setActive(i){
    index = (i + slides.length) % slides.length;
    slides.forEach((s, n) => s.classList.toggle("is-active", n === index));
    dots.forEach((d, n) => d.classList.toggle("is-active", n === index));
  }

  function start(){
    stop();
    timer = setInterval(() => setActive(index + 1), 3000);
  }
  function stop(){
    if (timer) clearInterval(timer);
    timer = null;
  }

  // Touch swipe
  let startX = 0;
  let moved = false;

  slider.addEventListener("touchstart", (e) => {
    stop();
    moved = false;
    startX = e.touches[0].clientX;
  }, {passive:true});

  slider.addEventListener("touchmove", (e) => {
    moved = true;
  }, {passive:true});

  slider.addEventListener("touchend", (e) => {
    const endX = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0].clientX : startX;
    const diff = endX - startX;

    // swipe threshold
    if (moved && Math.abs(diff) > 40){
      if (diff < 0) setActive(index + 1);
      else setActive(index - 1);
    }
    start();
  });

  // Pause when not visible
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  setActive(0);
  start();
})();

/* =========================
   REVEAL ON SCROLL (fade in)
========================= */
(function(){
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();
