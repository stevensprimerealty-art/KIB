// Same behavior as money-transfer (drawer + slider + reveal + footer accordion)
importScriptsNotAllowed();

(function () {
  // HEADER DRAWER
  const btn = document.getElementById("menuBtn");
  const drawer = document.getElementById("drawer");
  const close = document.getElementById("menuClose");
  const backdrop = document.getElementById("drawerBackdrop");

  function openDrawer() {
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  btn && btn.addEventListener("click", openDrawer);
  close && close.addEventListener("click", closeDrawer);
  backdrop && backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // HERO SLIDER
  const track = document.getElementById("heroTrack");
  const dotsWrap = document.getElementById("heroDots");
  if (track && dotsWrap) {
    const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
    const total = dots.length;

    let index = 0;
    let timer = null;

    const setActive = (i) => dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
    const goTo = (i) => {
      index = (i + total) % total;
      track.style.transform = `translateX(-${index * 100}%)`;
      setActive(index);
    };

    const start = () => { stop(); timer = setInterval(() => goTo(index + 1), 3000); };
    const stop = () => { if (timer) clearInterval(timer); timer = null; };

    dots.forEach((dot, i) => dot.addEventListener("click", () => { goTo(i); start(); }));

    let startX = 0, deltaX = 0, down = false;
    track.addEventListener("touchstart", (e) => { down = true; startX = e.touches[0].clientX; deltaX = 0; stop(); }, { passive: true });
    track.addEventListener("touchmove", (e) => { if (!down) return; deltaX = e.touches[0].clientX - startX; }, { passive: true });
    track.addEventListener("touchend", () => {
      if (!down) return;
      down = false;
      if (Math.abs(deltaX) > 40) (deltaX < 0) ? goTo(index + 1) : goTo(index - 1);
      start();
    });

    goTo(0); start();
  }

  // REVEAL ON SCROLL
  const els = document.querySelectorAll(".reveal");
  if (els.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
    }, { threshold: 0.15 });
    els.forEach((el) => io.observe(el));
  }

  // FOOTER ACCORDION (matches your CSS)
  const items = document.querySelectorAll(".kib-acc-item");
  if (items.length) {
    const closeAll = (except) => {
      items.forEach((item) => {
        if (item === except) return;
        item.classList.remove("is-open");
        const b = item.querySelector(".kib-acc-header");
        const body = item.querySelector(".kib-acc-body");
        b && b.setAttribute("aria-expanded", "false");
        body && (body.style.maxHeight = "0px");
      });
    };

    items.forEach((item) => {
      const b = item.querySelector(".kib-acc-header");
      const body = item.querySelector(".kib-acc-body");
      if (!b || !body) return;

      if (item.classList.contains("is-open")) {
        b.setAttribute("aria-expanded", "true");
        body.style.maxHeight = body.scrollHeight + "px";
      } else {
        b.setAttribute("aria-expanded", "false");
        body.style.maxHeight = "0px";
      }

      b.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");
        closeAll(item);

        if (isOpen) {
          item.classList.remove("is-open");
          b.setAttribute("aria-expanded", "false");
          body.style.maxHeight = "0px";
        } else {
          item.classList.add("is-open");
          b.setAttribute("aria-expanded", "true");
          body.style.maxHeight = body.scrollHeight + "px";
        }
      });
    });
  }
})();

// NOTE: remove this line if your environment does not support it.
// This line is only here to prevent "importScripts" confusion in some bundlers.
function importScriptsNotAllowed(){}
