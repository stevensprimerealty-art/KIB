window.addEventListener("DOMContentLoaded", async () => {

  // -------------------------
  // AUTH GUARD (same as dashboard)
  // -------------------------
  try {
    const supabase =
      typeof getSupabase === "function" ? getSupabase() : null;

    if (!supabase) {
      window.location.replace("index.html");
      return;
    }

    const { data } = await supabase.auth.getSession();

    if (!data?.session) {
      window.location.replace("index.html");
      return;
    }

  } catch (e) {
    window.location.replace("index.html");
    return;
  }

  // -------------------------
  // Helpers
  // -------------------------
  const $ = (id) => document.getElementById(id);

  // -------------------------
  // Load transaction
  // -------------------------
  const tx = JSON.parse(localStorage.getItem("kib_selected_tx") || "null");

  // -------------------------
  // Safety fallback
  // -------------------------
  if (!tx) {
    document.body.innerHTML = `
      <p style="text-align:center;margin-top:40px;font-weight:700;">
        No receipt data found
      </p>
    `;
    return; // ✅ STOP execution
  }

  // -------------------------
  // Fill fields (SAFE)
  // -------------------------
  $("r_amount").textContent = tx.amount || "—";
  $("r_title").textContent = tx.title || "—";
  $("r_bank").textContent = tx.bank || "—";
  $("r_date").textContent = tx.date || "—";
  $("r_time").textContent = tx.time || "—";
  $("r_ref").textContent = tx.reference || "—";
  $("r_status").textContent = tx.status || "—";

  // ✅ Subtitle (important for restricted)
  const sub = $("r_subtitle");
  if (sub) sub.textContent = tx.subtitle || "";

  // -------------------------
  // Status styling (SMART)
  // -------------------------
  const statusEl = $("r_status");
  const status = (tx.status || "").toLowerCase();

  if (status.includes("restricted")) {
    statusEl.style.color = "#b45309";
    statusEl.style.background = "rgba(245,158,11,.12)";
  } else if (status.includes("success")) {
    statusEl.style.color = "#16a34a";
    statusEl.style.background = "rgba(22,163,74,.12)";
  } else {
    statusEl.style.color = "#dc2626";
    statusEl.style.background = "rgba(220,38,38,.12)";
  }

  // -------------------------
  // Drawer (menu)
  // -------------------------
  const drawer = $("drawer");
  const backdrop = $("backdrop");
  const openBtn = $("menuOpen");
  const closeBtn = $("menuClose");

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

  openBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // -------------------------
  // Logout
  // -------------------------
  $("logoutBtn")?.addEventListener("click", async () => {
    try {
      const supabase =
        typeof getSupabase === "function" ? getSupabase() : null;

      if (supabase) await supabase.auth.signOut();
    } catch (_) {}

    window.location.replace("index.html");
  });

});
