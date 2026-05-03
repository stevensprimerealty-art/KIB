window.addEventListener("DOMContentLoaded", () => {

  // -------------------------
  // Elements
  // -------------------------
  const all = document.getElementById("allTx");
  if (!all) return;

  // -------------------------
  // Load transactions (PRIMARY: ALL HISTORY)
  // -------------------------
  let transactions = JSON.parse(localStorage.getItem("kib_all_tx") || "[]");

  // -------------------------
  // Fallback 1: selected transaction
  // -------------------------
  if (!transactions.length) {
    const selected = JSON.parse(localStorage.getItem("kib_selected_tx") || "null");
    if (selected) {
      transactions = [selected];
    }
  }

  // -------------------------
  // Fallback 2: default demo
  // -------------------------
  if (!transactions.length) {
    transactions = [
      {
        title: "Incoming SWIFT Transfer",
        bank: "Korea Investment Bank",
        amount: "+$882,000.00",
        date: "04 May 2026",
        time: "10:42",
        status: "Restricted",
        subtitle: "Administrative release (under compliance review)"
      }
    ];
  }

  // -------------------------
  // Render function
  // -------------------------
  function render(list) {
    all.innerHTML = list.map((t, i) => {

      const title = t.title || t.bank || "";
      const bank = t.bank || "";
      const date = t.date || "";
      const time = t.time || "";
      const subtitle = t.subtitle || "";
      const status = t.status || "";

      const amount = t.amount || "$0.00";
      const amountClass = amount.startsWith("+") ? "credit" : "debit";

      return `
        <div class="item" data-index="${i}">
          
          <div class="left">
            <div class="title">${title}</div>

            <div class="meta">
              ${bank} • ${date} • ${time}
            </div>

            <div class="sub">
              ${subtitle}
            </div>
          </div>

          <div class="right">
            <div class="amount ${amountClass}">
              ${amount}
            </div>

            <div class="status">
              ${status}
            </div>
          </div>

        </div>
      `;
    }).join("");
  }

  render(transactions);

  // -------------------------
  // Click → open receipt
  // -------------------------
  all.addEventListener("click", (e) => {
    const item = e.target.closest(".item");
    if (!item) return;

    const i = Number(item.dataset.index);
    if (!transactions[i]) return;

    // save selected
    localStorage.setItem(
      "kib_selected_tx",
      JSON.stringify(transactions[i])
    );

    window.location.href = "receipt.html";
  });

});
