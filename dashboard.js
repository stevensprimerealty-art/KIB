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

  // -------------------------
  // Recent Transactions (slide down)
  // -------------------------
  const recentBtn = document.getElementById("recentBtn");
  const recentPanel = document.getElementById("recentPanel");
  const recentChevron = document.getElementById("recentChevron");
  const txList = document.getElementById("txList");
  const viewAllTx = document.getElementById("viewAllTx");

  const transactions = [
    {
      date: "22 Feb 2026",
      bank: "UniCredit",
      amount: "₩330,530,596",
      time: "11:37",
      status: "Successful",
    },
    {
      date: "21 Feb 2026",
      bank: "Intesa Sanpaolo",
      amount: "₩530,000,000",
      time: "10:04",
      status: "Successful",
    },
    {
      date: "20 Feb 2026",
      bank: "UniCredit",
      amount: "₩400,000,000",
      time: "13:06",
      status: "Successful",
    },
  ];

  function renderTx(list) {
    if (!txList) return;
    txList.innerHTML = list.map((t) => `
      <div class="tx-item" role="listitem">
        <div class="tx-left">
          <div class="tx-title">${t.bank} — Transfer</div>
          <div class="tx-meta">${t.date} • ${t.time}</div>
        </div>
        <div class="tx-right">
          <div class="tx-amount">${t.amount}</div>
          <div class="tx-status">${t.status}</div>
        </div>
      </div>
    `).join("");
  }

  let recentOpen = false;

  function openRecent() {
    if (!recentPanel) return;
    renderTx(transactions); // ✅ last 3 only
    recentPanel.hidden = false;

    // allow layout then animate
    requestAnimationFrame(() => {
      recentPanel.classList.add("is-open");
    });

    recentOpen = true;
    recentBtn?.setAttribute("aria-expanded", "true");
    if (recentChevron) recentChevron.textContent = "▴";
  }

  function closeRecent() {
    if (!recentPanel) return;
    recentPanel.classList.remove("is-open");
    recentOpen = false;
    recentBtn?.setAttribute("aria-expanded", "false");
    if (recentChevron) recentChevron.textContent = "▾";

    // wait for animation, then hide
    setTimeout(() => {
      if (!recentOpen) recentPanel.hidden = true;
    }, 350);
  }

  recentBtn?.addEventListener("click", () => {
    recentOpen ? closeRecent() : openRecent();
  });

  // View all -> dedicated page
  viewAllTx?.addEventListener("click", () => {
    window.location.href = "transactions.html";
  });
  
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
