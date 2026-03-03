/* ============================
   HERO SLIDER (auto 3s + swipe)
============================ */
(function initSlider(){
  const slider = document.querySelector('[data-slider]');
  if(!slider) return;

  const slides = Array.from(slider.querySelectorAll('.slide'));
  const prevBtn = slider.querySelector('.slider-btn.prev');
  const nextBtn = slider.querySelector('.slider-btn.next');
  const dotsWrap = slider.querySelector('.slider-dots');

  let index = 0;
  let timer = null;

  // Build dots
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(b);
    return b;
  });

  function render(){
    slides.forEach((s, i) => s.classList.toggle('is-active', i === index));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));
  }

  function goTo(i, userAction=false){
    index = (i + slides.length) % slides.length;
    render();
    if(userAction) restart();
  }

  function next(userAction=false){ goTo(index + 1, userAction); }
  function prev(userAction=false){ goTo(index - 1, userAction); }

  function start(){
    stop();
    timer = setInterval(() => next(false), 3000); // 3 seconds
  }
  function stop(){
    if(timer) clearInterval(timer);
    timer = null;
  }
  function restart(){
    start();
  }

  nextBtn?.addEventListener('click', () => next(true));
  prevBtn?.addEventListener('click', () => prev(true));

  // Touch swipe
  let startX = 0;
  let startY = 0;
  let isDown = false;

  slider.addEventListener('touchstart', (e) => {
    const t = e.touches[0];
    startX = t.clientX;
    startY = t.clientY;
    isDown = true;
    stop();
  }, { passive: true });

  slider.addEventListener('touchmove', (e) => {
    if(!isDown) return;
    const t = e.touches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;

    // ignore if user is scrolling vertically
    if(Math.abs(dy) > Math.abs(dx)) return;

    // swipe threshold
    if(dx > 40){
      isDown = false;
      prev(true);
    } else if(dx < -40){
      isDown = false;
      next(true);
    }
  }, { passive: true });

  slider.addEventListener('touchend', () => {
    isDown = false;
    start();
  });

  // Pause on hover (desktop)
  slider.addEventListener('mouseenter', stop);
  slider.addEventListener('mouseleave', start);

  render();
  start();
})();

/* ============================
   FADE-IN ON SCROLL
============================ */
(function initReveal(){
  const els = document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){
    els.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => obs.observe(el));
})();
