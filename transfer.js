// transfer.js — UI only (NO OTP email, NO Supabase calls)

window.addEventListener("DOMContentLoaded", () => {
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const $ = (id) => document.getElementById(id);

  // -------------------------
  // Drawer (menu)
  // -------------------------
  const drawer = $("drawer");
  const backdrop = $("backdrop");
  const menuOpen = $("menuOpen");
  const menuClose = $("menuClose");

  function openDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add("is-on"));
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("is-on");
    setTimeout(() => (backdrop.hidden = true), 220);
    document.body.style.overflow = "";
  }

  menuOpen?.addEventListener("click", openDrawer);
  menuClose?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());

  // Logout (optional)
  $("logoutBtn")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // -------------------------
  // Navigation between panels
  // -------------------------
  const home = $("home");
  const panels = ["domestic", "remittance", "fx"].map((id) => $(id)).filter(Boolean);

  $$(".option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const target = opt.dataset.target;
      home.hidden = true;
      panels.forEach((p) => (p.hidden = p.id !== target));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // -------------------------
  // Contact bank buttons (NO DEMO)
  // -------------------------
  const contactBtns = $$("[data-contact]");
  contactBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("Invalid request. Contact bank • More information.");
    });
  });

  // -------------------------
  // Remittance buttons (NO OTP / NO DEMO)
  // -------------------------
  const otpMsg = $("otpMsg");
  $("getOtpBtn")?.addEventListener("click", () => {
    if (otpMsg) otpMsg.textContent = "Invalid. Contact bank • More information.";
  });

  $("confirmBtn")?.addEventListener("click", () => {
    if (otpMsg) otpMsg.textContent = "Invalid. Contact bank • More information.";
  });

  // Keep confirm disabled always
  const confirmBtn = $("confirmBtn");
  if (confirmBtn) confirmBtn.disabled = true;

  // -------------------------
  // Transaction Record on Transfer page: tap to open/close + stagger fade
  // (If you want this section collapsible)
  // -------------------------
  const recordHead = document.querySelector(".panel#records .panel-head");
  const recordList = document.querySelector(".record-list");

  if (recordHead && recordList) {
    recordHead.style.cursor = "pointer";
    let open = true; // your choice: start open or closed

    function animateIn() {
      const cards = Array.from(recordList.querySelectorAll(".record"));
      cards.forEach((c, i) => {
        c.style.opacity = "0";
        c.style.transform = "translateY(-6px)";
        c.style.animation = `fadeInUp .35s ease forwards`;
        c.style.animationDelay = `${i * 90}ms`;
      });
    }

    function openRecords() {
      recordList.hidden = false;
      recordList.classList.add("is-open");
      animateIn();
      open = true;
    }

    function closeRecords() {
      recordList.classList.remove("is-open");
      recordList.classList.add("is-closing");
      setTimeout(() => {
        recordList.hidden = true;
        recordList.classList.remove("is-closing");
      }, 250);
      open = false;
    }

    // Start open and animate once
    recordList.hidden = false;
    animateIn();

    recordHead.addEventListener("click", () => {
      open ? closeRecords() : openRecords();
    });
  }
});
