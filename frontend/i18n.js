(function () {
  const STORAGE_KEY = "uiLang";

  const STRINGS = {
    "page.title.home": { en: "Home — LinkedIn analogue", ru: "Главная — LinkedIn-аналог" },
    "page.title.network": { en: "Network — LinkedIn analogue", ru: "Сеть — LinkedIn-аналог" },
    "page.title.vacancies": { en: "Jobs — LinkedIn analogue", ru: "Вакансии — LinkedIn-аналог" },
    "page.title.chat": { en: "Messages — LinkedIn analogue", ru: "Сообщения — LinkedIn-аналог" },
    "page.title.register": { en: "Registration — LinkedIn analogue", ru: "Регистрация — LinkedIn-аналог" },
    "page.title.profile": { en: "User profile", ru: "Профиль пользователя" },

    "nav.primary": { en: "Main navigation", ru: "Основное меню" },
    "nav.homeAria": { en: "Home", ru: "Главная" },
    "nav.search": { en: "Search", ru: "Поиск" },
    "nav.home": { en: "Home", ru: "Главная" },
    "nav.network": { en: "Network", ru: "Сеть" },
    "nav.vacancies": { en: "Jobs", ru: "Вакансии" },
    "nav.messagesAria": { en: "Messages", ru: "Сообщения" },
    "nav.messages": { en: "Messages", ru: "Сообщения" },
    "nav.notificationsAria": { en: "Notifications", ru: "Уведомления" },
    "nav.notifications": { en: "Notifications", ru: "Уведомления" },
    "nav.close": { en: "Close", ru: "Закрыть" },
    "panel.messagesTitle": { en: "Messages", ru: "Сообщения" },
    "panel.noChats": { en: "No chats yet.", ru: "Пока нет чатов." },
    "panel.notificationsTitle": { en: "Notifications", ru: "Уведомления" },
    "panel.unread": { en: "Unread", ru: "Непрочитанные" },
    "panel.noUnread": { en: "No unread notifications.", ru: "Непрочитанных уведомлений нет." },

    "theme.useDark": { en: "Switch to dark theme", ru: "Включить тёмную тему" },
    "theme.useLight": { en: "Switch to light theme", ru: "Включить светлую тему" },
    "theme.darkTitle": { en: "Dark theme", ru: "Тёмная тема" },
    "theme.lightTitle": { en: "Light theme", ru: "Светлая тема" },

    "user.myProfile": { en: "My profile", ru: "Мой профиль" },
    "profile.sidebarAria": { en: "Your profile", ru: "Ваш профиль" },
    "profile.contacts": { en: "Contacts", ru: "Контакты" },
    "profile.hint": { en: "Grow your contact network", ru: "Расширяйте сеть контактов" },
    "profile.saved": { en: "Saved", ru: "Сохранённое" },

    "feed.mainAria": { en: "Feed", ru: "Лента" },
    "feed.composerAria": { en: "Create post", ru: "Создать пост" },
    "feed.composerPlaceholder": {
      en: "What do you want to talk about?",
      ru: "О чём хотите рассказать?",
    },
    "feed.composerPostAria": { en: "Post text", ru: "Текст поста" },
    "feed.photo": { en: "Photo", ru: "Фото" },
    "feed.video": { en: "Video", ru: "Видео" },
    "feed.event": { en: "Event", ru: "Событие" },
    "feed.post": { en: "Post", ru: "Опубликовать" },
    "feed.like": { en: "Like", ru: "Нравится" },
    "feed.comment": { en: "Comment", ru: "Комментарий" },
    "feed.share": { en: "Share", ru: "Поделиться" },
    "feed.send": { en: "Send", ru: "Отправить" },
    "feed.removePreview": { en: "Remove image", ru: "Убрать фото" },
    "feed.commentsHeading": { en: "Comments", ru: "Комментарии" },
    "feed.noComments": { en: "No comments yet.", ru: "Пока нет комментариев." },
    "feed.commentPh": { en: "Write a comment…", ru: "Написать комментарий…" },
    "feed.commentPost": { en: "Reply", ru: "Ответить" },
    "feed.likeCountAria": { en: "Likes", ru: "Лайки" },
    "feed.deleteComment": { en: "Delete comment", ru: "Удалить комментарий" },
    "feed.demo1.sub": { en: "Product Designer · 2h ago", ru: "Product Designer · 2 ч назад" },
    "feed.demo1.text": {
      en: "“Good design is as little design as possible.” — Less, but better.",
      ru: "«Хороший дизайн — это как можно меньше дизайна». Меньше, но лучше.",
    },
    "feed.demo1.alt": { en: "UI example", ru: "Пример UI" },
    "feed.demo2.sub": { en: "Creative lead · 5h ago", ru: "Креативный лид · 5 ч назад" },
    "feed.demo2.text": {
      en: "Illustration vs graphic design: what to use in your next campaign.",
      ru: "Иллюстрация и графдизайн: когда что использовать в следующей кампании.",
    },
    "feed.demo2.alt": { en: "Team", ru: "Команда" },

    "widget.messagesAria": { en: "Messages", ru: "Сообщения" },
    "widget.title": { en: "Messages", ru: "Сообщения" },
    "widget.more": { en: "More", ru: "Ещё" },
    "widget.compose": { en: "Compose", ru: "Написать" },
    "widget.collapse": { en: "Collapse messages", ru: "Свернуть сообщения" },
    "widget.expand": { en: "Expand messages", ru: "Развернуть сообщения" },
    "widget.searchPh": { en: "Search messages", ru: "Поиск по сообщениям" },
    "widget.searchAria": { en: "Search messages", ru: "Поиск по сообщениям" },
    "widget.tabSorted": { en: "Sorted", ru: "Сортировка" },
    "widget.tabOther": { en: "Other", ru: "Другое" },
    "widget.empty": {
      en: "No messages yet. Contact a member and start a discussion.",
      ru: "Сообщений пока нет. Напишите участнику и начните обсуждение.",
    },
    "widget.cta": { en: "Send a message", ru: "Написать сообщение" },

    "footer.langHidden": { en: "Language", ru: "Язык" },
    "footer.langAria": { en: "Interface language", ru: "Язык интерфейса" },
    "footer.optRu": { en: "Russian", ru: "Русский" },
    "footer.optEn": { en: "English", ru: "English" },
    "footer.link1a": { en: "General information", ru: "Общая информация" },
    "footer.link1b": { en: "Careers", ru: "Карьера" },
    "footer.link1c": { en: "Ad settings", ru: "Настройки рекламы" },
    "footer.link1d": { en: "Security center", ru: "Центр безопасности" },
    "footer.link2a": { en: "Accessibility", ru: "Специальные возможности" },
    "footer.link2b": { en: "Privacy and terms", ru: "Конфиденциальность и условия" },
    "footer.link2c": { en: "Mobile app", ru: "Мобильное приложение" },
    "footer.link3a": { en: "Professional community policies", ru: "Правила профессионального сообщества" },
    "footer.link3b": { en: "Sales solutions", ru: "Решения для продаж" },
    "footer.link3c": { en: "Advertising solutions", ru: "Рекламные решения" },
    "footer.link4a": { en: "Questions?", ru: "Вопросы?" },
    "footer.link4b": { en: "Account and privacy", ru: "Аккаунт и конфиденциальность" },
    "footer.link4c": { en: "Recommendation transparency", ru: "Прозрачность рекомендаций" },

    "network.sidebarAria": { en: "Network menu", ru: "Меню сети" },
    "network.sidebarTitle": {
      en: "Manage your contact network",
      ru: "Управление сетью контактов",
    },
    "network.contacts": { en: "Contacts", ru: "Контакты" },
    "network.following": { en: "Following", ru: "Подписки" },
    "network.groups": { en: "Groups", ru: "Группы" },
    "network.events": { en: "Events", ru: "События" },
    "network.pages": { en: "Pages", ru: "Страницы" },
    "network.mainAria": { en: "Recommendations", ru: "Рекомендации" },
    "network.tabNew": { en: "New connections", ru: "Новые контакты" },
    "network.tabEvents": { en: "Events", ru: "События" },
    "network.peopleHeading": {
      en: "People in “UI/UX design” you may know",
      ru: "Люди в теме «UI/UX-дизайн», которых вы можете знать",
    },
    "network.connect": { en: "Connect", ru: "Добавить в контакты" },
    "network.sent": { en: "Request sent", ru: "Запрос отправлен" },
    "network.newChatPreview": {
      en: "Start the conversation…",
      ru: "Начните переписку…",
    },
    "network.eventsToolbar": { en: "Filter updates", ru: "Фильтр обновлений" },
    "network.evAll": { en: "All", ru: "Все" },
    "network.evCareer": { en: "Job changes", ru: "Смена работы" },
    "network.evBirth": { en: "Birthdays", ru: "Дни рождения" },
    "network.evEdu": { en: "Education", ru: "Образование" },
    "network.evTitle": { en: "No recent updates", ru: "Нет свежих обновлений" },
    "network.evText": {
      en: "As your network grows, updates will appear here.",
      ru: "Когда сеть контактов вырастет, здесь появятся новости.",
    },
    "network.evExpand": { en: "Grow your network", ru: "Расширить сеть контактов" },

    "vac.sidebarAria": { en: "Jobs menu", ru: "Меню вакансий" },
    "vac.params": { en: "Parameters", ru: "Параметры" },
    "vac.mine": { en: "My jobs", ru: "Мои вакансии" },
    "vac.post": { en: "Post a job", ru: "Разместить вакансию" },
    "vac.mainAria": { en: "Job listings", ru: "Список вакансий" },
    "vac.card1Title": { en: "Top job picks", ru: "Подборка лучших вакансий" },
    "vac.card1Sub": {
      en: "Based on your profile, settings, and activity.",
      ru: "С учётом профиля, настроек и активности: отклики, поиск и сохранения",
    },
    "vac.apply": { en: "Apply", ru: "Откликнуться" },
    "vac.dismiss": { en: "Dismiss", ru: "Скрыть" },
    "vac.showAll": { en: "Show all", ru: "Показать все" },
    "vac.queriesClose": { en: "Close", ru: "Закрыть" },
    "vac.queriesTitle": { en: "Suggested searches", ru: "Рекомендуемые поисковые запросы" },
    "vac.roleTitle": { en: "Graphic designer", ru: "Графический дизайнер" },
    "vac.roleSub": { en: "Remote · United States", ru: "Удалённо · США" },

    "chat.listAria": { en: "Chats", ru: "Чаты" },
    "chat.tabChats": { en: "Chats", ru: "Чаты" },
    "chat.tabArchive": { en: "Archived", ru: "Архив" },
    "chat.archiveChat": { en: "Move to archive", ru: "В архив" },
    "chat.unarchiveChat": { en: "Restore from archive", ru: "Вернуть из архива" },
    "chat.emptyArchive": { en: "No archived chats.", ru: "В архиве пока никого." },
    "chat.emptyInboxAll": { en: "All chats are archived. Open Archive to see them.", ru: "Все чаты в архиве. Откройте вкладку «Архив», чтобы увидеть их." },
    "chat.emptySearch": { en: "No chats match your search.", ru: "По запросу ничего не найдено." },
    "chat.emptyThreadHint": {
      en: "No messages yet. Write the first one below.",
      ru: "Сообщений пока нет. Напишите первым ниже.",
    },
    "chat.searchPh": { en: "Search", ru: "Поиск" },
    "chat.searchAria": { en: "Search chats", ru: "Поиск в чатах" },
    "chat.threadAria": { en: "Conversation", ru: "Переписка" },
    "chat.online": { en: "Active now", ru: "В сети" },
    "chat.call": { en: "Call", ru: "Позвонить" },
    "chat.searchThread": { en: "Search in chat", ru: "Поиск в чате" },
    "chat.more": { en: "More", ru: "Ещё" },
    "chat.deletePeer": { en: "Remove contact from chats", ru: "Удалить собеседника" },
    "chat.deletePeerConfirm": {
      en: "Remove this chat from the list? You can add the person again from the network page.",
      ru: "Удалить этот чат из списка? Его можно снова добавить со страницы «Сеть».",
    },
    "chat.divider": { en: "New messages", ru: "Новые сообщения" },
    "chat.inputPh": { en: "Write a message…", ru: "Напишите сообщение…" },
    "chat.inputAria": { en: "Message text", ru: "Текст сообщения" },
    "chat.emoji": { en: "Emoji", ru: "Эмодзи" },
    "chat.attach": { en: "Attach file", ru: "Вложение" },
    "chat.profileAria": { en: "Contact profile", ru: "Профиль контакта" },
    "chat.phone": { en: "Phone", ru: "Телефон" },
    "chat.email": { en: "Email", ru: "Электронная почта" },
    "chat.position": { en: "Current role", ru: "Текущая должность" },
    "chat.positionVal": {
      en: "Senior Design Manager · Microsoft, 2022 — present (3 years)",
      ru: "Senior Design Manager · Microsoft, 2022 — сейчас (3 года)",
    },
    "chat.edu": { en: "Education", ru: "Образование" },
    "chat.eduVal": { en: "University of Texas, Austin — BFA Design", ru: "University of Texas, Austin — BFA Design" },
    "chat.birth": { en: "Birth date", ru: "Дата рождения" },
    "chat.birthVal": { en: "10 June 1994", ru: "10 июня 1994" },
    "chat.site": { en: "Website", ru: "Сайт" },
    "chat.previewMarcus": { en: "Sounds great, see you then!", ru: "Отлично, тогда до встречи!" },
    "chat.previewAlena": { en: "Can we reschedule the call?", ru: "Можем перенести звонок?" },
    "chat.previewAbram": { en: "Thanks for the feedback on the deck.", ru: "Спасибо за фидбек по презентации." },
    "chat.msg1": {
      en: "Hey! Did you get a chance to review the wireframes I sent?",
      ru: "Привет! Успел посмотреть вайрфреймы, которые я кидал?",
    },
    "chat.msg2": {
      en: "Yes — left a few comments in Figma. Overall direction looks solid.",
      ru: "Да — оставил комментарии в Figma. В целом направление нравится.",
    },
    "chat.msg3": {
      en: "Great, I'll fix those tonight and message you tomorrow morning.",
      ru: "Супер, сегодня вечером поправлю и завтра утром напишу.",
    },
    "chat.msg4": { en: "Sounds great, see you then!", ru: "Отлично, тогда до встречи!" },
    "chat.time2h": { en: "2h ago", ru: "2 ч назад" },
    "chat.time1h": { en: "1h ago", ru: "1 ч назад" },
    "chat.time45m": { en: "45m ago", ru: "45 мин назад" },
    "chat.time3h": { en: "3h ago", ru: "3 ч назад" },
    "chat.time2m": { en: "2m", ru: "2 мин" },
    "chat.time45mShort": { en: "45m", ru: "45 мин" },
    "chat.time1m": { en: "1m ago", ru: "1 мин назад" },

    "reg.brand": { en: "LinkedIn analogue", ru: "LinkedIn-аналог" },
    "reg.heroTitle": { en: "Create your profile and start networking", ru: "Создай профиль и начни нетворкинг" },
    "reg.heroText": {
      en: "Registration uses the backend API. After sign-up you continue to complete your profile.",
      ru: "Регистрация подключена к backend API. После создания аккаунта ты переходишь к следующему шагу заполнения профиля.",
    },
    "reg.heading": { en: "Sign up", ru: "Регистрация" },
    "reg.email": { en: "Email", ru: "Электронная почта" },
    "reg.username": { en: "Username", ru: "Имя пользователя" },
    "reg.firstName": { en: "First name", ru: "Имя" },
    "reg.lastName": { en: "Last name", ru: "Фамилия" },
    "reg.password": { en: "Password", ru: "Пароль" },
    "reg.phFirst": { en: "John", ru: "Иван" },
    "reg.phLast": { en: "Doe", ru: "Петров" },
    "reg.phPass": { en: "At least 6 characters", ru: "минимум 6 символов" },
    "reg.submit": { en: "Create account", ru: "Создать аккаунт" },
    "reg.submitting": { en: "Creating…", ru: "Создание…" },
    "reg.guestLead": { en: "Skip registration", ru: "Пропустить регистрацию" },
    "reg.guestTail": {
      en: " — open the home feed without an account.",
      ru: " — открыть главную ленту без аккаунта.",
    },
    "reg.successTitle": { en: "Account created", ru: "Аккаунт создан" },
    "reg.successHint": {
      en: "You can go to your profile next.",
      ru: "Теперь можно перейти к заполнению профиля.",
    },
    "reg.successHintNamed": {
      en: "Account {{target}} created. You can open the home page.",
      ru: "Аккаунт {{target}} создан. Можно открыть главную страницу.",
    },
    "reg.continue": { en: "Go to profile", ru: "Перейти к профилю" },
    "reg.again": { en: "Register another", ru: "Зарегистрировать еще" },
    "reg.statusReady": { en: "Ready", ru: "Готово" },
    "reg.ok": { en: "Success", ru: "Успешно" },
    "reg.err": { en: "Error", ru: "Ошибка" },
    "reg.fetchErr": { en: "Request failed", ru: "Не удалось выполнить запрос" },

    "prof.title": { en: "Profile", ru: "Профиль" },
    "prof.intro": {
      en: "Registration complete. Current user data:",
      ru: "Регистрация завершена. Данные текущего пользователя:",
    },
    "prof.id": { en: "ID", ru: "ID" },
    "prof.userName": { en: "Username", ru: "Имя пользователя" },
    "prof.email": { en: "Email", ru: "Почта" },
    "prof.firstName": { en: "First name", ru: "Имя" },
    "prof.lastName": { en: "Last name", ru: "Фамилия" },
    "prof.feed": { en: "Home feed", ru: "Главная лента" },
    "prof.back": { en: "Back to registration", ru: "Назад к регистрации" },

    "js.member": { en: "Member", ru: "Участник" },
    "js.defaultRole": { en: "Junior UI/UX Designer — Microsoft", ru: "Junior UI/UX Designer — Microsoft" },
    "js.you": { en: "You", ru: "Вы" },
    "js.profTitle": { en: "Professional · @{{u}}", ru: "Специалист · @{{u}}" },
    "js.chatDefault": { en: "Chat", ru: "Чат" },
    "js.deletePost": { en: "Delete post", ru: "Удалить пост" },
    "js.delete": { en: "Delete", ru: "Удалить" },
    "js.recently": { en: "Recently", ru: "Недавно" },
    "js.justNow": { en: "Just now", ru: "Только что" },
    "js.minAgo": { en: "{{n}} min ago", ru: "{{n}} мин назад" },
    "js.hourAgo": { en: "{{n}} h ago", ru: "{{n}} ч назад" },
    "js.chatNow": { en: "Now", ru: "Сейчас" },
  };

  function getLang() {
    const l = document.documentElement.dataset.lang;
    return l === "en" ? "en" : "ru";
  }

  function t(key) {
    const row = STRINGS[key];
    if (!row) return key;
    const lang = getLang();
    return row[lang] ?? row.en ?? key;
  }

  function applyTemplate(str, vars) {
    if (!vars) return str;
    let out = str;
    Object.keys(vars).forEach((k) => {
      out = out.split(`{{${k}}}`).join(String(vars[k]));
    });
    return out;
  }

  function applyDomTranslations() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (!key) return;
      const val = t(key);
      if (el.tagName === "TITLE") {
        document.title = val;
        return;
      }
      el.textContent = val;
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (!key) return;
      el.setAttribute("placeholder", t(key));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (!key) return;
      el.setAttribute("aria-label", t(key));
    });

    document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
      const key = el.getAttribute("data-i18n-alt");
      if (!key) return;
      el.setAttribute("alt", t(key));
    });

    document.querySelectorAll("select[data-ui-lang]").forEach((sel) => {
      sel.value = getLang();
      const ruOpt = sel.querySelector('option[value="ru"]');
      const enOpt = sel.querySelector('option[value="en"]');
      if (ruOpt) ruOpt.textContent = t("footer.optRu");
      if (enOpt) enOpt.textContent = t("footer.optEn");
    });
  }

  function syncThemeToggleI18n() {
    const dark = document.documentElement.dataset.theme === "dark";
    const useLight = dark;
    document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
      btn.setAttribute("aria-label", useLight ? t("theme.useLight") : t("theme.useDark"));
      btn.setAttribute("title", useLight ? t("theme.lightTitle") : t("theme.darkTitle"));
    });
  }

  function setLang(lang) {
    const l = lang === "en" ? "en" : "ru";
    document.documentElement.lang = l;
    document.documentElement.dataset.lang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    applyDomTranslations();
    syncThemeToggleI18n();
    window.dispatchEvent(new CustomEvent("uilangchange", { detail: { lang: l } }));
  }

  function initLangSelects() {
    document.querySelectorAll("select[data-ui-lang]").forEach((sel) => {
      sel.value = getLang();
      sel.addEventListener("change", () => {
        setLang(sel.value);
      });
    });
  }

  function init() {
    let lang = null;
    try {
      lang = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (lang !== "en" && lang !== "ru") {
      lang = "ru";
    }
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    applyDomTranslations();
    initLangSelects();
    syncThemeToggleI18n();
  }

  window.uiT = t;
  window.uiTmpl = (key, vars) => applyTemplate(t(key), vars);
  window.getUiLang = getLang;
  window.setUiLang = setLang;
  window.syncThemeToggleI18n = syncThemeToggleI18n;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
