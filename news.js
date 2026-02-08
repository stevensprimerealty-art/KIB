// news.js — shared across news1/news2/news3/news4

window.addEventListener("DOMContentLoaded", () => {
  // Language pills (UI-only)
  const langBtns = document.querySelectorAll("[data-lang]");
  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      langBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

  // Footer accordion behavior (same on all pages)
  const accButtons = document.querySelectorAll(".acc-btn");
  accButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".acc-item");
      const panel = item?.querySelector(".acc-panel");
      const expanded = btn.getAttribute("aria-expanded") === "true";

      // close all
      accButtons.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const it = b.closest(".acc-item");
        it?.querySelector(".acc-panel")?.setAttribute("hidden", "");
      });

      // open this if it was closed
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        panel?.removeAttribute("hidden");
      }
    });
  });

  // Open the first accordion section by default (optional)
  const first = document.querySelector(".acc-btn");
  if (first) first.click();
});
