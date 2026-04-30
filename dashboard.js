
window.addEventListener("DOMContentLoaded", async () => {

  // -------------------------
  // AUTH GUARD (REQUIRED)
  // -------------------------
  try {
    const supabase =
      typeof getSupabase === "function" ? getSupabase() : null;

    // ⛔ Block if Supabase missing
    if (!supabase) {
      window.location.replace("index.html");
      return;
    }

    const { data } = await supabase.auth.getSession();

    // ⛔ Block if not logged in
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
  // Owner image (LOAD + SAVE)
  // -------------------------
  const file = $("ownerImage");
  const img = $("ownerPreview");

  // ✅ Load saved image on page load
  const savedImage = localStorage.getItem("kib_profile_image");
  if (savedImage && img) {
    img.src = savedImage;
  }

  // ✅ Upload + persist image
  file?.addEventListener("change", () => {
    const f = file.files?.[0];
    if (!f || !img) return;

    const reader = new FileReader();

    reader.onload = function (e) {
      const base64 = e.target.result;

      // show image
      img.src = base64;

      // save permanently
      localStorage.setItem("kib_profile_image", base64);
    };

    reader.readAsDataURL(f);
  });
  
  // -------------------------
  // Scan QR navigation (FIXED: inside DOMContentLoaded)
  // -------------------------
  $("scanNav")?.addEventListener("click", () => {
    window.location.href = "scan.html";
  });

  // -------------------------
  // (Optional) Cards navigation if you want JS (recommended to also add onclick in HTML)
  // Put id="cardsAction" on the Cards quick action button if you want to use this.
  // -------------------------
  $("cardsAction")?.addEventListener("click", () => {
    window.location.href = "cards.html";
  });

// -------------------------
// Balance (ALL currencies) + eye toggle (FINAL FIXED)
// -------------------------

const eyeBtn = document.getElementById("toggleBalance");

function getReal(el) {
  return (el.dataset.real || el.textContent || "").trim() || "—";
}

function maskMoney(text) {
  const t = (text || "").trim();
  const symbol = t.match(/^[^\d]+/)?.[0] || "";
  return symbol + "••••••••••";
}

let visible = localStorage.getItem("kib_balance_visible") === "true";

function renderBalances() {
  const balances = document.querySelectorAll(".bal-amt");

  balances.forEach(el => {
    const real = getReal(el);
    el.textContent = visible ? real : maskMoney(real);
  });

  if (eyeBtn) {
    eyeBtn.textContent = visible ? "🙈" : "👁️";
    eyeBtn.setAttribute(
      "aria-label",
      visible ? "Hide balance" : "Show balance"
    );
    eyeBtn.setAttribute("aria-pressed", visible ? "true" : "false");
  }
}

// start hidden
renderBalances();

// toggle
eyeBtn?.addEventListener("click", () => {
  visible = !visible;
  localStorage.setItem("kib_balance_visible", visible);
  renderBalances();
});
  
  // -------------------------
  // Balance slider (swipe + dots)
  // -------------------------
  const balTrack = $("balTrack");
  const balViewport = $("balViewport");
  const balDots = $("balDots");

  if (balTrack && balViewport && balDots) {
    const dots = Array.from(balDots.querySelectorAll("button"));
    const slides = Array.from(balTrack.children);
    let index = 0;

    function setDots(i) {
      dots.forEach((d, di) => d.classList.toggle("is-active", di === i));
    }

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      balTrack.style.transform = `translateX(-${index * 100}%)`;
      setDots(index);
    }

    dots.forEach((d, i) => d.addEventListener("click", () => goTo(i)));

    // Swipe
    let startX = 0,
      dx = 0,
      down = false;

    balViewport.addEventListener("pointerdown", (e) => {
      down = true;
      startX = e.clientX;
      dx = 0;
      balTrack.style.transition = "none";
      balViewport.setPointerCapture?.(e.pointerId);
    });

    balViewport.addEventListener("pointermove", (e) => {
      if (!down) return;
      dx = e.clientX - startX;
      const w = balViewport.getBoundingClientRect().width || 1;
      const p = (dx / w) * 100;
      balTrack.style.transform = `translateX(calc(-${index * 100}% + ${p}%))`;
    });

    function end(e) {
      if (!down) return;
      down = false;
      balTrack.style.transition = "transform .35s ease";
      const w = balViewport.getBoundingClientRect().width || 1;
      const thresh = Math.min(60, w * 0.18);

      if (dx < -thresh) goTo(index + 1);
      else if (dx > thresh) goTo(index - 1);
      else goTo(index);

      balViewport.releasePointerCapture?.(e.pointerId);
    }

    balViewport.addEventListener("pointerup", end);
    balViewport.addEventListener("pointercancel", end);

    goTo(0);
  }

  // -------------------------
  // Recent Transactions (auto-open + stagger fade in/out)
  // -------------------------
  const recentBtn = $("recentBtn");
  const recentPanel = $("recentPanel");
  const recentChevron = $("recentChevron");
  const txList = $("txList");
  const viewAllTx = $("viewAllTx");

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
    if (!txList) return 220;
    const items = Array.from(txList.querySelectorAll(".tx-item"));
    items.forEach((el, i) => {
      el.style.animation = "fadeOutDown .22s ease forwards";
      el.style.animationDelay = `${i * 80}ms`;
    });
    return items.length ? (items.length - 1) * 80 + 220 : 220;
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

    recentOpen = false;
    recentBtn?.setAttribute("aria-expanded", "false");
    if (recentChevron) recentChevron.textContent = "▾";

    // keep panel visible while items fade out
    setTimeout(() => {
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

  // auto-open on load
  openRecent(true);

  // -------------------------
  // Drawer (fade + slide from left)
  // -------------------------
  const drawer = $("drawer");
  const backdrop = $("menuBackdrop");
  const menuBtn = $("menuBtn");
  const closeBtn = $("closeDrawer");

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
  const logoutBtn = $("logoutBtn");
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
    const track = $("bannerTrack");
    const viewport = $("bannerViewport");
    const dotsWrap = $("bannerDots");
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
