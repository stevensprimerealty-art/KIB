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

const eyeBtn = $("toggleBalance");

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
  const balances = document.querySelectorAll("[data-real]");

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
// Transfer restriction handling
// -------------------------
const transferBtn = $("transferBtn");
const drawerTransferBtn = $("drawerTransferBtn");
const transferNotice = $("transferNotice");

let noticeTimer = null;

function showTransferNotice() {
  if (!transferNotice) return;

  transferNotice.hidden = false;

  if (noticeTimer) clearTimeout(noticeTimer);

  noticeTimer = setTimeout(() => {
    transferNotice.hidden = true;
  }, 3000);
}

// main button
transferBtn?.addEventListener("click", showTransferNotice);

// drawer button
drawerTransferBtn?.addEventListener("click", showTransferNotice);
  
 

// -------------------------
// Recent Transactions (auto-open + stagger fade in/out)
// -------------------------
const recentBtn = $("recentBtn");
const recentPanel = $("recentPanel");
const recentChevron = $("recentChevron");
const txList = $("txList");
const viewAllTx = $("viewAllTx");

// -------------------------
// Transactions data (SAFE)
// -------------------------
const transactions = [
  {
    title: "Incoming SWIFT Transfer",
    bank: "Korea Investment Bank",
    amount: `+$${(window.accountState?.balance?.total ?? 0).toLocaleString()}.00`,
    date: "04 May 2026",
    time: "10:42",
    status: "Restricted",
    reference: "ADM-DG/2026/44721",
    subtitle: "Administrative release (under compliance review)"
  }
];
  
// -------------------------
// Render Transactions (FIXED + SAFE)
// -------------------------
function renderTx(list) {
  if (!txList || !Array.isArray(list)) return;

  txList.innerHTML = list
    .map((t, i) => {
      // ✅ Safe values
      const title = t.title || "";
      const bank = t.bank || "";
      const date = t.date || "";
      const time = t.time || "";
      const subtitle = t.subtitle || "";
      const status = t.status || "";

      // ✅ Use accountState amount if not provided
      const amount =
        t.amount ||
        `$${window.accountState?.balance?.total?.toLocaleString() || "0"}.00`;

      // ✅ Always credit (incoming funds)
      const amountClass = "credit";

      return `
        <div class="tx-item" role="listitem" data-index="${i}">
          
          <div class="tx-left">
            <div class="tx-title">${title}</div>

            <div class="tx-meta">
              ${bank} • ${date} • ${time}
            </div>

            <div class="tx-sub">
              ${subtitle}
            </div>
          </div>

          <div class="tx-right">
            <div class="tx-amount ${amountClass}">
              ${amount}
            </div>

            <div class="tx-status">
              ${status}
            </div>
          </div>

        </div>
      `;
    })
    .join("");

  // -------------------------
  // Click → open receipt
  // -------------------------
  txList.onclick = (e) => {
    const item = e.target.closest(".tx-item");
    if (!item) return;

    const i = Number(item.dataset.index);
    if (!list[i]) return;

    localStorage.setItem(
      "kib_selected_tx",
      JSON.stringify(list[i])
    );

    window.location.href = "receipt.html";
  };
}
// -------------------------
// Animation helpers
// -------------------------
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

// -------------------------
// Open / Close panel
// -------------------------
function openRecent(auto = false) {
  if (!recentPanel) return;

  renderTx(transactions || []); // ✅ safe fallback
  recentPanel.hidden = false;

  requestAnimationFrame(() => {
    recentPanel.classList.add("is-open");
    staggerIn();
  });

  recentOpen = true;
  recentBtn?.setAttribute("aria-expanded", "true");

  if (recentChevron) recentChevron.textContent = "▴";

  if (!auto) {
    recentPanel.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
}

function closeRecent() {
  if (!recentPanel) return;

  const fadeTime = staggerOut();

  recentOpen = false;
  recentBtn?.setAttribute("aria-expanded", "false");

  if (recentChevron) recentChevron.textContent = "▾";

  setTimeout(() => {
    recentPanel.classList.remove("is-open");

    setTimeout(() => {
      if (!recentOpen) recentPanel.hidden = true;
    }, 300);
  }, fadeTime);
}

// -------------------------
// Events
// -------------------------
recentBtn?.addEventListener("click", () => {
  if (recentOpen) closeRecent();
  else openRecent(false);
});

viewAllTx?.addEventListener("click", () => {
  window.location.href = "transactions.html";
});

// -------------------------
// Auto-open on load
// -------------------------
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
// Banner slider
// -------------------------
(function bannerSlider() {
  const track = $("bannerTrack");
  const viewport = $("bannerViewport");
  const dotsWrap = $("bannerDots");
  if (!track || !viewport || !dotsWrap) return;

  const slides = Array.from(track.children);

  // ✅ Stop if only one slide
  if (slides.length <= 1) return;

  let index = 0;
  let timer = null;

  // Dots
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    if (i === 0) b.classList.add("is-active");
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
    track.style.transition = "transform .35s ease";
    track.style.transform = `translateX(-${index * 100}%)`;
    setDots(index);
    if (user) restart();
  }

  function start() {
    stop();
    timer = setInterval(() => goTo(index + 1), 4000);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restart() {
    stop();
    start();
  }

  start();

  // Swipe
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
    const percent = (dx / w) * 100;
    track.style.transform = `translateX(calc(-${index * 100}% + ${percent}%))`;
  });

  function end(e) {
    if (!down) return;
    down = false;

    const w = viewport.getBoundingClientRect().width || 1;
    const threshold = Math.min(70, w * 0.18);

    if (dx < -threshold) goTo(index + 1, true);
    else if (dx > threshold) goTo(index - 1, true);
    else goTo(index, true);

    restart();
    viewport.releasePointerCapture?.(e.pointerId);
  }

  viewport.addEventListener("pointerup", end);
  viewport.addEventListener("pointercancel", end);
})();

});
