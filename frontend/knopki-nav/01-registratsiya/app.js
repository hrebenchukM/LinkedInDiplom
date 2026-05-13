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

function showResult(ok, payload) {
  output.textContent = JSON.stringify(payload, null, 2);
  statusPill.classList.remove("ok", "err");
  statusPill.classList.add(ok ? "ok" : "err");
  statusPill.textContent = ok ? "Успешно" : "Ошибка";
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
  const username = registeredAccount?.userName;
  const target = username || email;
  successHint.textContent = `Аккаунт ${target} создан. Следующий шаг: заполнить профиль пользователя.`;
  formState.classList.add("hidden");
  successState.classList.remove("hidden");
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  submitBtn.disabled = true;
  submitBtn.textContent = "Создание...";
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
    showResult(false, { error: "Не удалось выполнить запрос", details: String(error) });
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Создать аккаунт";
  }
});

continueBtn.addEventListener("click", () => {
  if (registeredAccount) {
    localStorage.setItem("registeredAccount", JSON.stringify(registeredAccount));
  }
  window.location.href = "../07-profil/index.html";
});

againBtn.addEventListener("click", () => {
  registeredAccount = null;
  registerForm.reset();
  successState.classList.add("hidden");
  formState.classList.remove("hidden");
  statusPill.classList.remove("ok", "err");
  statusPill.textContent = "Готово";
});
