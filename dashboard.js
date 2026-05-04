window.addEventListener("DOMContentLoaded", () => {

  const $ = (id) => document.getElementById(id);

  /* ================= STATE ================= */
  const state = {
    index: 0,
    startX: 0,
    currentX: 0,
    dragging: false,

    balance: {
      USD: 882000,
      EUR: 749700,
      KRW: 1299186000
    },

    transactions: JSON.parse(localStorage.getItem("kib_tx")) || [
      {
        id: "REF-882000-KIB",
        type: "Incoming SWIFT Transfer",
        amount: 882000,
        currency: "USD",
        date: "04 May 2026 • 11:05 AM",
        status: "Restricted"
      }
    ]
  };

  /* ================= HELPERS ================= */
  function formatMoney(v, c) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: c
    }).format(v ?? 0);
  }

  const slider = $("slider");
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot");

  /* ================= PROFILE IMAGE (PERSISTENT) ================= */

  const avatar = $("avatar");
  const drawerAvatar = $("drawerAvatar");
  const avatarInput = $("avatarInput");

  const savedAvatar = localStorage.getItem("kib_avatar");

  const fallback = "https://i.imgur.com/6VBx3io.png";

  // load image
  if (savedAvatar) {
    if (avatar) avatar.src = savedAvatar;
    if (drawerAvatar) drawerAvatar.src = savedAvatar;
  } else {
    if (avatar) avatar.src = fallback;
    if (drawerAvatar) drawerAvatar.src = fallback;
  }

  // click avatar → open gallery
  avatar?.addEventListener("click", () => {
    avatarInput?.click();
  });

  // save image permanently
  avatarInput?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      const base64 = event.target.result;

      // save forever
      localStorage.setItem("kib_avatar", base64);

      // update UI
      if (avatar) avatar.src = base64;
      if (drawerAvatar) drawerAvatar.src = base64;
    };

    reader.readAsDataURL(file);
  });

  /* ================= BALANCES ================= */
  function renderBalances() {
    slides.forEach(slide => {
      const currency = slide.dataset.currency;
      const el = slide.querySelector(".amount");
      if (!currency || !el) return;

      el.textContent = formatMoney(state.balance[currency], currency);
    });
  }

  /* ================= SLIDER ================= */

  function getWidth() {
    return slider?.parentElement.offsetWidth || 0;
  }

  function updateSlider(animate = true) {
    if (!slider) return;

    const width = getWidth();

    if (!width) {
      requestAnimationFrame(() => updateSlider(animate));
      return;
    }

    slider.style.transition = animate ? "transform .35s ease" : "none";
    slider.style.transform = `translate3d(-${state.index * width}px,0,0)`;

    if (dots.length === slides.length) {
      dots.forEach(d => d.classList.remove("active"));
      dots[state.index]?.classList.add("active");
    }
  }

  /* ================= TOUCH ================= */

  slider?.addEventListener("touchstart", (e) => {
    state.dragging = true;
    state.startX = e.touches[0].clientX;
    state.currentX = state.startX;
    slider.style.transition = "none";
  }, { passive: true });

  slider?.addEventListener("touchmove", (e) => {
    if (!state.dragging) return;

    state.currentX = e.touches[0].clientX;
    const dx = (state.currentX - state.startX) * 0.9;

    const width = getWidth() || 1;
    slider.style.transform = `translate3d(-${state.index * width + dx}px,0,0)`;
  }, { passive: true });

  slider?.addEventListener("touchend", () => {
    if (!state.dragging) return;

    state.dragging = false;

    const dx = state.currentX - state.startX;

    if (dx > 60) state.index--;
    if (dx < -60) state.index++;

    state.index = Math.max(0, Math.min(state.index, slides.length - 1));

    updateSlider(true);
  });

  slider?.addEventListener("touchcancel", () => {
    state.dragging = false;
  });

  /* ================= TRANSACTIONS ================= */

  const txList = $("txList");

  function renderTransactions(limit = 1) {
    if (!txList) return;

    txList.innerHTML = "";

    const data = state.transactions.slice(0, limit);

    if (!data.length) {
      txList.innerHTML = `<div class="empty">No transactions</div>`;
      return;
    }

    data.forEach(tx => {
      const el = document.createElement("div");
      el.className = "tx";

      el.innerHTML = `
        <div>
          <div class="tx-title">${tx.type}</div>
          <small>${tx.date}</small>
        </div>
        <div class="tx-amount ${tx.amount > 0 ? "credit" : "debit"}">
          ${tx.amount > 0 ? "+" : "-"}${formatMoney(Math.abs(tx.amount), tx.currency)}
        </div>
      `;

      txList.appendChild(el);
    });
  }

  /* ================= VIEW ALL ================= */

  const viewAllBtn = $("viewAllTx");
  let expanded = false;

  viewAllBtn?.addEventListener("click", () => {
    expanded = !expanded;
    renderTransactions(expanded ? state.transactions.length : 1);
    viewAllBtn.textContent = expanded ? "Show less" : "View all →";
  });

  /* ================= POPUP ================= */

  function showPopup(html) {
    const popup = $("popup");
    const content = $("popupContent");

    if (!popup || !content) return;

    content.innerHTML = html;
    popup.hidden = false;

    requestAnimationFrame(() => popup.classList.add("show"));

    popup.onclick = (e) => {
      if (e.target.id === "popup" || e.target.id === "closePopup") {
        popup.classList.remove("show");
        setTimeout(() => popup.hidden = true, 200);
      }
    };
  }

  $("transferBtn")?.addEventListener("click", () => {
    showPopup(`
      <h3>Transfer Restricted</h3>
      <p>This account is under ADM restriction.</p>
      <button id="closePopup">Close</button>
    `);
  });

  $("notifBtn")?.addEventListener("click", () => {
    showPopup(`
      <h3>Account Notice</h3>
      <p>Account under administrative control (ADM).</p>
      <button id="closePopup">Close</button>
    `);
  });

  /* ================= DRAWER ================= */

  const drawer = $("drawer");
  const backdrop = $("drawerBackdrop");

  $("menuBtn")?.addEventListener("click", () => {
    drawer?.classList.add("open");
    if (backdrop) backdrop.hidden = false;
  });

  function closeDrawer() {
    drawer?.classList.remove("open");
    if (backdrop) backdrop.hidden = true;
  }

  backdrop?.addEventListener("click", closeDrawer);
  $("closeDrawer")?.addEventListener("click", closeDrawer);

  /* ================= RESIZE ================= */

  window.addEventListener("resize", () => {
    updateSlider(false);
  });

  /* ================= INIT ================= */

  function init() {
    renderBalances();
    renderTransactions(1);
    updateSlider(false);
  }

  window.addEventListener("load", init);

});
