const all = document.getElementById("allTx");

// ✅ Get real transaction from dashboard click
const selected = JSON.parse(localStorage.getItem("kib_selected_tx") || "null");

// ✅ Fallback (if user opened page directly)
const transactions = selected ? [selected] : [
  {
    title: "Cash Deposit",
    bank: "Korea Investment Bank",
    amount: "+$848,552.00",
    date: "04 May 2026",
    time: "10:42",
    status: "Successful",
    subtitle: "Branch Cash Deposit"
  }
];

all.innerHTML = transactions.map(t => `
  <div class="item">
    <div class="left">
      <div class="title">${t.title || t.bank}</div>
      <div class="meta">${t.bank} • ${t.date} • ${t.time}</div>
      <div class="sub">${t.subtitle || ""}</div>
    </div>

    <div class="right">
      <div class="amount ${
        (t.amount || "").startsWith("+") ? "credit" : "debit"
      }">
        ${t.amount}
      </div>
      <div class="status">${t.status}</div>
    </div>
  </div>
`).join("");
