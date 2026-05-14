const output = document.getElementById("output");
const statusPill = document.getElementById("statusPill");
const registerForm = document.getElementById("registerForm");
const formState = document.getElementById("formState");
const successState = document.getElementById("successState");
const successHint = document.getElementById("successHint");
const continueBtn = document.getElementById("continueBtn");
const againBtn = document.getElementById("againBtn");
const submitBtn = document.getElementById("submitBtn");

const API_BASE_URL = "http://localhost:5000";
let registeredAccount = null;
let lastRegisterEmail = "";
let lastPillKind = "ready";

function T(key) {
  return typeof window.uiT === "function" ? window.uiT(key) : key;
}

function Tmpl(key, vars) {
  return typeof window.uiTmpl === "function" ? window.uiTmpl(key, vars) : key;
}

function showResult(ok, payload) {
  output.textContent = JSON.stringify(payload, null, 2);
  statusPill.classList.remove("ok", "err");
  statusPill.classList.add(ok ? "ok" : "err");
  lastPillKind = ok ? "ok" : "err";
  statusPill.textContent = ok ? T("reg.ok") : T("reg.err");
}

function refreshSuccessHint() {
  if (!successHint || successState.classList.contains("hidden")) return;
  const username = registeredAccount?.userName;
  const target = username || lastRegisterEmail;
  successHint.removeAttribute("data-i18n");
  successHint.textContent = Tmpl("reg.successHintNamed", { target });
}

function refreshRegisterUiStrings() {
  if (lastPillKind === "ok") statusPill.textContent = T("reg.ok");
  else if (lastPillKind === "err") statusPill.textContent = T("reg.err");
  else statusPill.textContent = T("reg.statusReady");

  if (submitBtn && !submitBtn.disabled) {
    submitBtn.textContent = T("reg.submit");
  }
  refreshSuccessHint();
}

async function apiPost(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
}

function showSuccess(data, email) {
  registeredAccount = data?.data?.account ?? null;
  lastRegisterEmail = email || "";
  successHint.removeAttribute("data-i18n");
  refreshSuccessHint();
  formState.classList.add("hidden");
  successState.classList.remove("hidden");
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = T("reg.submitting");
  const formData = new FormData(registerForm);
  const email = String(formData.get("email") ?? "").trim();
  const body = {
    email,
    userName: String(formData.get("userName") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    firstName: String(formData.get("firstName") ?? "").trim() || null,
    lastName: String(formData.get("lastName") ?? "").trim() || null,
  };

  try {
    const response = await apiPost("/api/auth/register", body);
    showResult(response.ok, response);

    if (response.ok && response?.data?.success) {
      showSuccess(response, email);
    }
  } catch (error) {
    showResult(false, { error: T("reg.fetchErr"), details: String(error) });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = T("reg.submit");
  }
});

continueBtn.addEventListener("click", () => {
  if (registeredAccount) {
    localStorage.setItem("registeredAccount", JSON.stringify(registeredAccount));
  }
  window.location.href = "./profile.html";
});

againBtn.addEventListener("click", () => {
  registeredAccount = null;
  lastRegisterEmail = "";
  registerForm.reset();
  successState.classList.add("hidden");
  formState.classList.remove("hidden");
  statusPill.classList.remove("ok", "err");
  lastPillKind = "ready";
  statusPill.textContent = T("reg.statusReady");
  successHint.setAttribute("data-i18n", "reg.successHint");
  successHint.textContent = T("reg.successHint");
});

document.addEventListener("uilangchange", refreshRegisterUiStrings);
