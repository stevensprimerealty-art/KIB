document.querySelectorAll(".toggle-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    btn.classList.toggle("active");

    if (btn.classList.contains("active")) {
      btn.textContent = "Card Enabled";
    } else {
      btn.textContent = "Card Disabled";
    }
  });
});
