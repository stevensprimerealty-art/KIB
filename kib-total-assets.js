// ===============================
// HELPER
// ===============================
const $ = (id) => document.getElementById(id);

// ===============================
// MENU DRAWER
// ===============================
const drawer = $("drawer");
const backdrop = $("backdrop");
const menuBtn = $("menuBtn");
const closeBtn = $("closeBtn");

function openDrawer() {
  if (!drawer || !menuBtn) return;

  drawer.classList.add("is-open");

  if (backdrop) {
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("is-on"));
  }

  menuBtn.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  if (!drawer || !menuBtn) return;

  drawer.classList.remove("is-open");

  if (backdrop) {
    backdrop.classList.remove("is-on");
    setTimeout(() => {
      backdrop.hidden = true;
    }, 200);
  }

  menuBtn.setAttribute("aria-expanded", "false");
}

function toggleDrawer() {
  if (!drawer) return;
  drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
}

// EVENTS
if (menuBtn) menuBtn.addEventListener("click", toggleDrawer);
if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
if (backdrop) backdrop.addEventListener("click", closeDrawer);

document.querySelectorAll('.drawer-link').forEach(link => {
  link.addEventListener('click', closeDrawer);
});

document.addEventListener('keydown', (e) => {
  if (e.key === "Escape") closeDrawer();
});


// ===============================
// HERO SLIDER (SAFE)
// ===============================
(function () {
  const slider = $("heroSlider");
  const track = $("heroTrack");
  const dotsWrap = $("heroDots");

  if (!slider || !track || !dotsWrap) return;

  const total = track.children.length;
  let index = 0;
  let timer = null;

  function renderDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');

      if (i === index) dot.classList.add('active');

      dot.addEventListener('click', () => {
        goTo(i);
        restart();
      });

      dotsWrap.appendChild(dot);
    }
  }

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    renderDots();
  }

  function next() {
    goTo(index + 1);
  }

  function start() {
    stop();
    timer = setInterval(next, 3000);
  }

  function stop() {
    if (timer) clearInterval(timer);
  }

  function restart() {
    stop();
    start();
  }

  // TOUCH
  let startX = 0, moveX = 0, touching = false;

  slider.addEventListener('touchstart', (e) => {
    touching = true;
    startX = e.touches[0].clientX;
    moveX = startX;
    stop();
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if (!touching) return;
    moveX = e.touches[0].clientX;
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    if (!touching) return;

    const diff = moveX - startX;

    if (diff > 50) goTo(index - 1);
    else if (diff < -50) goTo(index + 1);

    touching = false;
    restart();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  renderDots();
  goTo(0);
  start();
})();


// ===============================
// REVEAL (SAFE)
// ===============================
(function () {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => io.observe(item));
})();


// ===============================
// MILESTONES (FIXED)
// ===============================
(function () {
  const yearEl = $("mileYear");
  const titleEl = $("mileTitle");
  const imgEl = $("mileImg"); // ✅ FIXED
  const prev = document.querySelector('.mile-prev');
  const next = document.querySelector('.mile-next');

  if (!yearEl || !titleEl || !imgEl || !prev || !next) return;

  const milestones = [
    { year: "1990s", title: "Started as Funding Program", image: "milestone-1990.jpg" },
    { year: "2003", title: "Became a registered company", image: "milestone-2003.jpg" },
    { year: "2011", title: "Granted MDI License", image: "milestone-2011.jpg" },
    { year: "2018", title: "Ownership change (Jun’18)", image: "milestone-2018.jpg" },
    { year: "2021", title: "Received Approval as Commercial Bank", image: "milestone-2021.jpg" },
    { year: "2022", title: "Official Launching as Commercial Bank", image: "milestone-2022.jpg" }
  ];

  let current = 0;

  function render() {
    const item = milestones[current];
    yearEl.textContent = item.year;
    titleEl.textContent = item.title;
    imgEl.src = item.image;
  }

  function go(step) {
    current = (current + step + milestones.length) % milestones.length;
    render();
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  render();
})();


// ===============================
// FOOTER ACCORDION
// ===============================
(function () {
  const items = document.querySelectorAll('.kib-acc-item');

  items.forEach((item) => {
    const btn = item.querySelector('.kib-acc-header');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      items.forEach((x) => x.classList.remove('is-open'));

      if (!isOpen) item.classList.add('is-open');
    });
  });
})();


// ===============================
// COUNTER (SAFE)
// ===============================
(function () {
  const section = $("networkCounters");
  if (!section) return;

  const nums = section.querySelectorAll('.network-number');
  let started = false;

  function animateNumber(el, target) {
    const duration = 1600;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      el.textContent = Math.floor(target * eased).toLocaleString();

      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !started) {
        started = true;
        nums.forEach((num) => {
          animateNumber(num, Number(num.dataset.target));
        });
      }
    });
  }, { threshold: 0.35 });

  io.observe(section);
})();
