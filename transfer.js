// transfer.js
// Transfer page logic: section switching, drawer, OTP mock, contact button, logout.

window.addEventListener("DOMContentLoaded", () => {
  const home = document.getElementById("home");
  const panels = ["domestic", "remittance", "fx"].map(id => document.getElementById(id));

  // ---- Section switcher ----
  document.querySelectorAll(".option[data-target]").forEach((opt) => {
    opt.addEventListener("click", () => {
      const id = opt.dataset.target;
      if (!id) return;

      home.hidden = true;
      panels.forEach(p => { if (p) p.hidden = true; });

      const panel = document.getElementById(id);
      if (panel) panel.hidden = false;

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // ---- Drawer (left fade-in) ----
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("backdrop");
  const menuOpen = document.getElementById("menuOpen");
  const menuClose = document.getElementById("menuClose");

  function openDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.add("is-open");
    backdrop.hidden = false;
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDrawer() {
    if (!drawer || !backdrop) return;
    drawer.classList.remove("is-open");
    backdrop.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  menuOpen?.addEventListener("click", openDrawer);
  menuClose?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

  // ---- Contact bank button ----
  document.querySelectorAll("[data-contact]").forEach((btn) => {
    btn.addEventListener("click", () => {
      // You can replace this with your real bank contact page later
      window.alert("Contact bank • More information\n\nEmail: support@kib.example\nPhone: +82-000-0000");
    });
  });

  // ---- OTP mock flow ----
  const otpMsg = document.getElementById("otpMsg");
  const getOtpBtn = document.getElementById("getOtpBtn");
  const confirmBtn = document.getElementById("confirmBtn");

  getOtpBtn?.addEventListener("click", () => {
    if (otpMsg) otpMsg.textContent = "✅ OTP sent (demo). Please confirm.";
    if (confirmBtn) confirmBtn.disabled = false;
  });

  confirmBtn?.addEventListener("click", () => {
    if (otpMsg) otpMsg.textContent = "✅ Confirmed (demo).";
  });

  // ---- Logout (uses getSupabase from script.js if available) ----
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", async () => {
    try {
      const supabase = (typeof getSupabase === "function") ? getSupabase() : null;
      if (supabase) await supabase.auth.signOut();
    } catch (e) {}
    window.location.replace("index.html");
  });
});
