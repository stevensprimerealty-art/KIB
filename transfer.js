// transfer.js — FULL VERSION (CLEAN + MATCHED WITH DASHBOARD)

window.addEventListener("DOMContentLoaded", () => {
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));
  const $ = (id) => document.getElementById(id);

  // =========================
  // Drawer (menu)
  // =========================
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
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
  });

  // =========================
  // Logout
  // =========================
  $("logoutBtn")?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // =========================
  // Navigation between panels
  // =========================
  const home = $("home");
  const panels = ["domestic", "remittance", "fx"]
    .map((id) => $(id))
    .filter(Boolean);

  $$(".option").forEach((opt) => {
    opt.addEventListener("click", () => {
      const target = opt.dataset.target;
      home.hidden = true;
      panels.forEach((p) => (p.hidden = p.id !== target));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // =========================
  // Contact buttons
  // =========================
  $$("[data-contact]").forEach((btn) => {
    btn.addEventListener("click", () => {
      alert("Invalid request. Contact bank • More information.");
    });
  });

  // =========================
  // OTP / Confirm (disabled)
  // =========================
  const otpMsg = $("otpMsg");
  const confirmBtn = $("confirmBtn");

  $("getOtpBtn")?.addEventListener("click", () => {
    if (otpMsg) {
      otpMsg.textContent =
        "Invalid. Contact bank • More information.";
    }
  });

  $("confirmBtn")?.addEventListener("click", () => {
    if (otpMsg) {
      otpMsg.textContent =
        "Invalid. Contact bank • More information.";
    }
  });

  if (confirmBtn) confirmBtn.disabled = true;

  // =========================
  // Transaction Records
  // =========================
  const recordHead = document.querySelector(
    ".panel#records .panel-head"
  );
  const recordList = $("transferRecords");

  function renderTransferRecords() {
    if (!recordList) return;

    let list = JSON.parse(localStorage.getItem("kib_tx") || "[]");

    // fallback (if no history yet)
    if (!list.length) {
      const fallback = JSON.parse(
        localStorage.getItem("kib_selected_tx") || "null"
      );

      if (!fallback) {
        recordList.innerHTML =
          `<div class="empty">No transactions yet</div>`;
        return;
      }

      list = [fallback];
    }

    recordList.innerHTML = list
      .map((tx, i) => {
        const amountClass =
          (tx.amount || "").startsWith("-")
            ? "debit"
            : "credit";

        return `
          <div class="record" data-index="${i}">
            
            <div class="record-top">
              <div class="record-bank">${tx.title || ""}</div>
              <div class="record-status">${tx.status || ""}</div>
            </div>

            <div class="record-mid ${amountClass}">
              ${tx.amount || ""}
            </div>

            <div class="record-bot">
              ${tx.bank || ""} • ${tx.date || ""} • ${tx.time || ""}
            </div>

            <div class="record-bot">
              ${tx.subtitle || ""}
            </div>

          </div>
        `;
      })
      .join("");

    // click → open receipt
    recordList.onclick = (e) => {
      const item = e.target.closest(".record");
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

  // =========================
  // Animation (stagger)
  // =========================
  function animateIn() {
    if (!recordList) return;

    const cards = Array.from(
      recordList.querySelectorAll(".record")
    );

    cards.forEach((c, i) => {
      c.style.opacity = "0";
      c.style.transform = "translateY(-6px)";
      c.style.animation = "fadeInUp .35s ease forwards";
      c.style.animationDelay = `${i * 90}ms`;
    });
  }

  // =========================
  // Toggle open/close records
  // =========================
  if (recordHead && recordList) {
    recordHead.style.cursor = "pointer";
    let open = true;

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

    // initial render
    renderTransferRecords();
    recordList.hidden = false;
    animateIn();

    recordHead.addEventListener("click", () => {
      open ? closeRecords() : openRecords();
    });
  }
});
