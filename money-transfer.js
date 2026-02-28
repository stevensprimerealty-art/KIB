/* ===============================
   HEADER DRAWER
=================================*/
(function () {
  const btn = document.getElementById("menuBtn");
  const drawer = document.getElementById("drawer");
  const close = document.getElementById("menuClose");
  const backdrop = document.getElementById("drawerBackdrop");

  if (!btn || !drawer) return;

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

  btn.addEventListener("click", openDrawer);
  close && close.addEventListener("click", closeDrawer);
  backdrop && backdrop.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });
})();

/* ===============================
   HERO SLIDER (auto 3s + touch)
=================================*/
(function () {
  const track = document.getElementById("heroTrack");
  const dotsWrap = document.getElementById("heroDots");
  if (!track || !dotsWrap) return;

  const dots = Array.from(dotsWrap.querySelectorAll(".dot"));
  const total = dots.length;

  let index = 0;
  let timer = null;

  function setActiveDot(i) {
    dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
  }

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot(index);
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(index + 1), 3000);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      goTo(i);
      start();
    });
  });

  // touch swipe
  let startX = 0;
  let deltaX = 0;
  let isDown = false;

  track.addEventListener("touchstart", (e) => {
    isDown = true;
    startX = e.touches[0].clientX;
    deltaX = 0;
    stop();
  }, { passive: true });

  track.addEventListener("touchmove", (e) => {
    if (!isDown) return;
    deltaX = e.touches[0].clientX - startX;
  }, { passive: true });

  track.addEventListener("touchend", () => {
    if (!isDown) return;
    isDown = false;

    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) goTo(index + 1);
      else goTo(index - 1);
    }
    start();
  });

  goTo(0);
  start();
})();

/* ===============================
   REVEAL ON SCROLL
=================================*/
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 }
  );

  els.forEach((el) => io.observe(el));
})();

/* ===============================
   FOOTER ACCORDION (matches your CSS)
=================================*/
(function () {
  const items = document.querySelectorAll(".kib-acc-item");
  if (!items.length) return;

  function closeAll(except) {
    items.forEach((item) => {
      if (item === except) return;
      item.classList.remove("is-open");
      const btn = item.querySelector(".kib-acc-header");
      const body = item.querySelector(".kib-acc-body");
      if (btn) btn.setAttribute("aria-expanded", "false");
      if (body) body.style.maxHeight = "0px";
    });
  }

  items.forEach((item) => {
    const btn = item.querySelector(".kib-acc-header");
    const body = item.querySelector(".kib-acc-body");
    if (!btn || !body) return;

    // init height if open
    if (item.classList.contains("is-open")) {
      btn.setAttribute("aria-expanded", "true");
      body.style.maxHeight = body.scrollHeight + "px";
    } else {
      btn.setAttribute("aria-expanded", "false");
      body.style.maxHeight = "0px";
    }

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      closeAll(item);

      if (isOpen) {
        item.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
        body.style.maxHeight = "0px";
      } else {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });
})();
