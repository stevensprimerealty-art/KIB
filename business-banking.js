/* =========================
   HERO SLIDER (auto 3s + swipe)
========================= */
(function heroSlider(){
  const slider = document.querySelector('[data-slider]');
  if(!slider) return;

  const track = slider.querySelector('[data-track]');
  const slides = Array.from(slider.querySelectorAll('[data-slide]'));
  const dotsWrap = slider.querySelector('[data-dots]');

  let index = 0;
  let timer = null;

  // Create dots
  const dots = slides.map((_, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hero-dot' + (i === 0 ? ' is-active' : '');
    b.setAttribute('aria-label', `Go to slide ${i + 1}`);
    b.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(b);
    return b;
  });

  function setActiveDot(i){
    dots.forEach((d, idx) => d.classList.toggle('is-active', idx === i));
  }

  function goTo(i, userAction=false){
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot(index);
    if(userAction) restart();
  }

  function next(){ goTo(index + 1); }

  function start(){
    stop();
    timer = setInterval(next, 3000);
  }
  function stop(){
    if(timer) clearInterval(timer);
    timer = null;
  }
  function restart(){ start(); }

  // Swipe support
  let startX = 0;
  let currentX = 0;
  let dragging = false;

  function onTouchStart(e){
    dragging = true;
    stop();
    startX = (e.touches ? e.touches[0].clientX : e.clientX);
    currentX = startX;
  }
  function onTouchMove(e){
    if(!dragging) return;
    currentX = (e.touches ? e.touches[0].clientX : e.clientX);
  }
  function onTouchEnd(){
    if(!dragging) return;
    dragging = false;

    const dx = currentX - startX;
    const threshold = 40;

    if(dx > threshold) goTo(index - 1, true);
    else if(dx < -threshold) goTo(index + 1, true);
    else restart();
  }

  slider.addEventListener('touchstart', onTouchStart, {passive:true});
  slider.addEventListener('touchmove', onTouchMove, {passive:true});
  slider.addEventListener('touchend', onTouchEnd);

  // Mouse drag (optional)
  slider.addEventListener('mousedown', onTouchStart);
  window.addEventListener('mousemove', onTouchMove);
  window.addEventListener('mouseup', onTouchEnd);

  // Pause when user not on tab
  document.addEventListener('visibilitychange', () => {
    if(document.hidden) stop();
    else start();
  });

  start();
})();

/* =========================
   FADE-IN ON SCROLL
========================= */
(function revealOnScroll(){
  const items = document.querySelectorAll('.reveal');
  if(!items.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
})();
