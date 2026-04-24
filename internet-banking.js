// ===============================
// KIB INTERNET BANKING JS (FINAL)
// ===============================

// ---------- HELPERS ----------
const $ = (id) => document.getElementById(id);

// ===============================
// SUPABASE CONFIG
// ===============================
const SUPABASE_URL = "https://wkhlshjwpjnhpwcfvdqv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_UyqL5TtlTGVXVeUGeEseCw_QLaujK2V";

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
// AUTO LOGIN CHECK
// ===============================
(async () => {
  const { data } = await supabase.auth.getSession();

  // already logged in → go dashboard
  if (data?.session) {
    window.location.replace("dashboard.html");
  }
})();

// ===============================
// LOGIN (MAGIC LINK)
// ===============================
const form = $("loginForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = $("email")?.value.trim();
  const msg = $("msg");

  if (!email) {
    msg.textContent = "Enter your email";
    return;
  }

  msg.textContent = "Sending login link...";

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + "/KIB/dashboard.html"
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
// DRAWER MENU (HAMBURGER)
// ===============================
const drawer = $("drawer");
const backdrop = $("backdrop");
const menuBtn = $("menuBtn");
const closeBtn = $("closeBtn");

menuBtn?.addEventListener("click", () => {
  drawer?.classList.add("is-open");
  if (backdrop) backdrop.hidden = false;
});

closeBtn?.addEventListener("click", closeDrawer);
backdrop?.addEventListener("click", closeDrawer);

function closeDrawer() {
  drawer?.classList.remove("is-open");
  if (backdrop) backdrop.hidden = true;
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
