document.querySelectorAll(".toggle-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const cardSection = btn.closest(".card-section");
    const card = cardSection.querySelector(".bank-card");

    const isActive = btn.classList.toggle("active");

    // Update button text
    btn.textContent = isActive ? "Card Enabled" : "Card Disabled";

    // Accessibility state
    btn.setAttribute("aria-pressed", isActive);

    // Visual card state
    if (isActive) {
      card.classList.remove("disabled");
    } else {
      card.classList.add("disabled");
    }
  });
});
