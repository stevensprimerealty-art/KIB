// ===============================
// KIB — script.js (FULL CORRECT)
// ===============================

// -------- INTRO → MAIN TRANSITION + HERO FADE-IN --------
const intro = document.getElementById("intro");
const app = document.getElementById("app");

window.addEventListener("load", () => {
  if (intro) intro.classList.add("is-in");

  // After 3 seconds: hide intro, show app, then trigger hero fade-in
  setTimeout(() => {
    if (intro) intro.style.display = "none";

    if (app) {
      app.hidden = false;

      requestAnimationFrame(() => {
        app.classList.add("is-in");

        // Trigger hero fade-in animations (CSS listens to .hero.is-in)
        const hero = document.querySelector(".hero");
        if (hero) hero.classList.add("is-in");

        // Start scroll reveal after app is visible
        initScrollReveal();
      });
    }
  }, 3000);
});

// -------- MENU DRAWER (swift + backdrop fade) --------
const drawer = document.getElementById("drawer");
const backdrop = document.getElementById("backdrop");
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");

function openDrawer() {
  if (!drawer || !backdrop || !menuBtn) return;
  drawer.classList.add("is-open");

  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("is-on"));

  drawer.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  if (!drawer || !backdrop || !menuBtn) return;
  drawer.classList.remove("is-open");
  backdrop.classList.remove("is-on");

  drawer.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");

  // allow fade-out to finish, then hide
  setTimeout(() => {
    if (backdrop) backdrop.hidden = true;
  }, 220);
}

if (menuBtn) menuBtn.addEventListener("click", openDrawer);
if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
if (backdrop) backdrop.addEventListener("click", closeDrawer);

// Close menu on Escape key (nice UX)
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// -------- ABOUT US accordion --------
document.querySelectorAll("[data-accordion]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-accordion");
    const panel = document.querySelector(`[data-panel="${key}"]`);
    if (panel) panel.hidden = !panel.hidden;
  });
});

// -------- Scroll down button --------
const scrollBtn = document.querySelector(".scroll-down");
if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  });
}

// -------- LANGUAGE SWITCH (includes main headline + 5 cards) --------
const t = {
  en: {
    brandTitle: "KOREA INTERNATIONAL BANKING",
    brandSub: "(KIB)",
    heroHeadline: "KOREA INTERNATIONAL BANKING",
    introTitle: "KOREA INTERNATIONAL BANKING",

    navAbout: "About Us",
    navAboutStory: "Our Story",
    navAboutMission: "Mission",
    navServices: "Services",
    navMedia: "Media",
    navOverview: "Overview",

    mainHeadline: "Creating useful\nfinancial services for your everyday life",

    s1Kicker: "AI Finance",
    s1Title: "Let me simplify your banking",
    s1Text: "Smart insights, secure access, fast transfers.",

    s2Kicker: "Security",
    s2Title: "Protected by modern security",
    s2Text: "Safer sessions and advanced monitoring.",

    s3Kicker: "International",
    s3Title: "Cross-border made simple",
    s3Text: "Multi-currency tools for daily life.",

    s4Kicker: "Support",
    s4Title: "Help when you need it",
    s4Text: "Quick answers and guided steps.",

    s5Kicker: "Insights",
    s5Title: "Track your progress clearly",
    s5Text: "Clean summaries you can trust.",
  },

  ko: {
    brandTitle: "한국 국제 은행",
    brandSub: "(KIB)",
    heroHeadline: "한국 국제 은행",
    introTitle: "한국 국제 은행",

    navAbout: "회사 소개",
    navAboutStory: "우리 이야기",
    navAboutMission: "미션",
    navServices: "서비스",
    navMedia: "미디어",
    navOverview: "개요",

    mainHeadline: "일상에 도움이 되는\n금융 서비스를 만듭니다",

    s1Kicker: "AI 금융",
    s1Title: "은행 업무를 더 쉽게",
    s1Text: "스마트 인사이트, 안전한 접속, 빠른 송금.",

    s2Kicker: "보안",
    s2Title: "현대적 보안으로 보호",
    s2Text: "더 안전한 세션과 고급 모니터링.",

    s3Kicker: "국제",
    s3Title: "해외 금융을 간편하게",
    s3Text: "일상을 위한 다중 통화 도구.",

    s4Kicker: "지원",
    s4Title: "필요할 때 바로 도움",
    s4Text: "빠른 답변과 단계별 가이드.",

    s5Kicker: "인사이트",
    s5Title: "진행 상황을 명확하게",
    s5Text: "신뢰할 수 있는 깔끔한 요약.",
  },

  es: {
    brandTitle: "BANCA INTERNACIONAL DE COREA",
    brandSub: "(KIB)",
    heroHeadline: "BANCA INTERNACIONAL DE COREA",
    introTitle: "BANCA INTERNACIONAL DE COREA",

    navAbout: "Sobre nosotros",
    navAboutStory: "Nuestra historia",
    navAboutMission: "Misión",
    navServices: "Servicios",
    navMedia: "Medios",
    navOverview: "Resumen",

    mainHeadline: "Creando servicios financieros útiles\npara tu vida diaria",

    s1Kicker: "Finanzas IA",
    s1Title: "Hagamos tu banca más simple",
    s1Text: "Insights inteligentes, acceso seguro, transferencias rápidas.",

    s2Kicker: "Seguridad",
    s2Title: "Protegido con seguridad moderna",
    s2Text: "Sesiones más seguras y monitoreo avanzado.",

    s3Kicker: "Internacional",
    s3Title: "Transacciones globales sin complicaciones",
    s3Text: "Herramientas multimoneda para el día a día.",

    s4Kicker: "Soporte",
    s4Title: "Ayuda cuando la necesitas",
    s4Text: "Respuestas rápidas y guía paso a paso.",

    s5Kicker: "Insights",
    s5Title: "Sigue tu progreso con claridad",
    s5Text: "Resúmenes limpios en los que puedes confiar.",
  }
};

function setLanguage(lang) {
  const dict = t[lang] || t.en;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (!el || value == null) return;

    // allow \n to become line breaks for headings
    if (typeof value === "string" && value.includes("\n")) {
      el.innerHTML = value.replaceAll("\n", "<br>");
    } else {
      el.textContent = value;
    }
  };

  setText("brandTitle", dict.brandTitle);
  setText("brandSub", dict.brandSub);
  setText("heroHeadline", dict.heroHeadline);
  setText("introTitle", dict.introTitle);

  setText("navAbout", dict.navAbout);
  setText("navAboutStory", dict.navAboutStory);
  setText("navAboutMission", dict.navAboutMission);
  setText("navServices", dict.navServices);
  setText("navMedia", dict.navMedia);
  setText("navOverview", dict.navOverview);

  setText("mainHeadline", dict.mainHeadline);

  setText("s1Kicker", dict.s1Kicker);
  setText("s1Title", dict.s1Title);
  setText("s1Text", dict.s1Text);

  setText("s2Kicker", dict.s2Kicker);
  setText("s2Title", dict.s2Title);
  setText("s2Text", dict.s2Text);

  setText("s3Kicker", dict.s3Kicker);
  setText("s3Title", dict.s3Title);
  setText("s3Text", dict.s3Text);

  setText("s4Kicker", dict.s4Kicker);
  setText("s4Title", dict.s4Title);
  setText("s4Text", dict.s4Text);

  setText("s5Kicker", dict.s5Kicker);
  setText("s5Title", dict.s5Title);
  setText("s5Text", dict.s5Text);

  // button UI
  document.querySelectorAll(".lang-btn").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.lang === lang);
  });

  // set <html lang="">
  document.documentElement.lang = lang;

  // close menu when language is changed (nice UX)
  closeDrawer();
}

document.querySelectorAll(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

// Default language
setLanguage("en");

// -------- SCROLL REVEAL (fade in while scrolling) --------
let _io = null;

function initScrollReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!revealEls.length) return;

  if (_io) _io.disconnect();

  _io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-visible");
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => _io.observe(el));
}

// -------- SLIDER (auto every 3s + swipe + dots) --------
const track = document.getElementById("sliderTrack");
const viewport = document.getElementById("sliderViewport");
const dotsWrap = document.getElementById("dots");

if (track && viewport && dotsWrap) {
  const slides = Array.from(track.children);
  let index = 0;
  let timer = null;

  // build dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(b);
  });

  function setDots(i) {
    dotsWrap.querySelectorAll(".dot").forEach((d, di) => {
      d.classList.toggle("is-active", di === i);
    });
  }

  function slideStep() {
    const first = slides[0];
    if (!first) return 0;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.gap || "0");
    return first.getBoundingClientRect().width + gap;
  }

  function goTo(i, user = false) {
    index = (i + slides.length) % slides.length;
    const x = slideStep() * index;
    track.style.transform = `translateX(${-x}px)`;
    setDots(index);
    if (user) restart();
  }

  function next() { goTo(index + 1); }

  function start() {
    stop();
    timer = setInterval(next, 3000);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() { start(); }

  // Auto start
  start();

  // Pause while touching/hovering
  viewport.addEventListener("touchstart", stop, { passive: true });
  viewport.addEventListener("touchend", restart, { passive: true });
  viewport.addEventListener("mouseenter", stop);
  viewport.addEventListener("mouseleave", restart);

  // Swipe support (pointer)
  let startX = 0;
  let dx = 0;
  let isDown = false;

  viewport.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
    dx = 0;
    track.style.transition = "none";
    stop();
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    dx = e.clientX - startX;
    const x = (slideStep() * index) - dx;
    track.style.transform = `translateX(${-x}px)`;
  });

  function endSwipe() {
    if (!isDown) return;
    isDown = false;
    track.style.transition = "transform .35s ease";

    const threshold = Math.min(70, slideStep() * 0.18);
    if (dx > threshold) goTo(index - 1, true);
    else if (dx < -threshold) goTo(index + 1, true);
    else goTo(index, true);

    restart();
  }

  viewport.addEventListener("pointerup", endSwipe);
  viewport.addEventListener("pointercancel", endSwipe);

  // Fix position on resize
  window.addEventListener("resize", () => goTo(index));
}
