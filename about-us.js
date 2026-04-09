// ===============================
// HERO SLIDER
// ===============================
(function () {
  const slider = document.getElementById('heroSlider');
  const track = document.getElementById('heroTrack');
  const dotsWrap = document.getElementById('heroDots');
  if (!slider || !track) return;

  const total = track.children.length;
  let index = 0;
  let timer;

  function renderDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      if (i === index) dot.classList.add('active');
      dot.onclick = () => goTo(i);
      dotsWrap.appendChild(dot);
    }
  }

  function goTo(i) {
    index = (i + total) % total;
    track.style.transform = `translateX(-${index * 100}%)`;
    renderDots();
  }

  function auto() {
    timer = setInterval(() => goTo(index + 1), 3000);
  }

  slider.addEventListener('mouseenter', () => clearInterval(timer));
  slider.addEventListener('mouseleave', auto);

  renderDots();
  goTo(0);
  auto();
})();


// ===============================
// REVEAL ON SCROLL
// ===============================
(function () {
  const items = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('show');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });

  items.forEach(el => io.observe(el));
})();


// ===============================
// MILESTONES
// ===============================
(function () {
  const milestones = [
    { year:"1990s", title:"Started as Funding Program", image:"milestone-1990.jpg" },
    { year:"2003", title:"Became a registered company", image:"milestone-2003.jpg" },
    { year:"2011", title:"Granted MDI License", image:"milestone-2011.jpg" },
    { year:"2018", title:"Ownership change", image:"milestone-2018.jpg" },
    { year:"2021", title:"Commercial Bank Approval", image:"milestone-2021.jpg" },
    { year:"2022", title:"Official Launch", image:"milestone-2022.jpg" }
  ];

  const year = document.getElementById('mileYear');
  const title = document.getElementById('mileTitle');
  const img = document.getElementById('mileImgTag');

  if (!year || !title || !img) return;

  let i = 0;

  function render() {
    year.textContent = milestones[i].year;
    title.textContent = milestones[i].title;
    img.src = milestones[i].image;
  }

  document.querySelector('.mile-prev')?.onclick = () => {
    i = (i - 1 + milestones.length) % milestones.length;
    render();
  };

  document.querySelector('.mile-next')?.onclick = () => {
    i = (i + 1) % milestones.length;
    render();
  };

  render();
})();


// ===============================
// FOOTER ACCORDION
// ===============================
(function () {
  const items = document.querySelectorAll('.kib-acc-item');

  items.forEach(item => {
    const btn = item.querySelector('.kib-acc-header');
    btn.addEventListener('click', () => {
      items.forEach(x => x.classList.remove('is-open'));
      item.classList.toggle('is-open');
    });
  });
})();


// ===============================
// COUNTER ANIMATION
// ===============================
(function () {
  const section = document.getElementById('networkCounters');
  if (!section) return;

  const nums = section.querySelectorAll('.network-number');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        nums.forEach(el => {
          const target = +el.dataset.target;
          let count = 0;

          const step = () => {
            count += target / 60;
            if (count < target) {
              el.textContent = Math.floor(count);
              requestAnimationFrame(step);
            } else {
              el.textContent = target.toLocaleString();
            }
          };

          step();
        });
        io.disconnect();
      }
    });
  });

  io.observe(section);
})();


// ===============================
// DRAWER MENU (FIXED)
// ===============================
(function () {
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeBtn");
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("backdrop");

  if (!menuBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add("open");
    backdrop.hidden = false;
  }

  function closeDrawer() {
    drawer.classList.remove("open");
    backdrop.hidden = true;
  }

  menuBtn.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
})();


// ===============================
// DRAWER ACCORDION
// ===============================
(function () {
  document.querySelectorAll("[data-accordion]").forEach(btn => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      if (!panel) return;

      const isOpen = panel.style.maxHeight;

      document.querySelectorAll(".drawer-sub").forEach(p => {
        p.style.maxHeight = null;
      });

      if (!isOpen) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
})();
