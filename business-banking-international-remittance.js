/* ===============================
   HEADER DRAWER
================================= */
(() => {
  const menuBtn = document.getElementById("menuBtn");
  const drawer = document.getElementById("drawer");
  const menuClose = document.getElementById("menuClose");
  const backdrop = document.getElementById("drawerBackdrop");

  function openDrawer(){
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    menuBtn?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeDrawer(){
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    menuBtn?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", () => {
    const isOpen = drawer.classList.contains("is-open");
    isOpen ? closeDrawer() : openDrawer();
  });

  menuClose?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if(e.key === "Escape") closeDrawer();
  });
})();

/* ===============================
   HERO SLIDER (3s auto + swipe)
================================= */
(() => {
  const track = document.getElementById("heroTrack");
  const dotsWrap = document.getElementById("heroDots");
  if(!track || !dotsWrap) return;

  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  const slidesCount = dots.length;
  let index = 0;
  let timer = null;

  function setActiveDot(i){
    dots.forEach((d, di) => d.classList.toggle("is-active", di === i));
  }

  function goTo(i){
    index = (i + slidesCount) % slidesCount;
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot(index);
  }

  function start(){
    stop();
    timer = setInterval(() => goTo(index + 1), 3000);
  }

  function stop(){
    if(timer) clearInterval(timer);
    timer = null;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      start();
    });
  });

  // Touch swipe
  let startX = 0;
  let dx = 0;
  let dragging = false;

  track.addEventListener("touchstart", (e) => {
    if(!e.touches?.length) return;
    stop();
    dragging = true;
    startX = e.touches[0].clientX;
    dx = 0;
  }, { passive:true });

  track.addEventListener("touchmove", (e) => {
    if(!dragging || !e.touches?.length) return;
    dx = e.touches[0].clientX - startX;
  }, { passive:true });

  track.addEventListener("touchend", () => {
    if(!dragging) return;
    dragging = false;

    if(Math.abs(dx) > 45){
      goTo(index + (dx < 0 ? 1 : -1));
    }
    start();
  });

  goTo(0);
  start();
})();

/* ===============================
   REVEAL ON SCROLL (fade-in)
================================= */
(() => {
  const els = document.querySelectorAll(".reveal");
  if(!("IntersectionObserver" in window)){
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();

/* ===============================
   FOOTER ACCORDION
================================= */
(() => {
  const accButtons = document.querySelectorAll(".kib-footer .kib-acc");
  accButtons.forEach((btn) => {
    const panel = btn.nextElementSibling;
    if(!panel || !panel.classList.contains("kib-acc__panel")) return;

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";

      // close all
      accButtons.forEach((b) => {
        const p = b.nextElementSibling;
        b.setAttribute("aria-expanded", "false");
        if(p?.classList?.contains("kib-acc__panel")) p.classList.remove("is-open");
      });

      // open clicked if it was closed
      if(!isOpen){
        btn.setAttribute("aria-expanded", "true");
        panel.classList.add("is-open");
      }
    });
  });
})();
