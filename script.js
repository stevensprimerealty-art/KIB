// INTRO → MAIN TRANSITION
const intro = document.getElementById("intro");
const app = document.getElementById("app");

window.addEventListener("load", () => {
  if (intro) intro.classList.add("is-in");

  // after 3 seconds, show hero/header
  setTimeout(() => {
    if (intro) intro.style.display = "none";
    if (app) {
      app.hidden = false;
      requestAnimationFrame(() => app.classList.add("is-in"));
    }
  }, 3000);
});

// MENU DRAWER
const drawer = document.getElementById("drawer");
const backdrop = document.getElementById("backdrop");
const menuBtn = document.getElementById("menuBtn");
const closeBtn = document.getElementById("closeBtn");

function openDrawer() {
  if (!drawer || !backdrop || !menuBtn) return;
  drawer.classList.add("is-open");
  backdrop.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  menuBtn.setAttribute("aria-expanded", "true");
}

function closeDrawer() {
  if (!drawer || !backdrop || !menuBtn) return;
  drawer.classList.remove("is-open");
  backdrop.hidden = true;
  drawer.setAttribute("aria-hidden", "true");
  menuBtn.setAttribute("aria-expanded", "false");
}

if (menuBtn) menuBtn.addEventListener("click", openDrawer);
if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
if (backdrop) backdrop.addEventListener("click", closeDrawer);

// ABOUT US accordion
document.querySelectorAll("[data-accordion]").forEach(btn => {
  btn.addEventListener("click", () => {
    const key = btn.getAttribute("data-accordion");
    const panel = document.querySelector(`[data-panel="${key}"]`);
    if (panel) panel.hidden = !panel.hidden;
  });
});

// Scroll down button
const scrollBtn = document.querySelector(".scroll-down");
if (scrollBtn) {
  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  });
}

// LANGUAGE SWITCH
const t = {
  en: {
    brandTitle: "KOREA INTERNATIONAL BANKING",
    brandSub: "(KIB)",
    heroHeadline: "KOREA INTERNATIONAL BANKING",
    navAbout: "About Us",
    navAboutStory: "Our Story",
    navAboutMission: "Mission",
    navServices: "Services",
    navMedia: "Media",
    navOverview: "Overview",
    introTitle: "KOREA INTERNATIONAL BANKING",
  },
  ko: {
    brandTitle: "한국 국제 은행",
    brandSub: "(KIB)",
    heroHeadline: "한국 국제 은행",
    navAbout: "회사 소개",
    navAboutStory: "회사 이야기",
    navAboutMission: "미션",
    navServices: "서비스",
    navMedia: "미디어",
    navOverview: "개요",
    introTitle: "한국 국제 은행",
  },
  es: {
    brandTitle: "BANCA INTERNACIONAL DE COREA",
    brandSub: "(KIB)",
    heroHeadline: "BANCA INTERNACIONAL DE COREA",
    navAbout: "Sobre nosotros",
    navAboutStory: "Nuestra historia",
    navAboutMission: "Misión",
    navServices: "Servicios",
    navMedia: "Medios",
    navOverview: "Resumen",
    introTitle: "BANCA INTERNACIONAL DE COREA",
  }
};

function setLanguage(lang) {
  const dict = t[lang] || t.en;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("brandTitle", dict.brandTitle);
  setText("brandSub", dict.brandSub);
  setText("heroHeadline", dict.heroHeadline);
  setText("navAbout", dict.navAbout);
  setText("navAboutStory", dict.navAboutStory);
  setText("navAboutMission", dict.navAboutMission);
  setText("navServices", dict.navServices);
  setText("navMedia", dict.navMedia);
  setText("navOverview", dict.navOverview);
  setText("introTitle", dict.introTitle);

  document.querySelectorAll(".lang-btn").forEach(b => {
    b.classList.toggle("is-active", b.dataset.lang === lang);
  });

  document.documentElement.lang = lang;
}

document.querySelectorAll(".lang-btn").forEach(btn => {
  btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
});

// ✅ default language on first load
setLanguage("en");
