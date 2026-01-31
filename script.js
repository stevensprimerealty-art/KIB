// ===============================
// KIB — script.js (FULL FINAL)
// ===============================

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function flagEmojiFromISO2(code) {
  if (!code || code.length !== 2) return "🏳️";
  const cc = code.toUpperCase();
  const A = 0x1F1E6;
  const first = cc.charCodeAt(0) - 65 + A;
  const second = cc.charCodeAt(1) - 65 + A;
  return String.fromCodePoint(first, second);
}

async function buildCountries(selectEl) {
  if (!selectEl) return;

  // keep the placeholder (disabled) option, clear others
  selectEl.querySelectorAll("option:not([disabled])").forEach(o => o.remove());

  // 1) Try: REST Countries API (full world list)
  try {
    const res = await fetch("https://restcountries.com/v3.1/all?fields=cca2,name", { cache: "force-cache" });
    if (!res.ok) throw new Error("REST Countries failed");

    const data = await res.json();

    const rows = data
      .filter(c => c.cca2 && c.cca2.length === 2 && c.name?.common)
      .map(c => ({ code: c.cca2.toUpperCase(), name: c.name.common }))
      .sort((a, b) => a.name.localeCompare(b.name));

    rows.forEach(({ code, name }) => {
      const opt = document.createElement("option");
      opt.value = code;
      opt.textContent = `${flagEmojiFromISO2(code)}  ${name}`;
      selectEl.appendChild(opt);
    });

    return;
  } catch (err) {
    // 2) Fallback: Intl list (if supported)
  }

  try {
    const regionCodes =
      (Intl.supportedValuesOf && Intl.supportedValuesOf("region"))
        ? Intl.supportedValuesOf("region")
        : ["KR","US","GB","FR","DE","ES","IT","NG","JP","CN","CA","BR","IN","AE","SA"];

    const dn = new Intl.DisplayNames(["en"], { type: "region" });

    const rows = regionCodes
      .filter(c => typeof c === "string" && c.length === 2)
      .map(code => ({ code, name: dn.of(code) || code }))
      .filter(x => x.name && x.name !== x.code)
      .sort((a, b) => a.name.localeCompare(b.name));

    rows.forEach(({ code, name }) => {
      const opt = document.createElement("option");
      opt.value = code.toUpperCase();
      opt.textContent = `${flagEmojiFromISO2(code)}  ${name}`;
      selectEl.appendChild(opt);
    });
  } catch (e) {
    // last resort: do nothing
  }
}

// ---------- INTRO → MAIN TRANSITION + HERO FADE-IN ----------
const intro = $("intro");
const app = $("app");

window.addEventListener("load", () => {
  if (intro) intro.classList.add("is-in");

  setTimeout(() => {
    if (intro) intro.style.display = "none";

    if (app) {
      app.hidden = false;

      requestAnimationFrame(() => {
        app.classList.add("is-in");

        const hero = document.querySelector(".hero");
        if (hero) hero.classList.add("is-in");

        initScrollReveal();
      });
    }
  }, 3000);
});

// ---------- MENU DRAWER ----------
const drawer = $("drawer");
const backdrop = $("backdrop");
const menuBtn = $("menuBtn");
const closeBtn = $("closeBtn");
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

  setTimeout(() => { if (backdrop) backdrop.hidden = true; }, 200);
}

function toggleDrawer() {
  if (!drawer) return;
  drawer.classList.contains("is-open") ? closeDrawer() : openDrawer();
}

if (menuBtn) menuBtn.addEventListener("click", toggleDrawer);

// ✅ X button ALWAYS works
if (closeBtn) closeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  closeDrawer();
});

if (backdrop) backdrop.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});

// ---------- ABOUT accordion (and aria-expanded) ----------
$$("[data-accordion]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-accordion");
    const panel = document.querySelector(`[data-panel="${key}"]`);
    if (!panel) return;

    const willOpen = panel.hidden === true;
    panel.hidden = !willOpen;
    btn.setAttribute("aria-expanded", String(willOpen));
  });
});

// ---------- Scroll down button (scroll to content) ----------
const scrollBtn = $("scrollDownBtn") || document.querySelector(".scroll-down");
scrollBtn?.addEventListener("click", () => {
  const target = $("mainContent") || document.querySelector(".content");
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  else window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
});

// ---------- LANGUAGE SWITCH (FULL PAGE) ----------
const translations = {
  en: {
    brandTitle: "KOREA INTERNATIONAL BANKING",
    brandSub: "(KIB)",
    heroHeadline: "KOREA INTERNATIONAL BANKING",
    heroSub: "A clean digital banking experience with secure systems and international services.",
    introTitle: "KOREA INTERNATIONAL BANKING",

    mainHeadline: "Creating useful\nfinancial services for your everyday life",

    navAbout: "About Us",
    navAboutStory: "Our Story",
    navAboutMission: "Mission",
    navServices: "Services",
    navMedia: "Media",
    navOverview: "Overview",

    // Slider cards
    s1Kicker: "Payments",
    s1Title: "Card payments made simple",
    s1Text: "Clean receipts, tracking, and secure usage.",

    s2Kicker: "Digital Banking",
    s2Title: "A global leader in digital banking",
    s2Text: "Mobile payments, biometrics, real-time transfers.",

    s3Kicker: "Groups",
    s3Title: "Group accounts & monthly plans",
    s3Text: "Organize contributions and manage together.",

    s4Kicker: "Support",
    s4Title: "Ask about international banking",
    s4Text: "Quick help with a clean chat-style UI.",

    s5Kicker: "Loans",
    s5Title: "Loan overview made clear",
    s5Text: "Transparent limits and planning previews.",

    // Optional showcase (if you kept it)
    showcaseTitle: "Banking Highlights",
    cap1: "Payments & receipts",
    cap2: "Compliance & security",
    cap3: "Group accounts",
    cap4: "Support chat",
    cap5: "Loans overview",
  },

  ko: {
    brandTitle: "한국 국제 은행",
    brandSub: "(KIB)",
    heroHeadline: "한국 국제 은행",
    heroSub: "안전한 시스템과 국제 서비스를 갖춘 깔끔한 디지털 뱅킹 경험.",
    introTitle: "한국 국제 은행",

    mainHeadline: "일상에 도움이 되는\n금융 서비스를 만듭니다",

    navAbout: "회사 소개",
    navAboutStory: "우리 이야기",
    navAboutMission: "미션",
    navServices: "서비스",
    navMedia: "미디어",
    navOverview: "개요",

    s1Kicker: "결제",
    s1Title: "카드 결제를 더 쉽게",
    s1Text: "영수증, 추적, 안전한 사용.",

    s2Kicker: "디지털 뱅킹",
    s2Title: "디지털 뱅킹 글로벌 리더",
    s2Text: "모바일 결제, 생체인증, 실시간 송금.",

    s3Kicker: "그룹",
    s3Title: "그룹 계좌 및 월간 플랜",
    s3Text: "모임/저축을 함께 관리.",

    s4Kicker: "지원",
    s4Title: "국제 뱅킹 문의",
    s4Text: "깔끔한 채팅 UI로 빠른 도움.",

    s5Kicker: "대출",
    s5Title: "대출 정보를 명확하게",
    s5Text: "한도와 계획을 투명하게.",

    showcaseTitle: "뱅킹 하이라이트",
    cap1: "결제 및 영수증",
    cap2: "컴플라이언스 및 보안",
    cap3: "그룹 계좌",
    cap4: "지원 채팅",
    cap5: "대출 개요",
  },

  es: {
    brandTitle: "BANCA INTERNACIONAL DE COREA",
    brandSub: "(KIB)",
    heroHeadline: "BANCA INTERNACIONAL DE COREA",
    heroSub: "Una experiencia bancaria digital limpia con sistemas seguros y servicios internacionales.",
    introTitle: "BANCA INTERNACIONAL DE COREA",

    mainHeadline: "Creando servicios financieros útiles\npara tu vida diaria",

    navAbout: "Sobre nosotros",
    navAboutStory: "Nuestra historia",
    navAboutMission: "Misión",
    navServices: "Servicios",
    navMedia: "Medios",
    navOverview: "Resumen",

    s1Kicker: "Pagos",
    s1Title: "Pagos con tarjeta más simples",
    s1Text: "Recibos claros, control y seguridad.",

    s2Kicker: "Banca Digital",
    s2Title: "Líder global en banca digital",
    s2Text: "Pagos móviles, biometría, transferencias en tiempo real.",

    s3Kicker: "Grupos",
    s3Title: "Cuentas de grupo y planes mensuales",
    s3Text: "Organiza aportes y gestiona en conjunto.",

    s4Kicker: "Soporte",
    s4Title: "Consulta banca internacional",
    s4Text: "Ayuda rápida con UI tipo chat.",

    s5Kicker: "Préstamos",
    s5Title: "Resumen de préstamos claro",
    s5Text: "Límites transparentes y vista previa de planificación.",

    showcaseTitle: "Aspectos destacados",
    cap1: "Pagos y recibos",
    cap2: "Cumplimiento y seguridad",
    cap3: "Cuentas de grupo",
    cap4: "Chat de soporte",
    cap5: "Resumen de préstamos",
  }
};

function setText(id, value) {
  const el = $(id);
  if (!el || value == null) return;

  if (typeof value === "string" && value.includes("\n")) {
    el.innerHTML = value.replaceAll("\n", "<br>");
  } else {
    el.textContent = value;
  }
}

function setLanguage(lang) {
  const dict = translations[lang] || translations.en;

  // Top + intro + hero
  setText("brandTitle", dict.brandTitle);
  setText("brandSub", dict.brandSub);
  setText("heroHeadline", dict.heroHeadline);
  setText("heroSub", dict.heroSub);
  setText("introTitle", dict.introTitle);

  // Drawer nav
  setText("navAbout", dict.navAbout);
  setText("navAboutStory", dict.navAboutStory);
  setText("navAboutMission", dict.navAboutMission);
  setText("navServices", dict.navServices);
  setText("navMedia", dict.navMedia);
  setText("navOverview", dict.navOverview);

  // Main headline
  setText("mainHeadline", dict.mainHeadline);

  // Slider 5 cards
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

  // Optional showcase IDs (only if present in HTML)
  setText("showcaseTitle", dict.showcaseTitle);
  setText("cap1", dict.cap1);
  setText("cap2", dict.cap2);
  setText("cap3", dict.cap3);
  setText("cap4", dict.cap4);
  setText("cap5", dict.cap5);

  // Update buttons state + aria-pressed
  $$(".lang-btn").forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle("is-active", active);
    b.setAttribute("aria-pressed", active ? "true" : "false");
  });

  // Set html lang
  document.documentElement.lang = lang;

  // Close menu when language changed
  closeDrawer();
}

$$(".lang-btn").forEach((btn) => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

// Default language
setLanguage("en");

// ---------- SCROLL REVEAL ----------
let _io = null;

function initScrollReveal() {
  const revealEls = $$(".reveal");
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

// ---------- SLIDER (AUTO 3s + SWIPE + DOTS) ----------
// This version matches the corrected CSS: .slide { flex: 0 0 100%; }
const track = $("sliderTrack");
const viewport = $("sliderViewport");
const dotsWrap = $("dots");

if (track && viewport && dotsWrap) {
  const slides = Array.from(track.children);
  let index = 0;
  let timer = null;

  // Build dots
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
    const active = di === i;
    d.classList.toggle("is-active", active);
    d.classList.toggle("active", active); // supports either CSS class
  });
}

  function goTo(i, user = false) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    setDots(index);
    if (user) restart();
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
    timer = null;
  }

  function restart() {
    start();
  }

  // Start autoplay
  start();

  // Pause while touching/hovering
  viewport.addEventListener("touchstart", stop, { passive: true });
  viewport.addEventListener("touchend", restart, { passive: true });
  viewport.addEventListener("mouseenter", stop);
  viewport.addEventListener("mouseleave", restart);

  // Swipe / drag (pointer)
  let startX = 0;
  let dx = 0;
  let isDown = false;

  viewport.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
    dx = 0;
    track.style.transition = "none";
    stop();
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    dx = e.clientX - startX;

    // drag in % based on viewport width
    const w = viewport.getBoundingClientRect().width || 1;
    const dragPercent = (dx / w) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${dragPercent}%))`;
  });

  function endSwipe(e) {
    if (!isDown) return;
    isDown = false;
    track.style.transition = "transform .35s ease";

    const w = viewport.getBoundingClientRect().width || 1;
    const thresholdPx = Math.min(70, w * 0.18);

    if (dx > thresholdPx) goTo(index - 1, true);
    else if (dx < -thresholdPx) goTo(index + 1, true);
    else goTo(index, true);

    restart();
    viewport.releasePointerCapture?.(e.pointerId);
  }

  viewport.addEventListener("pointerup", endSwipe);
  viewport.addEventListener("pointercancel", endSwipe);

  // Keep correct position on resize
  window.addEventListener("resize", () => goTo(index));
}

// ===============================
// KIB LOGIN SECTION (Countries + Save ID + Toggle Password)
// ===============================
async function initLoginUI() {
  const form = document.getElementById("loginForm");
  const country = document.getElementById("countrySelect");
  const userId = document.getElementById("userId");
  const saveId = document.getElementById("saveId");
  const pw = document.getElementById("password");
  const togglePw = document.getElementById("togglePw");

  await buildCountries(country);

  // Save ID (localStorage)
  const saved = localStorage.getItem("kib_saved_id");
  if (saved) {
    userId.value = saved;
    saveId.checked = true;
  }

  saveId?.addEventListener("change", () => {
  const v = userId.value.trim();
  if (saveId.checked && v) localStorage.setItem("kib_saved_id", v);
  else localStorage.removeItem("kib_saved_id");
});

  userId?.addEventListener("input", () => {
    if (saveId?.checked) localStorage.setItem("kib_saved_id", userId.value.trim());
  });

  // Show/Hide password
  togglePw?.addEventListener("click", () => {
    const isPw = pw.type === "password";
    pw.type = isPw ? "text" : "password";
    togglePw.textContent = isPw ? "🙈" : "👁️";
    togglePw.setAttribute("aria-label", isPw ? "Hide password" : "Show password");
  });

  // Login action (demo navigation)
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    // Simple front-end check only
    if (!country.value) return alert("Select a country.");
    if (userId.value.trim().length < 8) return alert("ID must be 8–15 characters.");
    if (pw.value.trim().length < 8) return alert("Password must be 8+ characters.");

    // Go to dashboard page (you will create dashboard.html next)
    window.location.href = "dashboard.html";
  });
}

// Call it after page loads (safe even if section not present)
window.addEventListener("load", () => {
  initLoginUI();
});


function makeSlider({ trackId, viewportId, dotsId, interval = 3000 }) {
  const track = document.getElementById(trackId);
  const viewport = document.getElementById(viewportId);
  const dotsWrap = document.getElementById(dotsId);
  if (!track || !viewport || !dotsWrap) return;

  const slides = Array.from(track.children);
  let index = 0;
  let timer = null;

  // dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dot" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(b);
  });

  function setDots(i) {
    dotsWrap.querySelectorAll(".dot").forEach((d, di) => {
      const active = di === i;
      d.classList.toggle("is-active", active);
      d.classList.toggle("active", active);
    });
  }

  function goTo(i, user = false) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    setDots(index);
    if (user) restart();
  }

  function next() { goTo(index + 1); }

  function start() {
    stop();
    timer = setInterval(next, interval);
  }
  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }
  function restart() { start(); }

  start();

  // pause
  viewport.addEventListener("touchstart", stop, { passive: true });
  viewport.addEventListener("touchend", restart, { passive: true });
  viewport.addEventListener("mouseenter", stop);
  viewport.addEventListener("mouseleave", restart);

  // swipe
  let startX = 0, dx = 0, isDown = false;

  viewport.addEventListener("pointerdown", (e) => {
    isDown = true;
    startX = e.clientX;
    dx = 0;
    track.style.transition = "none";
    stop();
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    dx = e.clientX - startX;
    const w = viewport.getBoundingClientRect().width || 1;
    const dragPercent = (dx / w) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${dragPercent}%))`;
  });

  function endSwipe(e) {
    if (!isDown) return;
    isDown = false;
    track.style.transition = "transform .35s ease";

    const w = viewport.getBoundingClientRect().width || 1;
    const thresholdPx = Math.min(70, w * 0.18);

    if (dx > thresholdPx) goTo(index - 1, true);
    else if (dx < -thresholdPx) goTo(index + 1, true);
    else goTo(index, true);

    restart();
    viewport.releasePointerCapture?.(e.pointerId);
  }

  viewport.addEventListener("pointerup", endSwipe);
  viewport.addEventListener("pointercancel", endSwipe);
  window.addEventListener("resize", () => goTo(index));
}

window.addEventListener("load", () => {
  // News slider
  makeSlider({ trackId: "newsTrack", viewportId: "newsViewport", dotsId: "newsDots", interval: 3000 });

  // Personal banking slider
  makeSlider({ trackId: "personalTrack", viewportId: "personalViewport", dotsId: "personalDots", interval: 3000 });

  // Business banking slider
  makeSlider({ trackId: "businessTrack", viewportId: "businessViewport", dotsId: "businessDots", interval: 3000 });
});

