const all = document.getElementById("allTx");

const transactions = [
  { date:"22 Feb 2026", bank:"UniCredit", amount:"₩330,530,596", time:"11:37", status:"Successful" },
  { date:"21 Feb 2026", bank:"Intesa Sanpaolo", amount:"₩530,000,000", time:"10:04", status:"Successful" },
  { date:"20 Feb 2026", bank:"UniCredit", amount:"₩400,000,000", time:"13:06", status:"Successful" },
];

all.innerHTML = transactions.map(t => `
  <div class="item">
    <div class="left">
      <div class="title">${t.bank} — Transfer</div>
      <div class="meta">${t.date} • ${t.time}</div>
    </div>
    <div class="right">
      <div class="amount">${t.amount}</div>
      <div class="status">${t.status}</div>
    </div>
  </div>
`).join("");
