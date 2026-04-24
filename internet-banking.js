// ===============================
// KIB INTERNET BANKING JS (FINAL FIXED)
// ===============================

// ---------- HELPERS ----------
const $ = (id) => document.getElementById(id);

// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://wkhlshjwpjnhpwcfvdqv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UyqL5TtlTGVXVeUGeEseCw_QLaujK2V";

const REDIRECT_URL = "https://stevensprimerealty-art.github.io/KIB/dashboard.html";

// 🔒 LOGIN RESTRICTIONS (same as main site)
const ALLOWED_EMAIL = "kimdaehyun241@gmail.com";
const ALLOWED_ID = "KIB-DH26887";
const ALLOWED_PASSWORD = "XRZ?KADAS";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);

// ===============================
// AUTO LOGIN CHECK (AFTER MAGIC LINK)
// ===============================
setTimeout(async () => {
  const { data } = await supabase.auth.getSession();

  if (data?.session) {
    window.location.replace("dashboard.html");
  }
}, 300);

// ===============================
// LOGIN (MAGIC LINK + VALIDATION)
// ===============================
const form = $("loginForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("email")?.value.trim().toLowerCase();
  const id = $("userId")?.value.trim();
  const pw = $("password")?.value.trim();
  const msg = $("msg");

  if (!email) {
    msg.textContent = "Enter your email";
    return;
  }

  // 🔒 STRICT SECURITY CHECKS
  if (email !== ALLOWED_EMAIL) {
    msg.textContent = "This email is not allowed.";
    return;
  }

  if (id !== ALLOWED_ID || pw !== ALLOWED_PASSWORD) {
    msg.textContent = "Invalid ID or password.";
    return;
  }

  msg.textContent = "Sending login link...";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: REDIRECT_URL
    }
  });

  if (error) {
    msg.textContent = "❌ " + error.message;
  } else {
    msg.textContent = "✅ Check your email and tap the login link";
  }
});

// ===============================
// PASSWORD TOGGLE
// ===============================
const togglePw = $("togglePw");
const password = $("password");

togglePw?.addEventListener("click", () => {
  if (!password) return;

  const isHidden = password.type === "password";
  password.type = isHidden ? "text" : "password";
  togglePw.textContent = isHidden ? "🙈" : "👁️";
});

// ===============================
// SAVE ID (LOCAL STORAGE)
// ===============================
const saveId = $("saveId");
const userId = $("userId");

// load saved ID
const saved = localStorage.getItem("kib_saved_id");
if (saved && userId && saveId) {
  userId.value = saved;
  saveId.checked = true;
}

// save on change
saveId?.addEventListener("change", () => {
  const v = userId.value.trim();
  if (saveId.checked && v) {
    localStorage.setItem("kib_saved_id", v);
  } else {
    localStorage.removeItem("kib_saved_id");
  }
});

userId?.addEventListener("input", () => {
  if (saveId?.checked) {
    localStorage.setItem("kib_saved_id", userId.value.trim());
  }
});

// ===============================
// DRAWER MENU (HAMBURGER)
// ===============================
const drawer = $("drawer");
const backdrop = $("backdrop");
const menuBtn = $("menuBtn");
const closeBtn = $("closeBtn");

menuBtn?.addEventListener("click", () => {
  drawer?.classList.add("is-open");
  if (backdrop) backdrop.hidden = false;
  menuBtn.setAttribute("aria-expanded", "true");
});

closeBtn?.addEventListener("click", closeDrawer);
backdrop?.addEventListener("click", closeDrawer);

function closeDrawer() {
  drawer?.classList.remove("is-open");
  if (backdrop) backdrop.hidden = true;
  menuBtn?.setAttribute("aria-expanded", "false");
}

// ===============================
// ACCORDION MENU (DRAWER)
// ===============================
document.querySelectorAll("[data-accordion]").forEach((btn) => {
  btn.addEventListener("click", () => {

    const key = btn.dataset.accordion;
    const panel = document.querySelector(`[data-panel="${key}"]`);
    if (!panel) return;

    const isOpen = btn.classList.contains("is-open");

    // close all
    document.querySelectorAll("[data-accordion]").forEach(b => {
      b.classList.remove("is-open");
    });

    document.querySelectorAll("[data-panel]").forEach(p => {
      p.style.maxHeight = null;
    });

    // open selected
    if (!isOpen) {
      btn.classList.add("is-open");
      panel.style.maxHeight = panel.scrollHeight + "px";
    }
  });
});

// ===============================
// ESC KEY CLOSE DRAWER
// ===============================
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeDrawer();
});
