import { AI_ASSISTANT_PEER_ID } from "../../shared/constants/aiAssistant";

/** Quick prompts and canned replies for the local AI Assistant chat (no backend). */

const COMMANDS = [
  {
    id: "help",
    triggers: ["help", "?", "commands", "команди", "команды", "допомога", "помощь", "hilfe", "ayuda"],
    action: null,
    reply: {
      en: "Commands:\n• help — this list\n• home / home-page / хом / ух — open Home\n• profile — open Profile\n• network — open Network\n• vacancies / jobs — open Vacancies\n• chat — open Messages\n\nYou can also tap the chips below or ask a question in plain words.",
      uk: "Команди:\n• help — цей список\n• home / home-page / хом / ух — головна (Home)\n• profile — профіль\n• network — мережа\n• vacancies / jobs — вакансії\n• chat — повідомлення\n\nТакож можна натиснути кнопки нижче або задати питання звичайними словами.",
      ru: "Команды:\n• help — этот список\n• home / home-page / хом / ух — главная\n• profile — профиль\n• network — сеть\n• vacancies / jobs — вакансии\n• chat — сообщения\n\nИли нажмите кнопки ниже / задайте вопрос своими словами.",
      es: "Comandos:\n• help — esta lista\n• home / home-page — inicio\n• profile — perfil\n• network — red\n• vacancies / jobs — vacantes\n• chat — mensajes",
      de: "Befehle:\n• help — diese Liste\n• home / home-page — Startseite\n• profile — Profil\n• network — Netzwerk\n• vacancies / jobs — Stellen\n• chat — Nachrichten",
    },
  },
  {
    id: "home",
    triggers: [
      "home",
      "home page",
      "home-page",
      "homepage",
      "хом",
      "ух",
      "головна",
      "главная",
      "inicio",
      "start",
    ],
    action: { type: "navigate", path: "/home" },
    reply: {
      en: "Opening Home — your feed and post composer.",
      uk: "Відкриваю головну — стрічка та створення постів.",
      ru: "Открываю главную — лента и создание постов.",
      es: "Abriendo Inicio — tu feed y publicaciones.",
      de: "Öffne Startseite — Feed und Beiträge.",
    },
  },
  {
    id: "profile",
    triggers: ["profile", "профіль", "профиль", "perfil", "profil"],
    action: { type: "navigate", path: "/profile" },
    reply: {
      en: "Opening Profile — edit your info and avatar.",
      uk: "Відкриваю профіль — редагування даних та аватара.",
      ru: "Открываю профиль — данные и аватар.",
      es: "Abriendo Perfil.",
      de: "Öffne Profil.",
    },
  },
  {
    id: "network",
    triggers: ["network", "мережа", "сеть", "contacts", "контакти", "контакты", "red"],
    action: { type: "navigate", path: "/network" },
    reply: {
      en: "Opening Network — contacts and invitations.",
      uk: "Відкриваю мережу — контакти та запрошення.",
      ru: "Открываю сеть — контакты и приглашения.",
      es: "Abriendo Red.",
      de: "Öffne Netzwerk.",
    },
  },
  {
    id: "vacancies",
    triggers: [
      "vacancies",
      "vacancy",
      "jobs",
      "job",
      "вакансії",
      "вакансии",
      "робота",
      "работа",
      "stellen",
      "empleo",
    ],
    action: { type: "navigate", path: "/vacancies" },
    reply: {
      en: "Opening Vacancies — search and apply for jobs.",
      uk: "Відкриваю вакансії — пошук та відгуки.",
      ru: "Открываю вакансии — поиск и отклики.",
      es: "Abriendo Vacantes.",
      de: "Öffne Stellen.",
    },
  },
  {
    id: "chat",
    triggers: ["chat", "messages", "message", "чат", "повідомлення", "сообщения", "nachrichten"],
    action: { type: "navigate", path: "/chat" },
    reply: {
      en: "You are already in Messages. Pick a chat on the left or use commands to go elsewhere.",
      uk: "Ви вже в повідомленнях. Оберіть чат зліва або команду для переходу.",
      ru: "Вы уже в сообщениях. Выберите чат слева или команду для перехода.",
      es: "Ya estás en Mensajes.",
      de: "Sie sind bereits in Nachrichten.",
    },
  },
];

const PROMPTS = [
  {
    id: "profile",
    keywords: ["profile", "profil", "профіл", "профиль", "avatar", "аватар", "headline"],
    user: {
      en: "How do I set up my profile?",
      uk: "Як заповнити профіль?",
      ru: "Как заполнить профиль?",
      es: "¿Cómo configurar mi perfil?",
      de: "Wie richte ich mein Profil ein?",
    },
    reply: {
      en: "Open Profile in the top menu. Add your name, headline, city, and about text, then save. You can upload an avatar there too — it syncs with the backend after login.",
      uk: "Відкрийте «Профіль» у верхньому меню. Заповніть ім’я, заголовок, місто та «Про себе», потім збережіть. Там же можна завантажити аватар — після входу дані зберігаються на сервері.",
      ru: "Откройте «Профиль» в верхнем меню. Заполните имя, заголовок, город и «О себе», затем сохраните. Там же можно загрузить аватар — после входа данные сохраняются на сервере.",
      es: "Abre Perfil en el menú superior. Completa nombre, titular, ciudad y descripción, luego guarda. También puedes subir un avatar; tras iniciar sesión se sincroniza con el servidor.",
      de: "Öffnen Sie „Profil“ im oberen Menü. Tragen Sie Name, Überschrift, Stadt und „Über mich“ ein und speichern Sie. Dort können Sie auch einen Avatar hochladen — nach dem Login wird er mit dem Server synchronisiert.",
    },
  },
  {
    id: "network",
    keywords: ["network", "contact", "connect", "мереж", "контакт", "зв'яз", "связ"],
    user: {
      en: "How do I grow my network?",
      uk: "Як розширити мережу контактів?",
      ru: "Как расширить сеть контактов?",
      es: "¿Cómo ampliar mi red?",
      de: "Wie erweitere ich mein Netzwerk?",
    },
    reply: {
      en: "Go to Network to see your contacts and pending invitations. Accept incoming requests or send new ones. Accepted contacts appear in your list — use messages to stay in touch.",
      uk: "Перейдіть у «Мережа»: там контакти та запрошення. Приймайте вхідні або надсилайте нові. Прийняті контакти з’являться в списку — спілкуйтесь у повідомленнях.",
      ru: "Откройте «Сеть»: там контакты и приглашения. Принимайте входящие или отправляйте новые. Принятые контакты появятся в списке — общайтесь в сообщениях.",
      es: "Ve a Red para ver contactos e invitaciones pendientes. Acepta solicitudes o envía nuevas. Los contactos aceptados aparecen en la lista.",
      de: "Öffnen Sie „Netzwerk“ für Kontakte und offene Einladungen. Nehmen Sie Anfragen an oder senden Sie neue. Angenommene Kontakte erscheinen in der Liste.",
    },
  },
  {
    id: "jobs",
    keywords: ["job", "vacanc", "apply", "ваканс", "робот", "работ"],
    user: {
      en: "How do I find and apply for jobs?",
      uk: "Як знайти вакансії та відгукнутись?",
      ru: "Как найти вакансии и откликнуться?",
      es: "¿Cómo buscar empleo y aplicar?",
      de: "Wie finde ich Jobs und bewerbe mich?",
    },
    reply: {
      en: "Open Vacancies, use filters (role, location, salary), and click Apply on a listing. You can save favorites with the bookmark button. Your applications are tracked in the activity section.",
      uk: "Відкрийте «Вакансії», скористайтесь фільтрами та натисніть «Відгукнутись». Обране зберігайте кнопкою закладки. Відгуки видно в розділі активності.",
      ru: "Откройте «Вакансии», используйте фильтры и нажмите «Откликнуться». Избранное — кнопка закладки. Отклики видны в разделе активности.",
      es: "Abre Vacantes, usa filtros y pulsa Aplicar. Guarda favoritos con el marcador. Tus solicitudes están en actividad.",
      de: "Öffnen Sie „Stellen“, nutzen Sie Filter und klicken Sie auf Bewerben. Favoriten speichern Sie mit dem Lesezeichen. Bewerbungen finden Sie unter Aktivität.",
    },
  },
  {
    id: "posts",
    keywords: ["post", "feed", "пост", "стріч", "лента", "публікац"],
    user: {
      en: "How do I publish a post?",
      uk: "Як опублікувати пост?",
      ru: "Как опубликовать пост?",
      es: "¿Cómo publicar una entrada?",
      de: "Wie veröffentliche ich einen Beitrag?",
    },
    reply: {
      en: "On Home, write in the composer (text, photo, or video) and click Publish. After login, your posts are stored on the server and appear in your feed.",
      uk: "На головній сторінці напишіть у полі створення поста (текст, фото чи відео) і натисніть «Опублікувати». Після входу пости зберігаються на сервері.",
      ru: "На главной странице напишите в поле создания поста и нажмите «Опубликовать». После входа посты сохраняются на сервере.",
      es: "En Inicio escribe en el compositor y publica. Tras iniciar sesión, las publicaciones se guardan en el servidor.",
      de: "Auf der Startseite im Editor schreiben und veröffentlichen. Nach dem Login werden Beiträge auf dem Server gespeichert.",
    },
  },
  {
    id: "notifications",
    keywords: ["notif", "bell", "сповіщ", "уведом"],
    user: {
      en: "What are notifications for?",
      uk: "Навіщо потрібні сповіщення?",
      ru: "Зачем нужны уведомления?",
      es: "¿Para qué sirven las notificaciones?",
      de: "Wofür sind Benachrichtigungen?",
    },
    reply: {
      en: "The bell icon in the header shows updates: messages, profile views, and job activity. Click an item to open the related page; unread items are highlighted.",
      uk: "Іконка дзвіночка у шапці показує оновлення: повідомлення, перегляди профілю, активність по вакансіях. Натисніть пункт, щоб перейти на сторінку.",
      ru: "Колокольчик в шапке показывает обновления: сообщения, просмотры профиля, вакансии. Нажмите пункт, чтобы перейти на страницу.",
      es: "El icono de campana muestra novedades: mensajes, visitas al perfil y empleo. Pulsa un elemento para abrir la página.",
      de: "Die Glocke in der Kopfzeile zeigt Updates: Nachrichten, Profilbesuche und Jobs. Klicken Sie einen Eintrag an, um die Seite zu öffnen.",
    },
  },
];

const DEFAULT_REPLY = {
  en: "Type help for commands, or try: home-page, profile, network, vacancies. You can also tap the chips below.",
  uk: "Введіть help для списку команд, або: home-page, profile, network, vacancies. Також кнопки нижче.",
  ru: "Введите help для списка команд, или: home-page, profile, network, vacancies. Или кнопки ниже.",
  es: "Escribe help para comandos, o: home-page, profile, network, vacancies.",
  de: "help für Befehle, oder: home-page, profile, network, vacancies.",
};

/** Short labels shown as command chips in the chat UI. */
const COMMAND_CHIPS = [
  { id: "help", text: "help" },
  { id: "home", text: "home-page" },
  { id: "profile", text: "profile" },
  { id: "network", text: "network" },
  { id: "vacancies", text: "vacancies" },
];

function pickLang(lang) {
  const code = String(lang || "en").toLowerCase().slice(0, 2);
  return PROMPTS[0].user[code] !== undefined ? code : "en";
}

function normalizeInput(text) {
  return String(text || "")
    .trim()
    .toLowerCase()
    .replace(/^\/+/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function matchCommand(userText) {
  const normalized = normalizeInput(userText);
  if (!normalized) return null;

  for (const command of COMMANDS) {
    if (command.triggers.includes(normalized)) return command;
  }
  return null;
}

export function getAiCommandChips() {
  return COMMAND_CHIPS.map((chip) => ({ ...chip }));
}

export function getAiQuickPrompts(lang) {
  const code = pickLang(lang);
  return PROMPTS.map((p) => ({
    id: p.id,
    label: p.user[code] || p.user.en,
  }));
}

export function getAiUserTextForPrompt(promptId, lang) {
  const prompt = PROMPTS.find((p) => p.id === promptId);
  if (!prompt) return "";
  const code = pickLang(lang);
  return prompt.user[code] || prompt.user.en;
}

/**
 * @returns {{ text: string, action: { type: string, path?: string } | null }}
 */
export function resolveAiAssistantReply(userText, lang) {
  const code = pickLang(lang);
  const normalized = normalizeInput(userText);

  const command = matchCommand(userText);
  if (command) {
    let action = command.action || null;
    if (command.id === "chat" && action?.path === "/chat") {
      action = null;
    }
    return {
      text: command.reply[code] || command.reply.en,
      action,
    };
  }

  if (!normalized) {
    return { text: DEFAULT_REPLY[code] || DEFAULT_REPLY.en, action: null };
  }

  for (const prompt of PROMPTS) {
    const variants = Object.values(prompt.user).map((s) => normalizeInput(s));
    if (variants.includes(normalized)) {
      return { text: prompt.reply[code] || prompt.reply.en, action: null };
    }
    if (prompt.keywords.some((kw) => normalized.includes(kw))) {
      return { text: prompt.reply[code] || prompt.reply.en, action: null };
    }
  }

  return { text: DEFAULT_REPLY[code] || DEFAULT_REPLY.en, action: null };
}

export function isAiAssistantChat(chat) {
  if (!chat) return false;
  const canonical =
    typeof window !== "undefined" && typeof window.canonicalPeerId === "function"
      ? window.canonicalPeerId
      : (value) => String(value || "").trim().toLowerCase();
  const aiId = canonical(AI_ASSISTANT_PEER_ID);
  return canonical(chat.id) === aiId || canonical(chat.peer) === aiId;
}
