// ===============================
// KIB — script.js (FULL FINAL)
// ===============================

// ---------- Helpers ----------
const $ = (id) => document.getElementById(id);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));


// ===============================
// INTRO SPLASH CONTROLLER (SAFE)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("intro");
  const app = document.getElementById("app");

  // Safety fallback
  if (!intro || !app) {
    if (app) app.hidden = false;
    return;
  }

  // Ensure correct initial state
  intro.style.display = "grid";
  app.hidden = true;

 // 🔥 fade IN text first
setTimeout(() => {
  intro.classList.add("is-in");
}, 80);

// 🔥 hold then fade OUT
setTimeout(() => {
  intro.classList.remove("is-in");
  intro.classList.add("is-out");

  setTimeout(() => {
    intro.style.display = "none";
    app.hidden = false;
    app.classList.add("is-in");

    if (typeof initScrollReveal === "function") initScrollReveal();
  }, 400); // match CSS
}, 2500);
});  
  
// ===============================
// SUPABASE MAGIC LINK (CLEAN)
// ===============================
const SUPABASE_URL = "https://wkhlshjwpjnhpwcfvdqv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UyqL5TtlTGVXVeUGeEseCw_QLaujK2V";

// ✅ redirect must be the dashboard page (not homepage)
const REDIRECT_URL = "https://stevensprimerealty-art.github.io/KIB/dashboard.html";

// ✅ only this email can receive magic link
const ALLOWED_EMAIL = "kimdaehyun241@gmail.com";
const ALLOWED_ID = "KIB-DH26887";
const ALLOWED_PASSWORD = "XRZ?KADAS";

function getSupabase() {
  if (!window.supabase?.createClient) return null;

  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // ✅ IMPORTANT
    },
  });
}
function getEmailInput() {
  return (
    document.getElementById("email") ||
    document.getElementById("emailInput") ||
    document.querySelector('input[type="email"]') ||
    document.querySelector('input[placeholder*="email"]')
  );
}

async function initMagicLinkLogin() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const countryEl = document.getElementById("countrySelect");
  const idEl = document.getElementById("userId");
  const pwEl = document.getElementById("password");
  const msg = document.getElementById("msg");
  const setMsg = (t) => { if (msg) msg.textContent = t; };

  const supabase = getSupabase();
  if (!supabase) {
    setMsg("Supabase not loaded. Add the Supabase CDN script tag back.");
    return;
  }

  const emailEl = getEmailInput();

  // ✅ define ONCE (top of function)
  const isCallback =
    location.hash.includes("access_token=") ||
    location.search.includes("code=") ||
    location.search.includes("type=magiclink") ||
    location.hash.includes("type=magiclink");

  // ✅ ONE auth listener (no duplicates)
  supabase.auth.onAuthStateChange((_event, session) => {
    // only redirect automatically when user arrived from magic link callback
    if (session && isCallback) window.location.replace("dashboard.html");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ must be South Korea
    if (!countryEl || countryEl.value !== "KR") {
      setMsg("Country must be South Korea to continue.");
      return;
    }

    if (!emailEl || !emailEl.value.trim()) {
      setMsg("Please enter your email.");
      return;
    }

    // ✅ allowlist only
    const email = emailEl.value.trim().toLowerCase();
    if (email !== ALLOWED_EMAIL) {
      setMsg("This email is not allowed.");
      return;
    }

    // ✅ must match ID + password too
    const id = (idEl?.value || "").trim();
    const pw = (pwEl?.value || "").trim();

    if (id !== ALLOWED_ID || pw !== ALLOWED_PASSWORD) {
      setMsg("Invalid ID or password.");
      return; // ❌ no email sent
    }

    setMsg("Sending login link...");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_URL },
    });

    if (error) {
      setMsg("❌ " + error.message);
      return;
    }

    setMsg("✅ Link sent! Check your email and tap the login link.");
  });

  // ✅ Fallback: sometimes session appears slightly after URL parsing
  if (isCallback) {
    setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) window.location.replace("dashboard.html");
    }, 200);
  }
}

window.addEventListener("load", initMagicLinkLogin);

// ===============================
// DASHBOARD PROTECTION
// ===============================
async function protectDashboard() {
  if (!location.pathname.endsWith("/dashboard.html")) return;

  const supabase = getSupabase();
  if (!supabase) return;

  // 1st check
  let { data } = await supabase.auth.getSession();

  // ✅ retry once (session can appear after Supabase parses URL)
  if (!data?.session) {
    await new Promise(r => setTimeout(r, 250));
    ({ data } = await supabase.auth.getSession());
  }

  if (!data?.session) window.location.replace("index.html");
}

window.addEventListener("load", protectDashboard);

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

  // keep placeholder, clear others
  selectEl.querySelectorAll("option:not([disabled])").forEach(o => o.remove());

  // 1) Try REST Countries
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

    // ✅ default South Korea AFTER options exist
    selectEl.value = "KR";
    return;
  } catch (err) {
    // fallback below
  }

  // 2) Fallback Intl
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

    // ✅ default South Korea AFTER options exist
    selectEl.value = "KR";
  } catch (e) {
    // last resort: do nothing
  }
}

// ---------- MENU DRAWER ----------
const drawer = $("drawer");
const backdrop = $("backdrop");
const menuBtn = $("menuBtn");
const closeBtn = $("closeBtn");
function openDrawer() {
  if (!drawer || !backdrop || !menuBtn) return;

  drawer.classList.add("is-open");
  menuBtn.classList.add("is-active"); // ✅ ADD THIS

  backdrop.hidden = false;
  requestAnimationFrame(() => backdrop.classList.add("is-on"));

  drawer.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  if (!drawer || !backdrop || !menuBtn) return;

  drawer.classList.remove("is-open");
  menuBtn.classList.remove("is-active"); // ✅ ADD THIS

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

// ===============================
// DRAWER ACCORDION (PRO VERSION)
// ===============================
$$("[data-accordion]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-accordion");
    const panel = document.querySelector(`[data-panel="${key}"]`);
    if (!panel) return;

    const isOpen = btn.classList.contains("is-open");

    // 🔥 CLOSE ALL FIRST (one open at a time)
    $$("[data-accordion]").forEach((b) => {
      b.classList.remove("is-open");
      b.setAttribute("aria-expanded", "false");
    });

    $$("[data-panel]").forEach((p) => {
      p.style.maxHeight = null;
      p.classList.remove("is-open");
    });

    // 🔥 OPEN CURRENT
    if (!isOpen) {
      btn.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");

      panel.classList.add("is-open");
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
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
const sliderTrack = $("sliderTrack");
const viewport = $("sliderViewport");
const dotsWrap = $("dots");

if (sliderTrack && viewport && dotsWrap) {

  const slides = Array.from(sliderTrack.children);
  if (!slides.length) return;

  let index = 0;
  let timer = null;

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
      d.classList.toggle("active", active);
    });
  }

  function goTo(i, user = false) {
    index = (i + slides.length) % slides.length;
    sliderTrack.style.transform = `translateX(-${index * 100}%)`;
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
    sliderTrack.style.transition = "none";
    stop();
    viewport.setPointerCapture?.(e.pointerId);
  });

  viewport.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    dx = e.clientX - startX;

    // drag in % based on viewport width
    const w = viewport.getBoundingClientRect().width || 1;
    const dragPercent = (dx / w) * 100;
    sliderTrack.style.transform = `translateX(calc(-${index * 100}% + ${dragPercent}%))`;
  });

  function endSwipe(e) {
    if (!isDown) return;
    isDown = false;
    sliderTrack.style.transition = "transform .35s ease";

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
}   // ✅ ADD THIS LINE

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
  makeSlider({ trackId: "newsTrack", viewportId: "newsViewport", dotsId: "newsDots", interval: 3000 });
  makeSlider({ trackId: "personalTrack", viewportId: "personalViewport", dotsId: "personalDots", interval: 3000 });
  makeSlider({ trackId: "businessTrack", viewportId: "businessViewport", dotsId: "businessDots", interval: 3000 });

  // ✅ add this
  makeSlider({ trackId: "circleTrack", viewportId: "circleViewport", dotsId: "circleDots", interval: 3500 });
});

/* ===============================
   KIB BANNER (FINAL — CLEAN + FIXED)
================================ */
document.addEventListener("DOMContentLoaded", function () {

  const banner = document.getElementById("kibBanner");
  const track = document.getElementById("kibBannerTrack");
  const dotsWrap = document.getElementById("kibBannerDots");
  const highlightsWrap = document.getElementById("kibHighlights");

  if (!banner || !track || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll(".kib-banner-slide"));
  const total = slides.length;
  if (!total) return;

  let index = 0;
  let timer = null;

  // ===== CREATE DOTS =====
  dotsWrap.innerHTML = "";
  const dots = slides.map((_, i) => {
    const b = document.createElement("button");
    if (i === 0) b.classList.add("is-active");
    b.dataset.i = i;
    dotsWrap.appendChild(b);
    return b;
  });

  const highlights = highlightsWrap
    ? Array.from(highlightsWrap.querySelectorAll("[data-i]"))
    : [];

  let currentSlide = slides[0];

  // show first slide
  currentSlide.classList.add("is-active");

  function updateUI() {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === index));
    highlights.forEach((h, i) => h.classList.toggle("is-active", i === index));
  }

  // ✅ FIXED FADE (NO DELAY, NO GLITCH)
  function goTo(i, user = false) {
  const nextIndex = (i + total) % total;
  const nextSlide = slides[nextIndex];

  if (nextSlide === currentSlide) return;

  // 🔥 ensure proper stacking
  slides.forEach(s => s.style.zIndex = 0);
  currentSlide.style.zIndex = 1;
  nextSlide.style.zIndex = 2;

  // fade out current
  currentSlide.classList.remove("is-active");

  // force repaint
  currentSlide.offsetHeight;

  // fade in next
  nextSlide.classList.add("is-active");

  currentSlide = nextSlide;
  index = nextIndex;

  updateUI();

  if (user) restart();
}
  
  function start() {
    stop();
    timer = setInterval(() => goTo(index + 1), 3500);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  function restart() {
    stop();
    start();
  }

  // ===== DOT CLICK =====
  dots.forEach((d, i) => {
    d.addEventListener("click", () => goTo(i, true));
  });

  // ===== HIGHLIGHT CLICK =====
  highlights.forEach((h) => {
    h.addEventListener("click", () => {
      goTo(Number(h.dataset.i), true);
    });
  });

  // ===== LINK FIX =====
  banner.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });

  // ===== SWIPE =====
  let startX = 0;
  let isSwiping = false;

  banner.addEventListener("touchstart", (e) => {
    if (e.target.closest("a")) return;
    startX = e.touches[0].clientX;
    isSwiping = true;
    stop();
  }, { passive: true });

  banner.addEventListener("touchend", (e) => {
    if (!isSwiping) return;

    const endX = e.changedTouches[0].clientX;
    const dx = endX - startX;

    if (Math.abs(dx) > 50) {
      if (dx < 0) goTo(index + 1, true);
      else goTo(index - 1, true);
    } else {
      restart();
    }

    isSwiping = false;
  }, { passive: true });

  // ===== INIT =====
  updateUI();
  start();
});

/* ===============================
   COUNT UP (KIB STATS)
================================ */
(function () {
  const els = Array.from(document.querySelectorAll(".js-count"));
  if (!els.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function formatNumber(n) {
    return n.toLocaleString("en-US");
  }

  function animateCount(el) {
    const target = Number(el.dataset.value || "0");
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";

    if (prefersReduced) {
      el.textContent = `${prefix}${formatNumber(target)}${suffix}`;
      return;
    }

    const duration = 1100; // ms
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(target * eased);

      el.textContent = `${prefix}${formatNumber(current)}${suffix}`;

      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = `${prefix}${formatNumber(target)}${suffix}`;
    }

    requestAnimationFrame(tick);
  }

  // Trigger when section comes into view
  const section = document.querySelector("#kibStats") || els[0].closest("section") || document.body;

  let ran = false;
  const io = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (!entry || !entry.isIntersecting || ran) return;
    ran = true;
    els.forEach(animateCount);
    io.disconnect();
  }, { threshold: 0.35 });

  io.observe(section);
})();


// ===============================
// FLAG DROPDOWN (KIB)
// ===============================
const langToggle = $("langToggle");
const langDropdown = $("langDropdown");
const currentFlag = $("currentFlag");

if (langToggle && langDropdown) {
  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();

    const isOpen = langDropdown.classList.toggle("is-open");
    langDropdown.hidden = !isOpen;
  });
}

// click outside → close dropdown
document.addEventListener("click", (e) => {
  if (!langDropdown) return;

  if (!e.target.closest(".drawer-lang")) {
    langDropdown.classList.remove("is-open");
    langDropdown.hidden = true;
  }
});

// select language
$$(".lang-option").forEach(btn => {
  btn.addEventListener("click", () => {
    const lang = btn.dataset.lang;
    const flag = btn.dataset.flag;

    // 🔥 connect to your existing system
    setLanguage(lang);

    // update flag UI
    if (currentFlag) currentFlag.textContent = flag;

    // close dropdown
    langDropdown.classList.remove("is-open");
    langDropdown.hidden = true;
  });
});
