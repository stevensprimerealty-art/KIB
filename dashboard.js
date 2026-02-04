// dashboard.js — runs only on dashboard.html

window.addEventListener("DOMContentLoaded", () => {
  // -------------------------
  // Owner image upload preview
  // -------------------------
  const file = document.getElementById("ownerImage");
  const img = document.getElementById("ownerPreview");

  file?.addEventListener("change", () => {
    const f = file.files?.[0];
    if (!f) return;
    img.src = URL.createObjectURL(f);
  });

  // -------------------------
  // Balance toggle (DEFAULT: HIDDEN)
  // -------------------------
  const eyeBtn = document.getElementById("toggleBalance");
  const balanceEl = document.getElementById("balanceText");

  const realBalanceText = (balanceEl?.textContent || "").trim();

  function maskBalance(text) {
    // ₩1,260,530,586 -> ₩••••••••••
    const symbol = text.slice(0, 1);
    return symbol + "••••••••••";
  }

  let visible = false;

  function renderBalance() {
    if (!balanceEl || !eyeBtn) return;
    if (visible) {
      balanceEl.textContent = realBalanceText;
      eyeBtn.textContent = "🙈";
      eyeBtn.setAttribute("aria-label", "Hide balance");
      eyeBtn.setAttribute("aria-pressed", "true");
    } else {
      balanceEl.textContent = maskBalance(realBalanceText);
      eyeBtn.textContent = "👁️";
      eyeBtn.setAttribute("aria-label", "Show balance");
      eyeBtn.setAttribute("aria-pressed", "false");
    }
  }

  // ✅ start hidden on open
  renderBalance();

  eyeBtn?.addEventListener("click", () => {
    visible = !visible;
    renderBalance();
  });

  // -------------------------
  // Drawer (fade + slide from left)
  // -------------------------
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("menuBackdrop");
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeDrawer");

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
    setTimeout(() => {
      backdrop.hidden = true;
    }, 220);

    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);

  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // -------------------------
  // Logout (Supabase)
  // -------------------------
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", async () => {
    try {
      const supabase = (typeof getSupabase === "function") ? getSupabase() : null;
      if (supabase) await supabase.auth.signOut();
    } catch (_) {
      // ignore
    }
    window.location.replace("index.html");
  });
});
