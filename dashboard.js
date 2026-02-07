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
    const symbol = text.slice(0, 1); // ₩
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

  renderBalance(); // start hidden
  eyeBtn?.addEventListener("click", () => {
    visible = !visible;
    renderBalance();
  });

  // -------------------------
  // Recent Transactions (auto-open + stagger fade in/out)
  // -------------------------
  const recentBtn = document.getElementById("recentBtn");
  const recentPanel = document.getElementById("recentPanel");
  const recentChevron = document.getElementById("recentChevron");
  const txList = document.getElementById("txList");
  const viewAllTx = document.getElementById("viewAllTx");

  const transactions = [
    { date: "22 Feb 2026", bank: "UniCredit", amount: "₩330,530,596", time: "11:37", status: "Successful" },
    { date: "21 Feb 2026", bank: "Intesa Sanpaolo", amount: "₩530,000,000", time: "10:04", status: "Successful" },
    { date: "20 Feb 2026", bank: "UniCredit", amount: "₩400,000,000", time: "13:06", status: "Successful" },
  ];

  function renderTx(list) {
    if (!txList) return;
    txList.innerHTML = list
      .map(
        (t) => `
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
      `
      )
      .join("");
  }

  let recentOpen = false;

  function staggerIn() {
    if (!txList) return;
    const items = Array.from(txList.querySelectorAll(".tx-item"));
    items.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(-6px)";
      el.style.animation = "fadeInUp .35s ease forwards";
      el.style.animationDelay = `${i * 110}ms`;
    });
  }

  function staggerOut() {
    if (!txList) return;
    const items = Array.from(txList.querySelectorAll(".tx-item"));
    items.forEach((el, i) => {
      el.style.animation = "fadeOutDown .22s ease forwards";
      el.style.animationDelay = `${i * 80}ms`;
    });

    // how long until last item finishes?
    const total = items.length;
    return total ? (total - 1) * 80 + 220 : 220;
  }

  function openRecent(auto = false) {
    if (!recentPanel) return;

    renderTx(transactions);
    recentPanel.hidden = false;

    requestAnimationFrame(() => {
      recentPanel.classList.add("is-open");
      staggerIn();
    });

    recentOpen = true;
    recentBtn?.setAttribute("aria-expanded", "true");
    if (recentChevron) recentChevron.textContent = "▴";

    if (!auto) recentPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeRecent() {
    if (!recentPanel) return;

    const fadeTime = staggerOut();

    // keep panel open while items fade
    recentOpen = false;
    recentBtn?.setAttribute("aria-expanded", "false");
    if (recentChevron) recentChevron.textContent = "▾";

    setTimeout(() => {
      // now close panel
      recentPanel.classList.remove("is-open");
      setTimeout(() => {
        if (!recentOpen) recentPanel.hidden = true;
      }, 300);
    }, fadeTime);
  }

  recentBtn?.addEventListener("click", () => {
    if (recentOpen) closeRecent();
    else openRecent(false);
  });

  viewAllTx?.addEventListener("click", () => {
    window.location.href = "transactions.html";
  });

  // ✅ Auto-open when dashboard loads
  openRecent(true);

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
    setTimeout(() => (backdrop.hidden = true), 220);
    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", openDrawer);
  closeBtn?.addEventListener("click", closeDrawer);
  backdrop?.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeDrawer());

  // -------------------------
  // Logout (Supabase)
  // -------------------------
  const logoutBtn = document.getElementById("logoutBtn");
  logoutBtn?.addEventListener("click", async () => {
    try {
      const supabase = typeof getSupabase === "function" ? getSupabase() : null;
      if (supabase) await supabase.auth.signOut();
    } catch (_) {}
    window.location.replace("index.html");
  });

  // -------------------------
  // Banner slider (auto 4s + swipe + dots)
  // -------------------------
  (function bannerSlider() {
    const track = document.getElementById("bannerTrack");
    const viewport = document.getElementById("bannerViewport");
    const dotsWrap = document.getElementById("bannerDots");
    if (!track || !viewport || !dotsWrap) return;

    const slides = Array.from(track.children);
    let index = 0;
    let timer = null;

    dotsWrap.innerHTML = "";
    slides.forEach((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = i === 0 ? "is-active" : "";
      b.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(b);
    });

    function setDots(i) {
      dotsWrap.querySelectorAll("button").forEach((d, di) => {
        d.classList.toggle("is-active", di === i);
      });
    }

    function goTo(i, user = false) {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      setDots(index);
      if (user) restart();
    }

    function start() {
      stop();
      timer = setInterval(() => goTo(index + 1), 4000);
    }
    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }
    function restart() {
      start();
    }

    start();

    // swipe
    let startX = 0,
      dx = 0,
      down = false;

    viewport.addEventListener("pointerdown", (e) => {
      down = true;
      startX = e.clientX;
      dx = 0;
      track.style.transition = "none";
      stop();
      viewport.setPointerCapture?.(e.pointerId);
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!down) return;
      dx = e.clientX - startX;
      const w = viewport.getBoundingClientRect().width || 1;
      const p = (dx / w) * 100;
      track.style.transform = `translateX(calc(-${index * 100}% + ${p}%))`;
    });

    function end(e) {
      if (!down) return;
      down = false;
      track.style.transition = "transform .35s ease";
      const w = viewport.getBoundingClientRect().width || 1;
      const thresh = Math.min(70, w * 0.18);

      if (dx < -thresh) goTo(index + 1, true);
      else if (dx > thresh) goTo(index - 1, true);
      else goTo(index, true);

      restart();
      viewport.releasePointerCapture?.(e.pointerId);
    }

    viewport.addEventListener("pointerup", end);
    viewport.addEventListener("pointercancel", end);
  })();
});
