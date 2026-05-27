(function () {
  const STORAGE_KEY = "uiLang";

  const STRINGS = {
    "page.title.home": { en: "Home — LinkedIn analogue", ru: "Главная — LinkedIn-аналог" },
    "page.title.network": { en: "Network — LinkedIn analogue", ru: "Сеть — LinkedIn-аналог" },
    "page.title.vacancies": { en: "Jobs — LinkedIn analogue", ru: "Вакансии — LinkedIn-аналог" },
    "page.title.chat": { en: "Messages — LinkedIn analogue", ru: "Сообщения — LinkedIn-аналог" },
    "page.title.register": { en: "Registration — LinkedIn analogue", ru: "Регистрация — LinkedIn-аналог", uk: "Реєстрація — LinkedIn-аналог" },
    "page.title.profile": { en: "User profile", ru: "Профиль пользователя", uk: "Профіль користувача" },

    "nav.primary": { en: "Main navigation", ru: "Основное меню", uk: "Головне меню" },
    "nav.homeAria": { en: "Home", ru: "Главная", uk: "Головна" },
    "nav.search": { en: "Search", ru: "Поиск", uk: "Пошук" },
    "nav.home": { en: "Home", ru: "Главная", uk: "Головна" },
    "nav.network": { en: "Network", ru: "Сеть", uk: "Мережа" },
    "nav.vacancies": { en: "Jobs", ru: "Вакансии", uk: "Вакансії" },
    "nav.messagesAria": { en: "Messages", ru: "Сообщения", uk: "Повідомлення" },
    "nav.messages": { en: "Messages", ru: "Сообщения", uk: "Повідомлення" },
    "nav.notificationsAria": { en: "Notifications", ru: "Уведомления", uk: "Сповіщення" },
    "nav.notifications": { en: "Notifications", ru: "Уведомления", uk: "Сповіщення" },
    "nav.close": { en: "Close", ru: "Закрыть", uk: "Закрити" },
    "search.open": { en: "Open global search", ru: "Открыть глобальный поиск", uk: "Відкрити глобальний пошук" },
    "search.title": { en: "Global search", ru: "Поиск по сайту", uk: "Пошук по сайту" },
    "search.placeholder": { en: "People, companies, pages", ru: "Люди, компании, страницы", uk: "Люди, компанії, сторінки" },
    "search.empty": { en: "Nothing found", ru: "Ничего не найдено", uk: "Нічого не знайдено" },
    "search.kindPage": { en: "Page", ru: "Страница", uk: "Сторінка" },
    "search.kindApplication": { en: "Application", ru: "Отклик", uk: "Відгук" },
    "panel.messagesTitle": { en: "Messages", ru: "Сообщения", uk: "Повідомлення" },
    "panel.noChats": { en: "No chats yet.", ru: "Пока нет чатов.", uk: "Поки немає чатів." },
    "panel.notificationsTitle": { en: "Notifications", ru: "Уведомления", uk: "Сповіщення" },
    "panel.unread": { en: "Unread", ru: "Непрочитанные", uk: "Непрочитані" },
    "panel.noUnread": { en: "No unread notifications.", ru: "Непрочитанных уведомлений нет.", uk: "Немає непрочитаних сповіщень." },

    "theme.useDark": { en: "Switch to dark theme", ru: "Включить тёмную тему", uk: "Увімкнути темну тему" },
    "theme.useLight": { en: "Switch to light theme", ru: "Включить светлую тему", uk: "Увімкнути світлу тему" },
    "theme.darkTitle": { en: "Dark theme", ru: "Тёмная тема", uk: "Темна тема" },
    "theme.lightTitle": { en: "Light theme", ru: "Светлая тема", uk: "Світла тема" },

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
    "feed.photo": { en: "Photo", ru: "Фото", uk: "Фото" },
    "feed.video": { en: "Video", ru: "Видео", uk: "Відео" },
    "feed.event": { en: "Event", ru: "Событие", uk: "Подія" },
    "feed.post": { en: "Post", ru: "Опубликовать", uk: "Опублікувати" },
    "feed.like": { en: "Like", ru: "Нравится", uk: "Подобається" },
    "feed.comment": { en: "Comment", ru: "Комментарий", uk: "Коментар" },
    "feed.share": { en: "Share", ru: "Поделиться", uk: "Поширити" },
    "feed.send": { en: "Send", ru: "Отправить", uk: "Надіслати" },
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
    "widget.title": { en: "Messages", ru: "Сообщения", uk: "Повідомлення" },
    "widget.more": { en: "More", ru: "Ещё", uk: "Ще" },
    "widget.compose": { en: "Compose", ru: "Написать", uk: "Написати" },
    "widget.collapse": { en: "Collapse messages", ru: "Свернуть сообщения" },
    "widget.expand": { en: "Expand messages", ru: "Развернуть сообщения" },
    "widget.searchPh": { en: "Search messages", ru: "Поиск по сообщениям" },
    "widget.searchAria": { en: "Search messages", ru: "Поиск по сообщениям" },
    "widget.tabSorted": { en: "Sorted", ru: "Сортировка", uk: "Сортування" },
    "widget.tabOther": { en: "Other", ru: "Другое", uk: "Інше" },
    "widget.empty": {
      en: "No messages yet. Contact a member and start a discussion.",
      ru: "Сообщений пока нет. Напишите участнику и начните обсуждение.",
    },
    "widget.cta": { en: "Send a message", ru: "Написать сообщение", uk: "Надіслати повідомлення" },
    "home.logout": { en: "Log out", ru: "Выйти", uk: "Вийти" },
    "home.msgEmpty": {
      en: "No messages yet. Start a discussion.",
      ru: "Сообщений пока нет. Начните обсуждение.",
      uk: "Повідомлень поки немає. Почніть обговорення.",
    },
    "home.langLabel": { en: "Interface language", ru: "Язык интерфейса", uk: "Мова інтерфейсу" },
    "home.role": { en: "Front-end Developer", ru: "Front-end разработчик", uk: "Front-end розробник" },
    "home.contacts": { en: "Contacts", ru: "Контакты", uk: "Контакти" },
    "home.profileViews": { en: "Who viewed profile", ru: "Кто смотрел профиль", uk: "Хто переглядав профіль" },
    "home.savedElements": { en: "Saved elements", ru: "Сохранённые элементы", uk: "Збережені елементи" },
    "home.you": { en: "You", ru: "Вы", uk: "Ви" },
    "home.noSessionTitle": { en: "Session not found", ru: "Сессия не найдена", uk: "Сесію не знайдено" },
    "home.noSessionHint": {
      en: "Please sign in first on the registration page.",
      ru: "Сначала выполните вход через страницу регистрации.",
      uk: "Спочатку увійдіть через сторінку реєстрації.",
    },
    "home.goRegister": { en: "Go to registration", ru: "Перейти к регистрации", uk: "Перейти до реєстрації" },

    "footer.langHidden": { en: "Language", ru: "Язык", uk: "Мова" },
    "footer.langAria": { en: "Interface language", ru: "Язык интерфейса", uk: "Мова інтерфейсу" },
    "footer.optRu": { en: "Russian", ru: "Русский", uk: "Російська" },
    "footer.optEn": { en: "English", ru: "English", uk: "English" },
    "footer.optUk": { en: "Ukrainian", ru: "Українська", uk: "Українська" },
    "footer.link1a": { en: "General information", ru: "Общая информация", uk: "Загальна інформація" },
    "footer.link1b": { en: "Careers", ru: "Карьера", uk: "Кар'єра" },
    "footer.link1c": { en: "Ad settings", ru: "Настройки рекламы", uk: "Налаштування реклами" },
    "footer.link1d": { en: "Security center", ru: "Центр безопасности", uk: "Центр безпеки" },
    "footer.link2a": { en: "Accessibility", ru: "Специальные возможности", uk: "Доступність" },
    "footer.link2b": { en: "Privacy and terms", ru: "Конфиденциальность и условия", uk: "Конфіденційність та умови" },
    "footer.link2c": { en: "Mobile app", ru: "Мобильное приложение", uk: "Мобільний застосунок" },
    "footer.link3a": { en: "Professional community policies", ru: "Правила профессионального сообщества", uk: "Правила професійної спільноти" },
    "footer.link3b": { en: "Sales solutions", ru: "Решения для продаж", uk: "Рішення для продажів" },
    "footer.link3c": { en: "Advertising solutions", ru: "Рекламные решения", uk: "Рекламні рішення" },
    "footer.link4a": { en: "Questions?", ru: "Вопросы?", uk: "Питання?" },
    "footer.link4b": { en: "Account and privacy", ru: "Аккаунт и конфиденциальность", uk: "Акаунт і конфіденційність" },
    "footer.link4c": { en: "Recommendation transparency", ru: "Прозрачность рекомендаций", uk: "Прозорість рекомендацій" },

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
      uk: "Люди у сфері «UI/UX-дизайн», яких ви можете знати",
    },
    "network.peopleSub": {
      en: "Find relevant contacts, send requests, and start a conversation in one click.",
      ru: "Находите релевантные контакты, отправляйте запросы и начинайте общение в один клик.",
      uk: "Знаходьте релевантні контакти, надсилайте запити та починайте спілкування в один клік.",
    },
    "network.searchPeople": {
      en: "Search by name, role, skill",
      ru: "Поиск по имени, роли или навыку",
      uk: "Пошук за ім'ям, роллю або навичкою",
    },
    "network.onlyOnline": { en: "Online only", ru: "Только онлайн", uk: "Лише онлайн" },
    "network.connect": { en: "Connect", ru: "Добавить в контакты" },
    "network.message": { en: "Message", ru: "Сообщение", uk: "Повідомлення" },
    "network.hide": { en: "Hide", ru: "Скрыть", uk: "Приховати" },
    "network.mutual": { en: "mutual contacts", ru: "общих контактов", uk: "спільних контактів" },
    "network.sent": { en: "Request sent", ru: "Запрос отправлен" },
    "network.openChat": { en: "Chat opened", ru: "Чат открыт", uk: "Чат відкрито" },
    "network.hidden": { en: "Card hidden", ru: "Карточка скрыта", uk: "Картку приховано" },
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
    "network.noMatches": { en: "No matches found", ru: "Совпадений не найдено", uk: "Збігів не знайдено" },
    "network.noMatchesSub": {
      en: "Try another query or reset filters to see more people.",
      ru: "Попробуйте другой запрос или сбросьте фильтры, чтобы увидеть больше людей.",
      uk: "Спробуйте інший запит або скиньте фільтри, щоб побачити більше людей.",
    },
    "network.resetFilters": { en: "Reset filters", ru: "Сбросить фильтры", uk: "Скинути фільтри" },

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
    "vac.apply": { en: "Apply", ru: "Откликнуться", uk: "Відгукнутися" },
    "vac.applied": { en: "Application sent", ru: "Отклик отправлен", uk: "Відгук надіслано" },
    "vac.save": { en: "Save", ru: "Сохранить", uk: "Зберегти" },
    "vac.saved": { en: "Saved", ru: "Сохранено", uk: "Збережено" },
    "vac.unsaved": { en: "Removed from saved jobs", ru: "Вакансия удалена из сохранённых", uk: "Вакансію видалено зі збережених" },
    "vac.savedNotice": { en: "Job saved", ru: "Вакансия сохранена", uk: "Вакансію збережено" },
    "vac.myActivity": { en: "My activity", ru: "Моя активность", uk: "Моя активність" },
    "vac.myApplications": { en: "My applications", ru: "Мои отклики", uk: "Мої відгуки" },
    "vac.savedJobs": { en: "Saved jobs", ru: "Сохранённые", uk: "Збережені" },
    "vac.myApplicationsEmpty": { en: "You have not applied yet.", ru: "Вы ещё не отправляли отклики.", uk: "Ви ще не надсилали відгуки." },
    "vac.savedJobsEmpty": { en: "No saved jobs yet.", ru: "Пока нет сохранённых вакансий.", uk: "Поки немає збережених вакансій." },
    "vac.appliedOn": { en: "Applied on", ru: "Отправлено", uk: "Надіслано" },
    "vac.resume": { en: "Resume", ru: "Резюме", uk: "Резюме" },
    "vac.withdraw": { en: "Withdraw", ru: "Отозвать", uk: "Відкликати" },
    "vac.withdrawDone": { en: "Application withdrawn", ru: "Отклик отозван", uk: "Відгук відкликано" },
    "vac.removeSaved": { en: "Remove", ru: "Убрать", uk: "Прибрати" },
    "vac.dismiss": { en: "Dismiss", ru: "Скрыть" },
    "vac.showAll": { en: "Show all", ru: "Показать все" },
    "vac.queriesClose": { en: "Close", ru: "Закрыть" },
    "vac.queriesTitle": { en: "Suggested searches", ru: "Рекомендуемые поисковые запросы" },
    "vac.roleTitle": { en: "Graphic designer", ru: "Графический дизайнер" },
    "vac.roleSub": { en: "Remote · United States", ru: "Удалённо · США" },
    "vac.applyModalTitle": { en: "Easy Apply", ru: "Быстрый отклик", uk: "Швидкий відгук" },
    "vac.applyName": { en: "Full name", ru: "Имя и фамилия", uk: "Ім'я та прізвище" },
    "vac.applyEmail": { en: "Email", ru: "Email", uk: "Email" },
    "vac.applyPhone": { en: "Phone", ru: "Телефон", uk: "Телефон" },
    "vac.applyAbout": { en: "Why you're a good fit", ru: "Почему вы подходите", uk: "Чому ви підходите" },
    "vac.applyAboutPh": {
      en: "Briefly describe relevant experience...",
      ru: "Коротко расскажите о релевантном опыте...",
      uk: "Коротко розкажіть про релевантний досвід...",
    },
    "vac.applyResumeTitle": { en: "Resume", ru: "Резюме", uk: "Резюме" },
    "vac.applyResumeEmpty": { en: "No file selected", ru: "Файл не выбран", uk: "Файл не вибрано" },
    "vac.applyUseSaved": { en: "Use saved resume", ru: "Использовать сохраненное", uk: "Використати збережене" },
    "vac.applyUpload": { en: "Upload new file", ru: "Загрузить новый файл", uk: "Завантажити новий файл" },
    "vac.applyCancel": { en: "Cancel", ru: "Отмена", uk: "Скасувати" },
    "vac.applySubmit": { en: "Submit application", ru: "Отправить отклик", uk: "Надіслати відгук" },
    "vac.applyNoSavedResume": {
      en: "No saved resume yet",
      ru: "Сохраненного резюме пока нет",
      uk: "Збереженого резюме поки немає",
    },
    "vac.applyResumeTooLarge": {
      en: "File is too large (up to 1.8MB)",
      ru: "Файл слишком большой (до 1.8MB)",
      uk: "Файл занадто великий (до 1.8MB)",
    },
    "vac.applyResumeReadFail": {
      en: "Failed to read resume file",
      ru: "Не удалось прочитать файл резюме",
      uk: "Не вдалося прочитати файл резюме",
    },
    "vac.applyFillRequired": {
      en: "Please fill required fields",
      ru: "Заполните обязательные поля",
      uk: "Заповніть обов'язкові поля",
    },
    "vac.applyNeedResume": {
      en: "Attach your resume before submitting",
      ru: "Прикрепите резюме перед отправкой",
      uk: "Додайте резюме перед відправкою",
    },
    "vac.applyDone": { en: "Application sent", ru: "Отклик отправлен", uk: "Відгук надіслано" },
    "vac.applyAlreadyDone": {
      en: "You already applied to this job",
      ru: "Вы уже отправили отклик на эту вакансию",
      uk: "Ви вже відправили відгук на цю вакансію",
    },

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

    "reg.brand": { en: "LinkedIn analogue", ru: "LinkedIn-аналог", uk: "LinkedIn-аналог" },
    "reg.heroTitle": { en: "Create your profile and start networking", ru: "Создай профиль и начни нетворкинг" },
    "reg.heroText": {
      en: "Registration uses the backend API. After sign-up you continue to complete your profile.",
      ru: "Регистрация подключена к backend API. После создания аккаунта ты переходишь к следующему шагу заполнения профиля.",
    },
    "reg.heading": { en: "Sign up", ru: "Регистрация" },
    "reg.email": { en: "Email", ru: "Электронная почта" },
    "reg.username": { en: "Username", ru: "Имя пользователя" },
    "reg.firstName": { en: "First name", ru: "Имя", uk: "Ім'я" },
    "reg.lastName": { en: "Last name", ru: "Фамилия", uk: "Прізвище" },
    "reg.password": { en: "Password", ru: "Пароль", uk: "Пароль" },
    "reg.phFirst": { en: "John", ru: "Иван" },
    "reg.phLast": { en: "Doe", ru: "Петров" },
    "reg.phPass": { en: "At least 6 characters", ru: "минимум 6 символов" },
    "reg.submit": { en: "Create account", ru: "Создать аккаунт", uk: "Створити акаунт" },
    "reg.submitting": { en: "Creating…", ru: "Создание…" },
    "reg.guestLead": { en: "Skip registration", ru: "Пропустить регистрацию", uk: "Пропустити реєстрацію" },
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
    "reg.fetchErr": { en: "Request failed", ru: "Не удалось выполнить запрос", uk: "Не вдалося виконати запит" },
    "reg.title": { en: "LinkUp Auth", ru: "LinkUp Auth", uk: "LinkUp Auth" },
    "reg.subtitle": {
      en: "Modern registration and login in one convenient window.",
      ru: "Современная регистрация и вход в одном удобном окне.",
      uk: "Сучасна реєстрація та вхід в одному зручному вікні.",
    },
    "reg.stepRegister": { en: "1. Registration", ru: "1. Регистрация", uk: "1. Реєстрація" },
    "reg.stepLogin": { en: "2. Sign in", ru: "2. Вход", uk: "2. Вхід" },
    "reg.stepHome": { en: "3. Home", ru: "3. Главная", uk: "3. Головна" },
    "reg.tabRegister": { en: "Registration", ru: "Регистрация", uk: "Реєстрація" },
    "reg.tabLogin": { en: "Sign in", ru: "Вход", uk: "Вхід" },
    "reg.emailShort": { en: "Email", ru: "Email", uk: "Email" },
    "reg.usernameShort": { en: "Username", ru: "Username", uk: "Username" },
    "reg.confirmPassword": { en: "Confirm password", ru: "Повторите пароль", uk: "Повторіть пароль" },
    "reg.phConfirm": { en: "repeat password", ru: "повторите пароль", uk: "повторіть пароль" },
    "reg.creating": { en: "Creating...", ru: "Создание...", uk: "Створення..." },
    "reg.loggingIn": { en: "Signing in...", ru: "Вход...", uk: "Вхід..." },
    "reg.login": { en: "Sign in", ru: "Войти", uk: "Увійти" },
    "reg.skip": { en: "Continue without registration", ru: "Продолжить без регистрации", uk: "Продовжити без реєстрації" },
    "reg.phLoginPass": { en: "your password", ru: "ваш пароль", uk: "ваш пароль" },
    "reg.errEmail": { en: "Enter a valid email.", ru: "Введите корректный email.", uk: "Введіть коректний email." },
    "reg.errPassShort": {
      en: "Password must be at least 6 characters.",
      ru: "Пароль должен быть минимум 6 символов.",
      uk: "Пароль має бути не менше 6 символів.",
    },
    "reg.errPassMismatch": { en: "Passwords do not match.", ru: "Пароли не совпадают.", uk: "Паролі не збігаються." },
    "reg.errServer": {
      en: "Server is unavailable. Check API and try again.",
      ru: "Сервер недоступен. Проверьте API и попробуйте снова.",
      uk: "Сервер недоступний. Перевірте API і спробуйте ще раз.",
    },
    "reg.errLogin": { en: "Invalid email or password.", ru: "Неверный email или пароль.", uk: "Невірний email або пароль." },

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
    "profile.subtitle": {
      en: "Fill in your details for your personal dashboard",
      ru: "Заполните информацию о себе для личного кабинета",
      uk: "Заповніть інформацію про себе для особистого кабінету",
    },
    "profile.openToWork": { en: "Open to work", ru: "Open to work", uk: "Open to work" },
    "profile.addSection": { en: "Add profile section", ru: "Add profile section", uk: "Add profile section" },
    "profile.editContact": { en: "Edit contact info", ru: "Edit contact info", uk: "Edit contact info" },
    "profile.cabinetTitle": { en: "Personal dashboard", ru: "Личный кабинет", uk: "Особистий кабінет" },
    "profile.firstNameLabel": { en: "First name", ru: "Имя", uk: "Ім'я" },
    "profile.lastNameLabel": { en: "Last name", ru: "Фамилия", uk: "Прізвище" },
    "profile.emailLabel": { en: "Email", ru: "Почта", uk: "Пошта" },
    "profile.specialtyLabel": { en: "Specialty", ru: "Специальность", uk: "Спеціальність" },
    "profile.positionLabel": { en: "Current position", ru: "Текущая должность", uk: "Поточна посада" },
    "profile.companyLabel": { en: "Company", ru: "Компания", uk: "Компанія" },
    "profile.experienceFromLabel": { en: "Experience from", ru: "Начало опыта", uk: "Початок досвіду" },
    "profile.experienceToLabel": { en: "Experience to", ru: "Окончание опыта", uk: "Завершення досвіду" },
    "profile.countryLabel": { en: "Country", ru: "Страна", uk: "Країна" },
    "profile.countryUkraine": { en: "Ukraine", ru: "Украина", uk: "Україна" },
    "profile.cityLabel": { en: "City", ru: "Город", uk: "Місто" },
    "profile.phoneLabel": { en: "Phone", ru: "Телефон", uk: "Телефон" },
    "profile.websiteLabel": { en: "Website", ru: "Сайт", uk: "Сайт" },
    "profile.educationLabel": { en: "Educational institution", ru: "Учебное заведение", uk: "Навчальний заклад" },
    "profile.educationPeriodLabel": { en: "Study period", ru: "Период обучения", uk: "Період навчання" },
    "profile.projectTitleLabel": { en: "Project title", ru: "Название проекта", uk: "Назва проєкту" },
    "profile.projectLinkLabel": { en: "Project link", ru: "Ссылка", uk: "Посилання" },
    "profile.aboutLabel": { en: "About", ru: "О себе", uk: "Про себе" },
    "profile.resumeLabel": { en: "Resume", ru: "Резюме", uk: "Резюме" },
    "profile.skillsLabel": { en: "Skills", ru: "Навыки", uk: "Навички" },
    "profile.phFirstName": { en: "John", ru: "Иван", uk: "Іван" },
    "profile.phLastName": { en: "Doe", ru: "Петров", uk: "Петренко" },
    "profile.phSpecialty": { en: "Front-end Developer", ru: "Front-end Developer", uk: "Front-end Developer" },
    "profile.phPosition": { en: "Junior Front-end Developer", ru: "Junior Front-end Developer", uk: "Junior Front-end Developer" },
    "profile.phCompany": { en: "Microsoft", ru: "Microsoft", uk: "Microsoft" },
    "profile.phExpFrom": { en: "2024", ru: "2024", uk: "2024" },
    "profile.phExpTo": { en: "Present", ru: "Настоящее время", uk: "Теперішній час" },
    "profile.phCountry": { en: "For example: Ukraine", ru: "Например: Украина", uk: "Наприклад: Україна" },
    "profile.phCity": { en: "Odesa", ru: "Одесса", uk: "Одеса" },
    "profile.phPhone": { en: "+380 XX XXX XX XX", ru: "+380 XX XXX XX XX", uk: "+380 XX XXX XX XX" },
    "profile.phWebsite": { en: "https://portfolio.site", ru: "https://portfolio.site", uk: "https://portfolio.site" },
    "profile.phEducation": {
      en: "University of California, Los Angeles",
      ru: "University of California, Los Angeles",
      uk: "University of California, Los Angeles",
    },
    "profile.phEducationPeriod": { en: "2014 — 2018", ru: "2014 — 2018", uk: "2014 — 2018" },
    "profile.phAbout": { en: "Tell us briefly about yourself...", ru: "Коротко расскажите о себе...", uk: "Коротко розкажіть про себе..." },
    "profile.phSkill": { en: "For example: React", ru: "Например: React", uk: "Наприклад: React" },
    "profile.selectCountry": { en: "Select country", ru: "Выберите страну", uk: "Оберіть країну" },
    "profile.selectCity": { en: "Select city", ru: "Выберите город", uk: "Оберіть місто" },
    "profile.selectSkill": { en: "Select a programmer skill", ru: "Выберите навык программиста", uk: "Оберіть навичку програміста" },
    "profile.phProjectTitle": { en: "For example: Job Board Redesign", ru: "Например: Job Board Redesign", uk: "Наприклад: Job Board Redesign" },
    "profile.phProjectLink": { en: "https://github.com/...", ru: "https://github.com/...", uk: "https://github.com/..." },
    "profile.addSkill": { en: "Add", ru: "Добавить", uk: "Додати" },
    "profile.addProject": { en: "Add project", ru: "Добавить проект", uk: "Додати проєкт" },
    "profile.cta": {
      en: "Add information about yourself to conquer the world",
      ru: "Добавьте информацию о себе, чтобы покорить мир",
      uk: "Додайте інформацію про себе, щоб підкорити світ",
    },
    "profile.progressTitle": { en: "Profile progress", ru: "Прогресс профиля", uk: "Прогрес профілю" },
    "profile.progressHint": {
      en: "The more details you add, the stronger your profile looks.",
      ru: "Чем больше данных, тем лучше ваш профиль выглядит в системе.",
      uk: "Чим більше даних, тим краще виглядає ваш профіль у системі.",
    },
    "profile.resumeEmpty": { en: "No file uploaded", ru: "Файл не загружен", uk: "Файл не завантажено" },
    "profile.resumeDownload": { en: "Download uploaded resume", ru: "Скачать загруженное резюме", uk: "Завантажити завантажене резюме" },
    "profile.skillsEmpty": { en: "No skills yet.", ru: "Пока навыков нет.", uk: "Поки навичок немає." },
    "profile.skillsPreviewEmpty": { en: "No skills added yet.", ru: "Навыки пока не добавлены.", uk: "Навички поки не додано." },
    "profile.linkHome": { en: "Home feed", ru: "Главная лента", uk: "Головна стрічка" },
    "profile.linkBackReg": { en: "Back to registration", ru: "Назад к регистрации", uk: "Назад до реєстрації" },
    "profile.analyticsTitle": { en: "Analytics", ru: "Analytics", uk: "Analytics" },
    "profile.experienceTitle": { en: "Experience", ru: "Experience", uk: "Experience" },
    "profile.educationTitle": { en: "Education", ru: "Education", uk: "Education" },
    "profile.projectsTitle": { en: "Projects", ru: "Projects", uk: "Projects" },
    "profile.skillsTitle": { en: "Skills", ru: "Skills", uk: "Skills" },
    "profile.footer": { en: "LinkUp • User dashboard", ru: "LinkUp • Личный кабинет пользователя", uk: "LinkUp • Особистий кабінет користувача" },
    "profile.uploadFile": { en: "Upload file", ru: "Загрузить файл", uk: "Завантажити файл" },
    "profile.clear": { en: "Clear", ru: "Очистить", uk: "Очистити" },
    "profile.metricViews": { en: "Profile views", ru: "Просмотры профиля", uk: "Перегляди профілю" },
    "profile.metricPostViews": { en: "Post views", ru: "Просмотры постов", uk: "Перегляди постів" },
    "profile.metricCompletion": { en: "Profile completion", ru: "Заполненность профиля", uk: "Заповненість профілю" },
    "profile.expOpenTitle": { en: "Show achievements and experience", ru: "Покажите достижения и опыт", uk: "Покажіть досягнення та досвід" },
    "profile.expOpenText": {
      en: "Add your position, company and dates to make your profile stronger.",
      ru: "Добавьте позицию, компанию и период работы, чтобы профиль выглядел сильнее.",
      uk: "Додайте посаду, компанію та період роботи, щоб профіль виглядав сильніше.",
    },
    "profile.specialtyPrefix": { en: "Specialty", ru: "Специальность", uk: "Спеціальність" },
    "profile.positionPrefix": { en: "Position", ru: "Позиция", uk: "Посада" },
    "profile.companyPrefix": { en: "Company", ru: "Компания", uk: "Компанія" },
    "profile.periodPrefix": { en: "Period", ru: "Период", uk: "Період" },
    "profile.locationPrefix": { en: "Location", ru: "Локация", uk: "Локація" },
    "profile.educationPrefix": { en: "Educational institution", ru: "Учебное заведение", uk: "Навчальний заклад" },
    "profile.removeSkill": { en: "Remove skill", ru: "Удалить навык", uk: "Видалити навичку" },
    "profile.avatarAdd": { en: "Add avatar", ru: "Добавить аватар", uk: "Додати аватар" },
    "profile.avatarEdit": { en: "Edit avatar", ru: "Изменить аватар", uk: "Змінити аватар" },
    "profile.avatarRemove": { en: "Remove photo", ru: "Удалить фото", uk: "Видалити фото" },
    "profile.avatarUpload": { en: "Upload photo", ru: "Загрузить фото", uk: "Завантажити фото" },
    "profile.avatarSaveIcon": { en: "Save icon", ru: "Сохранить иконку", uk: "Зберегти іконку" },
    "profile.pickAnimalIcon": { en: "Choose an animal icon", ru: "Выбери иконку-животное", uk: "Вибери іконку-тварину" },
    "profile.pickIcon": { en: "Choose icon", ru: "Выбрать иконку", uk: "Вибрати іконку" },
    "profile.progressFilled": { en: "{{n}}% completed", ru: "{{n}}% заполнено", uk: "{{n}}% заповнено" },
    "profile.notSpecified": { en: "Not specified", ru: "Не указана", uk: "Не вказано" },
    "profile.notSpecifiedN": { en: "Not specified", ru: "Не указано", uk: "Не вказано" },
    "profile.notSpecifiedPeriod": { en: "Not specified", ru: "Не указан", uk: "Не вказано" },
    "profile.defaultName": { en: "Profile", ru: "Профиль", uk: "Профіль" },
    "profile.saved": { en: "Data saved.", ru: "Данные сохранены.", uk: "Дані збережено." },
    "profile.needImage": { en: "Please choose an image.", ru: "Нужно выбрать изображение.", uk: "Потрібно вибрати зображення." },
    "profile.photoTooLarge": { en: "Photo is too large (up to 1.2MB).", ru: "Фото слишком большое (до 1.2MB).", uk: "Фото надто велике (до 1.2MB)." },
    "profile.photoLoadFail": { en: "Failed to upload photo.", ru: "Не удалось загрузить фото.", uk: "Не вдалося завантажити фото." },
    "profile.resumeTooLarge": { en: "Resume is too large (up to 1.8MB).", ru: "Резюме слишком большое (до 1.8MB).", uk: "Резюме надто велике (до 1.8MB)." },
    "profile.resumeLoadFail": { en: "Failed to upload resume.", ru: "Не удалось загрузить резюме.", uk: "Не вдалося завантажити резюме." },
    "profile.analyticsUpdated": { en: "Analytics updated.", ru: "Аналитика обновлена.", uk: "Аналітику оновлено." },
    "profile.settingsTitle": { en: "Mini account settings", ru: "Мини-настройки аккаунта", uk: "Міні-налаштування акаунта" },
    "profile.settingsLang": { en: "Interface language", ru: "Язык интерфейса", uk: "Мова інтерфейсу" },
    "profile.settingsTheme": { en: "Theme", ru: "Тема", uk: "Тема" },
    "profile.settingsVisibility": { en: "Profile visibility", ru: "Видимость профиля", uk: "Видимість профілю" },
    "profile.visibilityPublic": { en: "Public", ru: "Публичный", uk: "Публічний" },
    "profile.visibilityContacts": { en: "Contacts only", ru: "Только контакты", uk: "Лише контакти" },
    "profile.visibilityPrivate": { en: "Only me", ru: "Только я", uk: "Тільки я" },
    "profile.themeLight": { en: "Light", ru: "Светлая", uk: "Світла" },
    "profile.themeDark": { en: "Dark", ru: "Темная", uk: "Темна" },

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
    if (l === "en") return "en";
    if (l === "uk") return "uk";
    return "ru";
  }

  function t(key) {
    const row = STRINGS[key];
    if (!row) return key;
    const lang = getLang();
    return row[lang] ?? row.ru ?? row.en ?? key;
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
      const ukOpt = sel.querySelector('option[value="uk"]');
      if (ruOpt) ruOpt.textContent = t("footer.optRu");
      if (enOpt) enOpt.textContent = t("footer.optEn");
      if (ukOpt) ukOpt.textContent = t("footer.optUk");
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
    const l = lang === "en" || lang === "uk" ? lang : "ru";
    document.documentElement.lang = l;
    document.documentElement.dataset.lang = l;
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
    applyDomTranslations();
    syncThemeToggleI18n();
    const ev = new CustomEvent("uilangchange", { detail: { lang: l } });
    window.dispatchEvent(ev);
    document.dispatchEvent(new CustomEvent("uilangchange", { detail: { lang: l } }));
  }

  function initLangSelects() {
    document.addEventListener("change", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLSelectElement)) return;
      if (!target.matches("select[data-ui-lang]")) return;
      setLang(target.value);
    });
  }

  let applyQueued = false;
  function queueApplyDomTranslations() {
    if (applyQueued) return;
    applyQueued = true;
    requestAnimationFrame(() => {
      applyQueued = false;
      applyDomTranslations();
      syncThemeToggleI18n();
    });
  }

  function init() {
    let lang = null;
    try {
      lang = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (lang !== "en" && lang !== "ru" && lang !== "uk") {
      lang = "ru";
    }
    document.documentElement.lang = lang;
    document.documentElement.dataset.lang = lang;

    applyDomTranslations();
    initLangSelects();
    syncThemeToggleI18n();

    window.addEventListener("load", queueApplyDomTranslations);

    if (typeof MutationObserver !== "undefined" && document.body) {
      const observer = new MutationObserver(() => {
        queueApplyDomTranslations();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
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
