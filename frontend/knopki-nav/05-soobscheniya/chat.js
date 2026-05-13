(function () {
  const params = new URLSearchParams(window.location.search);
  const peer = params.get("with");

  const presets = {
    marcus: {
      name: "Marcus Dias",
      seed: "MarcusDias",
      phone: "+880 789 569 895",
      email: "MarcusAntonioDias@gmail.com",
      web: "www.marcusdias.com",
    },
    alena: {
      name: "Alena Curtis",
      seed: "Alena",
      phone: "+1 415 555 0192",
      email: "alena.curtis@example.com",
      web: "www.alenacurtis.design",
    },
    abram: {
      name: "Abram Lipshutz",
      seed: "Abram",
      phone: "+44 20 7946 0958",
      email: "abram.l@example.com",
      web: "www.abramlipshutz.io",
    },
  };

  const key = peer && presets[peer.toLowerCase()] ? peer.toLowerCase() : "marcus";
  const p = presets[key];

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.seed)}`;

  const threadAvatar = document.getElementById("threadAvatar");
  const profileAvatar = document.getElementById("profileAvatar");
  if (threadAvatar) threadAvatar.src = avatarUrl;
  if (profileAvatar) profileAvatar.src = avatarUrl;

  document.querySelectorAll(".chat-msg--in .chat-msg__avatar").forEach((img) => {
    img.src = avatarUrl;
  });

  const threadName = document.getElementById("threadName");
  const profileName = document.getElementById("profileName");
  if (threadName) threadName.textContent = p.name;
  if (profileName) profileName.textContent = p.name;

  const phoneEl = document.getElementById("profilePhone");
  const emailEl = document.getElementById("profileEmail");
  const webEl = document.getElementById("profileWeb");
  if (phoneEl) phoneEl.textContent = p.phone;
  if (emailEl) {
    emailEl.textContent = p.email;
    emailEl.href = `mailto:${p.email}`;
  }
  if (webEl) webEl.textContent = p.web;

  document.querySelectorAll(".chat-list__item").forEach((btn) => {
    const nameEl = btn.querySelector(".chat-list__item-name");
    const text = nameEl ? nameEl.textContent.replace(/\d+/g, "").trim() : "";
    if (text === p.name) btn.classList.add("chat-list__item--active");
    else btn.classList.remove("chat-list__item--active");
  });

  document.querySelectorAll(".chat-list__item[data-peer]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-peer");
      if (!id) return;
      window.location.href = `./index.html?with=${encodeURIComponent(id)}`;
    });
  });

  const scrollEl = document.getElementById("threadScroll");
  const endEl = document.getElementById("threadEnd");
  const form = document.getElementById("chatCompose");
  const input = document.getElementById("chatInput");

  function scrollThreadToBottom() {
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  scrollThreadToBottom();

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function appendOutgoing(text) {
    if (!scrollEl || !endEl) return;
    const wrap = document.createElement("div");
    wrap.className = "chat-msg chat-msg--out";
    wrap.innerHTML = `
      <div>
        <div class="chat-msg__bubble">${esc(text)}</div>
        <div class="chat-msg__time">Just now</div>
      </div>
    `;
    scrollEl.insertBefore(wrap, endEl);
    scrollThreadToBottom();
  }

  if (form && input) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      appendOutgoing(text);
      input.value = "";
      input.focus();
    });
  }
})();
