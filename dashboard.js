// dashboard.js
// Runs only on dashboard.html

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
  // Hide/Show balance toggle
  // -------------------------
  const eyeBtn = document.getElementById("toggleBalance");
  const balanceEl = document.getElementById("balanceText");

  let balanceVisible = true;
  const realBalanceText = balanceEl?.textContent || "";

  function maskBalance(text) {
    const symbol = text.trim().slice(0, 1); // ₩
    return symbol + "••••••••••";
  }

  eyeBtn?.addEventListener("click", () => {
    if (!balanceEl) return;

    balanceVisible = !balanceVisible;

    if (balanceVisible) {
      balanceEl.textContent = realBalanceText;
      eyeBtn.textContent = "👁️";
      eyeBtn.setAttribute("aria-label", "Hide balance");
    } else {
      balanceEl.textContent = maskBalance(realBalanceText);
      eyeBtn.textContent = "🙈";
      eyeBtn.setAttribute("aria-label", "Show balance");
    }
  });

  // -------------------------
  // Full-page menu overlay
  // -------------------------
  const overlay = document.getElementById("menuOverlay");
  const openBtn = document.getElementById("menuOpen");
  const closeBtn = document.getElementById("menuClose");

  function openMenu() {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = "hidden"; // prevent scroll behind
  }

  function closeMenu() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.style.overflow = "";
  }

  openBtn?.addEventListener("click", openMenu);
  closeBtn?.addEventListener("click", closeMenu);

  // click outside panel closes
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // -------------------------
  // Logout (Supabase)
  // -------------------------
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", async () => {
    const supabase = (typeof getSupabase === "function") ? getSupabase() : null;
    if (!supabase) {
      // fallback: still go back
      window.location.replace("index.html");
      return;
    }

    await supabase.auth.signOut();
    window.location.replace("index.html");
  });
});
