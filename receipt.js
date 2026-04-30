// -------------------------
// Load transaction from localStorage
// -------------------------
const data = JSON.parse(localStorage.getItem("kib_selected_tx"));

// -------------------------
// Safety check
// -------------------------
if (!data) {
  document.body.innerHTML = "<p style='text-align:center;margin-top:40px;'>No receipt data found</p>";
}

// -------------------------
// Fill receipt fields
// -------------------------
document.getElementById("r_amount").textContent = data?.amount || "";
document.getElementById("r_title").textContent = data?.title || "";
document.getElementById("r_bank").textContent = data?.bank || "";
document.getElementById("r_date").textContent = data?.date || "";
document.getElementById("r_time").textContent = data?.time || "";
document.getElementById("r_ref").textContent = data?.reference || "";
document.getElementById("r_status").textContent = data?.status || "Successful";
