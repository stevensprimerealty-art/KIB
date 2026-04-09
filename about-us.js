// HERO SLIDER
(function () {
  const slider = document.getElementById('heroSlider');
  const track = document.getElementById('heroTrack');
  const dotsWrap = document.getElementById('heroDots');
  if (!slider || !track) return;

  const total = track.children.length;
  let index = 0;
  let timer = null;
  let startX = 0;
  let moveX = 0;
  let touching = false;

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
    timer = setInterval(next, 3000);
  }

  function stop() {
    clearInterval(timer);
  }

  function restart() {
    stop();
    start();
  }

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

  renderDots();
  goTo(0);
  start();
})();

// REVEAL ON SCROLL
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach((item) => io.observe(item));
})();

// MILESTONES SLIDER
(function () {
  const milestones = [
    {
      year: "1990s",
      title: "Started as Funding Program",
      image: "milestone-1990.jpg"
    },
    {
      year: "2003",
      title: "Became a registered company",
      image: "milestone-2003.jpg"
    },
    {
      year: "2011",
      title: "Granted MDI License",
      image: "milestone-2011.jpg"
    },
    {
      year: "2018",
      title: "Ownership change (Jun’18) to KIB Korea International Banking",
      image: "milestone-2018.jpg"
    },
    {
      year: "2021",
      title: "Received Approval as Commercial Bank",
      image: "milestone-2021.jpg"
    },
    {
      year: "2022",
      title: "Official Launching as Commercial Bank",
      image: "milestone-2022.jpg"
    }
  ];

  const yearEl = document.getElementById('mileYear');
  const titleEl = document.getElementById('mileTitle');
  const imgEl = document.getElementById('mileImgTag');
  const imgWrap = document.getElementById('mileImage');
  const prev = document.querySelector('.mile-prev');
  const next = document.querySelector('.mile-next');

  if (!yearEl || !titleEl || !imgEl || !imgWrap || !prev || !next) return;

  let current = 0;
  let startX = 0;
  let moveX = 0;
  let isTouching = false;

  function renderMilestone() {
    const item = milestones[current];
    yearEl.textContent = item.year;
    titleEl.textContent = item.title;
    imgWrap.dataset.file = item.image;
    imgWrap.classList.remove('is-empty');
    imgEl.style.display = '';
    imgEl.src = item.image;
  }

  function go(step) {
    current = (current + step + milestones.length) % milestones.length;
    renderMilestone();
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  imgWrap.addEventListener('touchstart', (e) => {
    isTouching = true;
    startX = e.touches[0].clientX;
    moveX = startX;
  }, { passive: true });

  imgWrap.addEventListener('touchmove', (e) => {
    if (!isTouching) return;
    moveX = e.touches[0].clientX;
  }, { passive: true });

  imgWrap.addEventListener('touchend', () => {
    if (!isTouching) return;
    const diff = moveX - startX;
    if (diff > 50) go(-1);
    else if (diff < -50) go(1);
    isTouching = false;
  });

  renderMilestone();
})();

// FOOTER ACCORDION
(function () {
  const items = document.querySelectorAll('.kib-acc-item');
  items.forEach((item) => {
    const btn = item.querySelector('.kib-acc-header');
    btn.addEventListener('click', () => {
      if (item.classList.contains('is-open')) {
        item.classList.remove('is-open');
      } else {
        items.forEach((x) => x.classList.remove('is-open'));
        item.classList.add('is-open');
      }
    });
  });
})();

// COUNTER ANIMATION
(function () {
  const section = document.getElementById('networkCounters');
  if (!section) return;

  const nums = section.querySelectorAll('.network-number');
  let started = false;

  function animateNumber(el, target) {
    const duration = 1600;
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.floor(start + (target - start) * eased);
      el.textContent = value.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(step);
      }
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

// MENU PLACEHOLDER
document.getElementById('menuBtn')?.addEventListener('click', function () {
  alert('Connect this button to your existing main menu drawer.');
});
