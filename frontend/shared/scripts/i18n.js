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
    "feed.emoji": { en: "Emoji", ru: "Смайлы", uk: "Смайли" },
    "feed.emojiAria": { en: "Insert emoji", ru: "Вставить смайл", uk: "Вставити смайл" },
    "feed.emojiPickerAria": { en: "Choose emoji", ru: "Выбор смайла", uk: "Вибір смайла" },
    "feed.event": { en: "Event", ru: "Событие", uk: "Подія" },
    "feed.post": { en: "Post", ru: "Опубликовать", uk: "Опублікувати" },
    "feed.removeVideo": { en: "Remove video", ru: "Убрать видео", uk: "Прибрати відео" },
    "feed.previewPhotoAlt": { en: "Photo preview", ru: "Предпросмотр фото", uk: "Попередній перегляд фото" },
    "feed.postMediaAlt": { en: "Post attachment", ru: "Вложение к посту", uk: "Вкладення до поста" },
    "feed.photoAdded": { en: "Photo attached", ru: "Фото прикреплено", uk: "Фото прикріплено" },
    "feed.videoAdded": { en: "Video attached", ru: "Видео прикреплено", uk: "Відео прикріплено" },
    "feed.photoInvalid": { en: "Choose an image file", ru: "Выберите файл изображения", uk: "Оберіть файл зображення" },
    "feed.videoInvalid": { en: "Choose a video file", ru: "Выберите видеофайл", uk: "Оберіть відеофайл" },
    "feed.photoTooLarge": { en: "Photo must be under 5 MB", ru: "Фото должно быть меньше 5 МБ", uk: "Фото має бути менше 5 МБ" },
    "feed.videoTooLarge": { en: "Video must be under 12 MB", ru: "Видео должно быть меньше 12 МБ", uk: "Відео має бути менше 12 МБ" },
    "feed.attachFailed": { en: "Could not attach file", ru: "Не удалось прикрепить файл", uk: "Не вдалося прикріпити файл" },
    "feed.publishEmpty": { en: "Add text, a photo, or a video", ru: "Добавьте текст, фото или видео", uk: "Додайте текст, фото або відео" },
    "feed.published": { en: "Post published", ru: "Пост опубликован", uk: "Пост опубліковано" },
    "feed.postDeleted": { en: "Post deleted", ru: "Пост удалён", uk: "Пост видалено" },
    "feed.updatePosts": { en: "Post Update", ru: "Обновить посты", uk: "Оновити пости" },
    "feed.updated": {
      en: "Feed updated — new posts added.",
      ru: "Лента обновлена — добавлены новые посты.",
      uk: "Стрічку оновлено — додано нові пости.",
    },
    "feed.like": { en: "Like", ru: "Нравится", uk: "Подобається" },
    "feed.liked": { en: "Liked", ru: "Лайкнуто", uk: "Сподобалось" },
    "feed.likedAria": {
      en: "You liked this post",
      ru: "Вы поставили лайк",
      uk: "Вам сподобався цей допис",
    },
    "feed.comment": { en: "Comment", ru: "Комментарий", uk: "Коментар" },
    "feed.share": { en: "Share", ru: "Поделиться", uk: "Поширити" },
    "feed.shareMenuTitle": {
      en: "Share with contacts",
      ru: "Поделиться с контактами",
      uk: "Поділитися з контактами",
    },
    "feed.shareCopyLink": {
      en: "Copy link",
      ru: "Копировать ссылку",
      uk: "Копіювати посилання",
    },
    "feed.sharedWith": {
      en: "Post shared with {{name}}",
      ru: "Пост отправлен {{name}}",
      uk: "Допис надіслано {{name}}",
    },
    "feed.send": { en: "Send", ru: "Отправить", uk: "Надіслати" },
    "feed.removePreview": { en: "Remove image", ru: "Убрать фото" },
    "feed.commentsHeading": { en: "Comments", ru: "Комментарии" },
    "feed.noComments": { en: "No comments yet.", ru: "Пока нет комментариев." },
    "feed.commentPh": { en: "Write a comment…", ru: "Написать комментарий…" },
    "feed.commentPost": { en: "Reply", ru: "Ответить", uk: "Відповісти" },
    "feed.commentAdded": {
      en: "Comment added",
      ru: "Комментарий добавлен",
      uk: "Коментар додано",
    },
    "feed.commentsShort": { en: "comments", ru: "комментариев", uk: "коментарів" },
    "feed.likesShort": { en: "likes", ru: "лайков", uk: "лайків" },
    "feed.sampleComment1": {
      en: "Great update — the spacing feels much cleaner now.",
      ru: "Отличное обновление — spacing стал заметно чище.",
      uk: "Чудове оновлення — spacing став помітно чистішим.",
    },
    "feed.sampleComment2": {
      en: "Can we sync on this in the next design review?",
      ru: "Можем обсудить это на следующем design review?",
      uk: "Можемо обговорити це на наступному design review?",
    },
    "feed.sampleComment3": {
      en: "Love the direction. Ship it!",
      ru: "Нравится направление. Ship it!",
      uk: "Подобається напрямок. Ship it!",
    },
    "feed.sampleComment4": {
      en: "This will help a lot with our onboarding flow.",
      ru: "Это сильно поможет нашему onboarding flow.",
      uk: "Це сильно допоможе нашому onboarding flow.",
    },
    "feed.sampleComment5": {
      en: "Nice work — left a few notes in Figma.",
      ru: "Хорошая работа — оставил заметки в Figma.",
      uk: "Гарна робота — залишив нотатки в Figma.",
    },
    "feed.sampleComment6": {
      en: "Exactly what we needed for the demo.",
      ru: "Именно то, что нужно для demo.",
      uk: "Саме те, що потрібно для demo.",
    },
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
    "home.msgNoResults": {
      en: "No messages match your search.",
      ru: "Сообщения не найдены.",
      uk: "Повідомлень не знайдено.",
    },
    "home.msgPreview1": {
      en: "Can you review the Figma file before standup?",
      ru: "Можешь глянуть Figma перед standup?",
      uk: "Можеш глянути Figma перед standup?",
    },
    "home.msgPreview2": {
      en: "Thanks for the intro — let's sync tomorrow.",
      ru: "Спасибо за intro — давай соз созвонимся.",
      uk: "Дякую за intro — давай завтра синканемось.",
    },
    "home.msgPreview3": {
      en: "Pushed the filter fix, ready for QA.",
      ru: "Запушил фикс фильтра, готово к QA.",
      uk: "Запушив фікс фільтра, готово до QA.",
    },
    "home.msgPreview4": {
      en: "Interesting research on onboarding flows 👀",
      ru: "Интересное исследование по onboarding 👀",
      uk: "Цікаве дослідження про onboarding 👀",
    },
    "home.msgPreview5": {
      en: "Are you free for a quick code review?",
      ru: "Есть время на быстрый code review?",
      uk: "Є час на швидкий code review?",
    },
    "home.msgPreview6": {
      en: "User interviews notes are in the doc.",
      ru: "Заметки с user interviews в доке.",
      uk: "Нотатки з user interviews у докі.",
    },
    "home.msgPreview7": {
      en: "Backend deploy finished — API is stable.",
      ru: "Backend deploy готов — API стабилен.",
      uk: "Backend deploy готовий — API стабільний.",
    },
    "home.msgPreview8": {
      en: "Kubernetes workshop starts at 4pm.",
      ru: "Воркшоп по Kubernetes в 16:00.",
      uk: "Воркшоп з Kubernetes о 16:00.",
    },
    "home.msgTime1": { en: "2m", ru: "2 мин", uk: "2 хв" },
    "home.msgTime2": { en: "18m", ru: "18 мин", uk: "18 хв" },
    "home.msgTime3": { en: "1h", ru: "1 ч", uk: "1 год" },
    "home.msgTime4": { en: "3h", ru: "3 ч", uk: "3 год" },
    "home.msgTime5": { en: "Yesterday", ru: "Вчера", uk: "Вчора" },
    "home.msgTime6": { en: "Mon", ru: "Пн", uk: "Пн" },
    "home.msgTime7": { en: "Tue", ru: "Вт", uk: "Вт" },
    "home.msgTime8": { en: "Sun", ru: "Вс", uk: "Нд" },
    "home.langLabel": { en: "Interface language", ru: "Язык интерфейса", uk: "Мова інтерфейсу" },
    "home.role": { en: "Front-end Developer", ru: "Front-end разработчик", uk: "Front-end розробник" },
    "home.contacts": { en: "Contacts", ru: "Контакты", uk: "Контакти" },
    "home.profileViews": { en: "Who viewed profile", ru: "Кто смотрел профиль", uk: "Хто переглядав профіль" },
    "home.savedElements": { en: "Saved elements", ru: "Сохранённые элементы", uk: "Збережені елементи" },
    "home.you": { en: "You", ru: "Вы", uk: "Ви" },
    "home.guest": { en: "Guest", ru: "Гость", uk: "Гість" },
    "feed.mock1.text": {
      en: "We built a new onboarding screen today. Keep the steps simple and the CTAs clear.",
      ru: "Сегодня собрали новый экран onboarding. Важно держать простые шаги и понятные CTA.",
      uk: "Сьогодні зібрали новий екран onboarding. Важливо тримати прості кроки та зрозумілі CTA.",
    },
    "feed.mock2.text": {
      en: "If we reduce cognitive load on the first screen, registration conversion is always higher.",
      ru: "Если мы уменьшаем когнитивную нагрузку на первом экране, конверсия регистрации всегда выше.",
      uk: "Якщо ми зменшуємо когнітивне навантаження на першому екрані, конверсія реєстрації завжди вища.",
    },
    "feed.mock3.text": {
      en: "Just shipped a design-system update — tighter spacing tokens and clearer focus states across all forms.",
      ru: "Только что выкатили обновление design-system — более плотные spacing-токены и чёткие focus-состояния во всех формах.",
      uk: "Щойно викотили оновлення design-system — щільніші spacing-токени та чіткіші focus-стани у всіх формах.",
    },
    "feed.mock4.text": {
      en: "Team retro takeaway: async design reviews cut our cycle time by 30%. Worth trying if you haven't yet.",
      ru: "Итог ретро: асинхронные design review сократили цикл на 30%. Стоит попробовать, если ещё не пробовали.",
      uk: "Підсумок ретро: асинхронні design review скоротили цикл на 30%. Варто спробувати, якщо ще не пробували.",
    },
    "feed.mock5.text": {
      en: "Refactored our component library to React 18 — lazy routes feel noticeably snappier on mobile.",
      ru: "Отрефакторили component library под React 18 — lazy routes заметно быстрее на мобильных.",
      uk: "Відрефакторили component library під React 18 — lazy routes помітно швидші на мобільних.",
    },
    "feed.mock6.text": {
      en: "Pro tip: pair Figma auto-layout with CSS grid for handoff — fewer surprises in QA.",
      ru: "Совет: сочетайте Figma auto-layout с CSS grid при handoff — меньше сюрпризов на QA.",
      uk: "Порада: поєднуйте Figma auto-layout із CSS grid при handoff — менше сюрпризів на QA.",
    },
    "feed.mock7.text": {
      en: "Finished five user interviews this week. The #1 pain point? Unclear empty states after signup.",
      ru: "На этой неделе провели пять user interview. Боль №1? Непонятные empty states после регистрации.",
      uk: "Цього тижня провели п'ять user interview. Біль №1? Незрозумілі empty states після реєстрації.",
    },
    "feed.mock8.text": {
      en: "Deployed blue-green to staging — zero downtime and rollback in under two minutes. Happy Friday!",
      ru: "Задеплоили blue-green на staging — zero downtime и откат меньше чем за две минуты. Счастливой пятницы!",
      uk: "Задеплоїли blue-green на staging — zero downtime і відкат менше ніж за дві хвилини. Щасливої п'ятниці!",
    },
    "feed.mock9.text": {
      en: "New research deck is live: how micro-interactions affect trust in fintech onboarding flows.",
      ru: "Новый research deck: как micro-interactions влияют на доверие в fintech onboarding.",
      uk: "Новий research deck: як micro-interactions впливають на довіру в fintech onboarding.",
    },
    "feed.mock10.text": {
      en: "Roadmap sync done — Q3 focus is accessibility audits and performance budgets for every release.",
      ru: "Roadmap sync готов — фокус Q3: accessibility audit и performance budget для каждого релиза.",
      uk: "Roadmap sync готовий — фокус Q3: accessibility audit і performance budget для кожного релізу.",
    },
    "feed.mock11.text": {
      en: "Experimenting with variable fonts in our marketing site — one file, three weights, much smaller payload.",
      ru: "Тестируем variable fonts на маркетинговом сайте — один файл, три начертания, меньший payload.",
      uk: "Тестуємо variable fonts на маркетинговому сайті — один файл, три накреслення, менший payload.",
    },
    "feed.mock12.text": {
      en: "Open-sourced our eslint plugin for design tokens. PRs welcome — link in comments.",
      ru: "Выложили в open source eslint-плагин для design tokens. PR welcome — ссылка в комментариях.",
      uk: "Виклали в open source eslint-плагін для design tokens. PR welcome — посилання в коментарях.",
    },
    "feed.mock13.text": {
      en: "Shipped the auth flow refactor — social login and custom avatars now work end-to-end.",
      ru: "Выкатили рефакторинг auth flow — social login и кастомные аватары работают end-to-end.",
      uk: "Викотили рефакторинг auth flow — social login і кастомні аватари працюють end-to-end.",
    },
    "feed.mock14.text": {
      en: "Pair-programmed on the network search module today. Fuzzy matching feels much snappier now.",
      ru: "Сегодня pair programming на модуле поиска в Network. Fuzzy matching стал заметно быстрее.",
      uk: "Сьогодні pair programming на модулі пошуку в Network. Fuzzy matching став помітно швидшим.",
    },
    "feed.mock15.text": {
      en: "New API endpoints for vacancies are live — filters and pagination finally behave consistently.",
      ru: "Новые API endpoints для вакансий в проде — фильтры и пагинация наконец работают стабильно.",
      uk: "Нові API endpoints для вакансій у проді — фільтри й пагінація нарешті працюють стабільно.",
    },
    "feed.mock16.text": {
      en: "Published our design tokens v2 — semantic colors, spacing scale, and dark mode baked in.",
      ru: "Опубликовали design tokens v2 — semantic colors, spacing scale и dark mode из коробки.",
      uk: "Опублікували design tokens v2 — semantic colors, spacing scale і dark mode з коробки.",
    },
    "feed.mock17.text": {
      en: "React Native prototype for the messages widget is ready — swipe actions feel native.",
      ru: "React Native прототип messages widget готов — swipe actions ощущаются нативно.",
      uk: "React Native прототип messages widget готовий — swipe actions відчуваються нативно.",
    },
    "feed.mock18.text": {
      en: "Refreshed the brand guidelines — tighter typography hierarchy and clearer logo usage rules.",
      ru: "Обновили brand guidelines — более чёткая типографическая иерархия и правила logo usage.",
      uk: "Оновили brand guidelines — чіткіша типографічна ієрархія та правила logo usage.",
    },
    "feed.mock19.text": {
      en: "Regression suite down to 12 minutes after parallelizing E2E tests in CI. Huge win for the team.",
      ru: "Regression suite уложили в 12 минут после параллелизации E2E в CI. Большой win для команды.",
      uk: "Regression suite вклали в 12 хвилин після паралелізації E2E в CI. Великий win для команди.",
    },
    "feed.mock20.text": {
      en: "Architecture review done — moving chat persistence to localStorage for the SPA demo phase.",
      ru: "Architecture review завершён — переносим chat persistence в localStorage для SPA demo.",
      uk: "Architecture review завершено — переносимо chat persistence у localStorage для SPA demo.",
    },
    "feed.mock21.text": {
      en: "Content audit complete: shortened onboarding copy by 40% without losing clarity.",
      ru: "Content audit готов: сократили onboarding copy на 40% без потери ясности.",
      uk: "Content audit готовий: скоротили onboarding copy на 40% без втрати ясності.",
    },
    "feed.mock22.text": {
      en: "Dashboard shows a 22% lift in feed engagement after adding photo and video posts.",
      ru: "Dashboard показывает +22% engagement в ленте после добавления photo и video posts.",
      uk: "Dashboard показує +22% engagement у стрічці після додавання photo та video posts.",
    },
    "feed.mock23.text": {
      en: "Sprint planning: focus on network groups chat, company pages, and events filters this week.",
      ru: "Sprint planning: на этой неделе фокус на group chat, company pages и events filters.",
      uk: "Sprint planning: цього тижня фокус на group chat, company pages та events filters.",
    },
    "feed.mock24.text": {
      en: "Migrated staging to a new cloud region — latency dropped 80 ms for EU users.",
      ru: "Перенесли staging в новый cloud region — latency для EU пользователей упала на 80 ms.",
      uk: "Перенесли staging у новий cloud region — latency для EU користувачів впала на 80 ms.",
    },
    "home.hint.noNotifications": {
      en: "No new notifications yet.",
      ru: "Новых уведомлений пока нет",
      uk: "Нових сповіщень поки немає",
    },
    "home.hint.savedElementsSoon": {
      en: "Saved items will open on the next screen.",
      ru: "Сохраненные элементы откроем в следующем экране",
      uk: "Збережені елементи відкриємо на наступному екрані",
    },
    "home.hint.photoSoon": {
      en: "Photo uploads coming in the next update.",
      ru: "Добавление фото будет в следующем обновлении",
      uk: "Додавання фото буде в наступному оновленні",
    },
    "home.hint.videoSoon": {
      en: "Video uploads coming in the next update.",
      ru: "Добавление видео будет в следующем обновлении",
      uk: "Додавання відео буде в наступному оновленні",
    },
    "home.hint.eventSoon": {
      en: "Event creation coming in the next update.",
      ru: "Создание события будет в следующем обновлении",
      uk: "Створення події буде в наступному оновленні",
    },
    "home.hint.likeRecorded": { en: "Like recorded", ru: "Лайк учтен", uk: "Лайк зараховано" },
    "home.hint.commentsSoon": {
      en: "Comments coming in the next update.",
      ru: "Комментарии будут в следующем обновлении",
      uk: "Коментарі будуть у наступному оновленні",
    },
    "home.hint.linkCopied": {
      en: "Post link copied.",
      ru: "Ссылка на пост скопирована",
      uk: "Посилання на допис скопійовано",
    },
    "home.hint.postSentToMessages": {
      en: "Post sent to messages.",
      ru: "Пост отправлен в сообщения",
      uk: "Допис надіслано в повідомлення",
    },
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
    "network.following": { en: "Following", ru: "Подписки", uk: "Підписки" },
    "network.followingHeading": { en: "People you follow", ru: "Люди, на которых вы подписаны", uk: "Люди, на яких ви підписані" },
    "network.followingSub": {
      en: "Updates from contacts you follow appear in your feed.",
      ru: "Обновления от людей, на которых вы подписаны, появляются в ленте.",
      uk: "Оновлення від людей, на яких ви підписані, з'являються у стрічці.",
    },
    "network.followingEmpty": {
      en: "You are not following anyone yet. Connect with people to follow them.",
      ru: "Вы пока ни на кого не подписаны. Добавляйте контакты, чтобы следить за ними.",
      uk: "Ви поки ні на кого не підписані. Додавайте контакти, щоб стежити за ними.",
    },
    "network.message": { en: "Message", ru: "Написать", uk: "Написати" },
    "network.unfollow": { en: "Unfollow", ru: "Отписаться", uk: "Відписатися" },
    "network.groups": { en: "Groups", ru: "Группы", uk: "Групи" },
    "network.groupsHeading": { en: "Your groups", ru: "Ваши группы", uk: "Ваші групи" },
    "network.groupsSub": {
      en: "Mini group chats with people from your network.",
      ru: "Мини-чаты с людьми из вашей сети контактов.",
      uk: "Міні-чати з людьми з вашої мережі контактів.",
    },
    "network.groupMemberCount": { en: "{{count}} members", ru: "{{count}} участников", uk: "{{count}} учасників" },
    "network.groupNoMessages": { en: "No messages yet", ru: "Сообщений пока нет", uk: "Повідомлень поки немає" },
    "network.groupYouPrefix": { en: "You", ru: "Вы", uk: "Ви" },
    "network.groupYou": { en: "You", ru: "Вы", uk: "Ви" },
    "network.groupMessagePh": {
      en: "Write a message to the group…",
      ru: "Напишите сообщение в группу…",
      uk: "Напишіть повідомлення в групу…",
    },
    "network.groupMessageAria": { en: "Group message", ru: "Сообщение в группу", uk: "Повідомлення в групу" },
    "network.groupSend": { en: "Send", ru: "Отправить", uk: "Надіслати" },
    "network.groupUxName": { en: "UI/UX Design Hub", ru: "UI/UX Design Hub", uk: "UI/UX Design Hub" },
    "network.groupUxDesc": {
      en: "Design critiques, Figma tips, and portfolio feedback.",
      ru: "Дизайн-ревью, советы по Figma и обратная связь по портфолио.",
      uk: "Дизайн-рев'ю, поради щодо Figma та зворотний зв'язок щодо портфоліо.",
    },
    "network.groupUxMsg1": {
      en: "Anyone free for a quick design critique at 3pm?",
      ru: "Кто-нибудь свободен для быстрого design critique в 15:00?",
      uk: "Хтось вільний для швидкого design critique о 15:00?",
    },
    "network.groupUxMsg2": {
      en: "I can join — share the Figma link here.",
      ru: "Я могу — скиньте ссылку на Figma сюда.",
      uk: "Я можу — киньте посилання на Figma сюда.",
    },
    "network.groupUxReply1": {
      en: "Great point — I'll update the mockups.",
      ru: "Отличная мысль — обновлю макеты.",
      uk: "Чудова думка — оновлю макети.",
    },
    "network.groupUxReply2": {
      en: "Thanks! Let's sync on this tomorrow.",
      ru: "Спасибо! Давайте обсудим это завтра.",
      uk: "Дякую! Давайте обговоримо це завтра.",
    },
    "network.groupFeName": { en: "Frontend Circle", ru: "Frontend Circle", uk: "Frontend Circle" },
    "network.groupFeDesc": {
      en: "React, TypeScript, and code review for UI engineers.",
      ru: "React, TypeScript и code review для UI-инженеров.",
      uk: "React, TypeScript і code review для UI-інженерів.",
    },
    "network.groupFeMsg1": {
      en: "Pushed a PR for the new filter component — reviews welcome.",
      ru: "Запушил PR для нового filter component — жду ревью.",
      uk: "Запушив PR для нового filter component — чекаю на рев'ю.",
    },
    "network.groupFeMsg2": {
      en: "Left a few comments on accessibility — overall looks solid.",
      ru: "Оставил комментарии по accessibility — в целом выглядит хорошо.",
      uk: "Залишив коментарі щодо accessibility — загалом виглядає добре.",
    },
    "network.groupFeReply1": {
      en: "Merged — thanks for the quick review!",
      ru: "Смерджил — спасибо за быстрое ревью!",
      uk: "Змерджив — дякую за швидке рев'ю!",
    },
    "network.groupFeReply2": {
      en: "I'll pick that up in the next sprint.",
      ru: "Возьму это в следующий спринт.",
      uk: "Візьму це в наступний спринт.",
    },
    "network.events": { en: "Events", ru: "События" },
    "network.pages": { en: "Pages", ru: "Страницы", uk: "Сторінки" },
    "network.pagesHeading": { en: "Pages you follow", ru: "Страницы, на которые вы подписаны", uk: "Сторінки, на які ви підписані" },
    "network.pagesSub": {
      en: "Company and organization pages from your professional network.",
      ru: "Страницы компаний и организаций из вашей профессиональной сети.",
      uk: "Сторінки компаній та організацій з вашої професійної мережі.",
    },
    "network.pageFollow": { en: "Follow", ru: "Подписаться", uk: "Підписатися" },
    "network.pageFollowing": { en: "Following", ru: "Вы подписаны", uk: "Ви підписані" },
    "network.pageLatest": { en: "Latest", ru: "Свежее", uk: "Свеже" },
    "network.pageIndustryDesign": { en: "Design · Software", ru: "Дизайн · ПО", uk: "Дизайн · ПЗ" },
    "network.pageIndustryTech": { en: "Technology", ru: "Технологии", uk: "Технології" },
    "network.pageIndustryFintech": { en: "Financial technology", ru: "Финтех", uk: "Фінтех" },
    "network.pageIndustrySoftware": { en: "Software", ru: "Программное обеспечение", uk: "Програмне забезпечення" },
    "network.pageIndustryDevops": { en: "Cloud monitoring", ru: "Облачный мониторинг", uk: "Хмарний моніторинг" },
    "network.pageFollowers124": { en: "124K followers", ru: "124 тыс. подписчиков", uk: "124 тис. підписників" },
    "network.pageFollowers22m": { en: "22M followers", ru: "22 млн подписчиков", uk: "22 млн підписників" },
    "network.pageFollowers890": { en: "890K followers", ru: "890 тыс. подписчиков", uk: "890 тис. підписників" },
    "network.pageFollowers1m": { en: "1.2M followers", ru: "1,2 млн подписчиков", uk: "1,2 млн підписників" },
    "network.pageFollowers420": { en: "420K followers", ru: "420 тыс. подписчиков", uk: "420 тис. підписників" },
    "network.pageFigmaDesc": {
      en: "The collaborative interface design tool for teams building products together.",
      ru: "Инструмент для совместного UI/UX-дизайна для продуктовых команд.",
      uk: "Інструмент для спільного UI/UX-дизайну для продуктових команд.",
    },
    "network.pageFigmaUpdate": {
      en: "New: Dev Mode updates and improved design tokens workflow.",
      ru: "Новое: обновления Dev Mode и улучшенный workflow design tokens.",
      uk: "Нове: оновлення Dev Mode та покращений workflow design tokens.",
    },
    "network.pageMicrosoftDesc": {
      en: "Empowering every person and organization on the planet to achieve more.",
      ru: "Расширяем возможности каждого человека и организации на планете.",
      uk: "Розширюємо можливості кожної людини та організації на планеті.",
    },
    "network.pageMicrosoftUpdate": {
      en: "We're hiring across Azure, Copilot, and design systems teams.",
      ru: "Мы нанимаем в команды Azure, Copilot и design systems.",
      uk: "Ми наймаємо в команди Azure, Copilot і design systems.",
    },
    "network.pageStripeDesc": {
      en: "Financial infrastructure for the internet — payments, billing, and more.",
      ru: "Финансовая инфраструктура для интернета — платежи, биллинг и другое.",
      uk: "Фінансова інфраструктура для інтернету — платежі, білінг та інше.",
    },
    "network.pageStripeUpdate": {
      en: "Stripe Sessions 2026 registration is now open.",
      ru: "Открыта регистрация на Stripe Sessions 2026.",
      uk: "Відкрита реєстрація на Stripe Sessions 2026.",
    },
    "network.pageAtlassianDesc": {
      en: "Tools like Jira, Confluence, and Trello for agile teams worldwide.",
      ru: "Jira, Confluence и Trello для agile-команд по всему миру.",
      uk: "Jira, Confluence і Trello для agile-команд у всьому світі.",
    },
    "network.pageAtlassianUpdate": {
      en: "Tips for running effective sprint retrospectives with remote teams.",
      ru: "Советы по эффективным sprint retrospective для удалённых команд.",
      uk: "Поради щодо ефективних sprint retrospective для віддалених команд.",
    },
    "network.pageDatadogDesc": {
      en: "Modern monitoring and security platform for cloud-scale applications.",
      ru: "Платформа мониторинга и безопасности для облачных приложений.",
      uk: "Платформа моніторингу та безпеки для хмарних застосунків.",
    },
    "network.pageDatadogUpdate": {
      en: "Watch our webinar on SRE best practices for Kubernetes.",
      ru: "Смотрите вебинар о best practices SRE для Kubernetes.",
      uk: "Дивіться вебінар про best practices SRE для Kubernetes.",
    },
    "network.mainAria": { en: "Recommendations", ru: "Рекомендации" },
    "network.tabNew": { en: "New connections", ru: "Новые контакты" },
    "network.tabEvents": { en: "Events", ru: "События" },
    "network.peopleHeading": {
      en: "People in “UI/UX design” you may know",
      ru: "Люди в теме «UI/UX-дизайн», которых вы можете знать",
      uk: "Люди в темі «UI/UX-дизайн», яких ви можете знати",
    },
    "network.searchPh": {
      en: "Search people by name, role, or @handle",
      ru: "Поиск людей: имя, должность или @ник",
      uk: "Пошук людей: ім'я, посада або @нік",
    },
    "network.searchAria": { en: "Search contacts", ru: "Поиск контактов", uk: "Пошук контактів" },
    "network.searchStats": {
      en: "Showing {{visible}} of {{total}} people",
      ru: "Показано {{visible}} из {{total}} человек",
      uk: "Показано {{visible}} з {{total}} людей",
    },
    "network.searchResultsHeading": { en: "Search results", ru: "Результаты поиска", uk: "Результати пошуку" },
    "network.noPeopleResults": {
      en: "No people match your search. Try a different name, role, or keyword.",
      ru: "Никого не найдено. Попробуйте другое имя, должность или ключевое слово.",
      uk: "Нікого не знайдено. Спробуйте інше ім'я, посаду або ключове слово.",
    },
    "network.connect": { en: "Connect", ru: "Добавить в контакты" },
    "network.sent": { en: "Request sent", ru: "Запрос отправлен" },
    "network.withdraw": { en: "Withdraw", ru: "Отменить запрос" },
    "network.withdrawHint": {
      en: "Click to withdraw your connection request",
      ru: "Нажмите, чтобы отменить запрос на добавление",
    },
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
    "network.evExpand": { en: "Grow your network", ru: "Расширить сеть контактов", uk: "Розширити мережу контактів" },
    "network.evCareerItem": {
      en: "{{name}} started a new role as {{role}} at {{company}}",
      ru: "{{name}} начал(а) работу на должности «{{role}}» в {{company}}",
      uk: "{{name}} розпочав(ла) роботу на посаді «{{role}}» у {{company}}",
    },
    "network.evBirthdayItem": {
      en: "{{name}} celebrates a birthday {{when}}",
      ru: "У {{name}} день рождения {{when}}",
      uk: "У {{name}} день народження {{when}}",
    },
    "network.evBirthdayToday": { en: "today", ru: "сегодня", uk: "сьогодні" },
    "network.evBirthdayIn": { en: "in {{days}} days", ru: "через {{days}} дн.", uk: "через {{days}} дн." },
    "network.evEduItem": {
      en: "{{name}} completed {{program}}",
      ru: "{{name}} завершил(а) программу «{{program}}»",
      uk: "{{name}} завершив(ла) програму «{{program}}»",
    },
    "network.evTimeToday": { en: "Today", ru: "Сегодня", uk: "Сьогодні" },
    "network.evTimeSoon": { en: "Coming up", ru: "Скоро", uk: "Незабаром" },
    "network.evTime1d": { en: "1 day ago", ru: "1 день назад", uk: "1 день тому" },
    "network.evTime3d": { en: "3 days ago", ru: "3 дня назад", uk: "3 дні тому" },
    "network.evTime4d": { en: "4 days ago", ru: "4 дня назад", uk: "4 дні тому" },
    "network.evTime5d": { en: "5 days ago", ru: "5 дней назад", uk: "5 днів тому" },
    "network.evTime1w": { en: "1 week ago", ru: "1 неделю назад", uk: "1 тиждень тому" },
    "network.evTime2w": { en: "2 weeks ago", ru: "2 недели назад", uk: "2 тижні тому" },
    "network.evFilterEmpty": { en: "No updates in this category", ru: "Нет обновлений в этой категории", uk: "Немає оновлень у цій категорії" },
    "network.evFilterEmptySub": {
      en: "Try another filter or grow your network to see more activity.",
      ru: "Выберите другой фильтр или расширьте сеть контактов.",
      uk: "Оберіть інший фільтр або розширте мережу контактів.",
    },

    "vac.sidebarAria": { en: "Jobs menu", ru: "Меню вакансий" },
    "vac.params": { en: "Parameters", ru: "Параметры" },
    "vac.mine": { en: "My jobs", ru: "Мои вакансии", uk: "Мої вакансії" },
    "vac.mineTitle": { en: "My posted jobs", ru: "Мои опубликованные вакансии", uk: "Мої опубліковані вакансії" },
    "vac.mineSub": {
      en: "Vacancies you created with Post a job.",
      ru: "Вакансии, которые вы создали через «Разместить вакансию».",
      uk: "Вакансії, які ви створили через «Опублікувати вакансію».",
    },
    "vac.mineEmpty": {
      en: "You haven't posted any jobs yet. Create your first listing.",
      ru: "Вы ещё не публиковали вакансии. Создайте первую.",
      uk: "Ви ще не публікували вакансії. Створіть першу.",
    },
    "vac.minePostCta": { en: "Post a job", ru: "Разместить вакансию", uk: "Опублікувати вакансію" },
    "vac.browseJobs": { en: "Browse jobs", ru: "Все вакансии", uk: "Усі вакансії" },
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
    "vac.queriesClose": { en: "Close filters", ru: "Закрыть фильтры", uk: "Закрити фільтри" },
    "vac.queriesTitle": { en: "Quick filters", ru: "Быстрые фильтры", uk: "Швидкі фільтри" },
    "vac.queriesSub": {
      en: "Tap a tag to instantly filter job listings.",
      ru: "Нажмите на тег, чтобы сразу отфильтровать вакансии.",
      uk: "Натисніть на тег, щоб миттєво відфільтрувати вакансії.",
    },
    "vac.roleTitle": { en: "Graphic designer", ru: "Графический дизайнер" },
    "vac.roleSub": { en: "Remote · United States", ru: "Удалённо · США" },
    "vac.searchTitle": { en: "Advanced job search", ru: "Расширенный поиск вакансий", uk: "Розширений пошук вакансій" },
    "vac.searchSubtitle": {
      en: "Filter by role, location, work type, seniority, and salary — like LinkedIn.",
      ru: "Настройте фильтры как в LinkedIn: роль, локация, тип работы, уровень и зарплата.",
      uk: "Налаштуйте фільтри як у LinkedIn: роль, локація, тип роботи, рівень і зарплата.",
    },
    "vac.searchKeywords": { en: "Keywords", ru: "Ключевые слова", uk: "Ключові слова" },
    "vac.searchKeywordsPh": {
      en: "e.g. Frontend Developer, DevOps, React",
      ru: "Например: Frontend Developer, DevOps, React",
      uk: "Наприклад: Frontend Developer, DevOps, React",
    },
    "vac.searchLocation": { en: "Location", ru: "Локация", uk: "Локація" },
    "vac.searchLocationPh": { en: "Remote, Toronto, San Francisco", ru: "Remote, Toronto, San Francisco", uk: "Remote, Toronto, San Francisco" },
    "vac.searchType": { en: "Employment type", ru: "Тип занятости", uk: "Тип зайнятості" },
    "vac.searchTypeAny": { en: "Any", ru: "Любой", uk: "Будь-який" },
    "vac.searchTypeFull": { en: "Full-time", ru: "Полная занятость", uk: "Повна зайнятість" },
    "vac.searchTypePart": { en: "Part-time", ru: "Частичная занятость", uk: "Часткова зайнятість" },
    "vac.searchTypeContract": { en: "Contract", ru: "Контракт", uk: "Контракт" },
    "vac.searchTypeIntern": { en: "Internship", ru: "Стажировка", uk: "Стажування" },
    "vac.searchLevel": { en: "Seniority", ru: "Уровень", uk: "Рівень" },
    "vac.searchLevelAny": { en: "Any", ru: "Любой", uk: "Будь-який" },
    "vac.searchLevelEntry": { en: "Junior / Entry", ru: "Junior / Entry", uk: "Junior / Entry" },
    "vac.searchLevelMiddle": { en: "Middle", ru: "Middle", uk: "Middle" },
    "vac.searchLevelSenior": { en: "Senior", ru: "Senior", uk: "Senior" },
    "vac.searchLevelLead": { en: "Lead", ru: "Lead", uk: "Lead" },
    "vac.searchSalary": { en: "Min. salary (k $/year)", ru: "Мин. зарплата (k $/year)", uk: "Мін. зарплата (k $/year)" },
    "vac.searchSalaryPh": { en: "e.g. 80", ru: "Например: 80", uk: "Наприклад: 80" },
    "vac.searchSort": { en: "Sort by", ru: "Сортировка", uk: "Сортування" },
    "vac.searchSortRelevance": { en: "Relevance", ru: "По релевантности", uk: "За релевантністю" },
    "vac.searchSortSalaryDesc": { en: "Salary ↓", ru: "По зарплате ↓", uk: "За зарплатою ↓" },
    "vac.searchSortSalaryAsc": { en: "Salary ↑", ru: "По зарплате ↑", uk: "За зарплатою ↑" },
    "vac.searchSortNewest": { en: "Newest first", ru: "Сначала новые", uk: "Спочатку нові" },
    "vac.searchRemoteOnly": { en: "Remote only", ru: "Только удалёнка", uk: "Лише віддалено" },
    "vac.searchApply": { en: "Apply filters", ru: "Применить", uk: "Застосувати" },
    "vac.searchReset": { en: "Reset", ru: "Сбросить", uk: "Скинути" },
    "vac.searchFoldCollapse": { en: "Collapse", ru: "Свернуть", uk: "Згорнути" },
    "vac.searchFoldExpand": { en: "Expand", ru: "Развернуть", uk: "Розгорнути" },
    "vac.searchStats": {
      en: "Found: {{visible}} of {{total}} jobs",
      ru: "Найдено: {{visible}} из {{total}} вакансий",
      uk: "Знайдено: {{visible}} з {{total}} вакансій",
    },
    "vac.noResultsTitle": { en: "No jobs found", ru: "Ничего не найдено", uk: "Нічого не знайдено" },
    "vac.noResultsText": {
      en: "Try broadening filters, changing location, or lowering the minimum salary.",
      ru: "Попробуйте ослабить фильтры, изменить локацию или снизить минимальную зарплату.",
      uk: "Спробуйте послабити фільтри, змінити локацію або знизити мінімальну зарплату.",
    },
    "vac.itTitle": { en: "IT & Tech jobs", ru: "IT и технологии", uk: "IT і технології" },
    "vac.itSub": {
      en: "Software engineering, data, cloud, security, and product roles.",
      ru: "Разработка, данные, облако, безопасность и продуктовые роли.",
      uk: "Розробка, дані, хмара, безпека та продуктові ролі.",
    },
    "vac.hubAria": { en: "Your activity", ru: "Ваша активность", uk: "Ваша активність" },
    "vac.hubTabsAria": { en: "Activity filter", ru: "Фильтр активности", uk: "Фільтр активності" },
    "vac.postFormHint": {
      en: "Job posting form opened — fill in filters and save the vacancy.",
      ru: "Открыл форму публикации: заполните фильтры и сохраните вакансию.",
      uk: "Відкрито форму публікації: заповніть фільтри та збережіть вакансію.",
    },
    "vac.postModalTitle": { en: "Post a job", ru: "Разместить вакансию", uk: "Опублікувати вакансію" },
    "vac.postModalSub": {
      en: "Create a new listing — it appears in job picks right away.",
      ru: "Создайте новую вакансию — она сразу появится в подборке.",
      uk: "Створіть нову вакансію — вона одразу з'явиться у підборці.",
    },
    "vac.postRole": { en: "Job title", ru: "Название должности", uk: "Назва посади" },
    "vac.postRolePh": { en: "e.g. Frontend Developer", ru: "Например: Frontend Developer", uk: "Наприклад: Frontend Developer" },
    "vac.postCompany": { en: "Company", ru: "Компания", uk: "Компанія" },
    "vac.postCompanyPh": { en: "e.g. Acme Inc", ru: "Например: Acme Inc", uk: "Наприклад: Acme Inc" },
    "vac.postLocation": { en: "Location", ru: "Локация", uk: "Локація" },
    "vac.postLocationPh": { en: "Remote, Kyiv, Berlin…", ru: "Remote, Kyiv, Berlin…", uk: "Remote, Kyiv, Berlin…" },
    "vac.postDesc": { en: "Job description", ru: "Описание вакансии", uk: "Опис вакансії" },
    "vac.postDescPh": {
      en: "Describe responsibilities, stack, and requirements…",
      ru: "Опишите обязанности, стек и требования…",
      uk: "Опишіть обов'язки, стек і вимоги…",
    },
    "vac.postKeywords": { en: "Keywords (optional)", ru: "Ключевые слова (необязательно)", uk: "Ключові слова (необов'язково)" },
    "vac.postKeywordsPh": { en: "react, typescript, remote", ru: "react, typescript, remote", uk: "react, typescript, remote" },
    "vac.postRemote": { en: "Work format", ru: "Формат работы", uk: "Формат роботи" },
    "vac.postRemoteOnsite": { en: "On-site", ru: "В офисе", uk: "В офісі" },
    "vac.postRemoteHybrid": { en: "Hybrid", ru: "Гибрид", uk: "Гібрид" },
    "vac.postRemoteRemote": { en: "Remote", ru: "Удалённо", uk: "Віддалено" },
    "vac.postSubmit": { en: "Publish job", ru: "Опубликовать", uk: "Опублікувати" },
    "vac.postSalaryMax": { en: "Max. salary (k $/year)", ru: "Макс. зарплата (k $/year)", uk: "Макс. зарплата (k $/year)" },
    "vac.postDone": { en: "Job published", ru: "Вакансия опубликована", uk: "Вакансію опубліковано" },
    "vac.postFillRequired": { en: "Fill in all required fields", ru: "Заполните обязательные поля", uk: "Заповніть обов'язкові поля" },
    "vac.meta.dayAgo": { en: "1 day ago", ru: "1 день назад", uk: "1 день тому" },
    "vac.meta.daysAgo": { en: "{{n}} days ago", ru: "{{n}} дн. назад", uk: "{{n}} дн. тому" },
    "vac.meta.weekAgo": { en: "1 week ago", ru: "1 неделю назад", uk: "1 тиждень тому" },
    "vac.meta.weeksAgo": { en: "{{n}} weeks ago", ru: "{{n}} нед. назад", uk: "{{n}} тиж. тому" },
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
    "chat.call": { en: "Call", ru: "Позвонить", uk: "Подзвонити" },
    "chat.callRinging": { en: "Calling…", ru: "Звоним…", uk: "Дзвонимо…" },
    "chat.callConnecting": { en: "Connecting…", ru: "Соединение…", uk: "З'єднання…" },
    "chat.callConnected": { en: "Connected", ru: "На связи", uk: "На зв'язку" },
    "chat.callEnded": { en: "Call ended", ru: "Звонок завершён", uk: "Дзвінок завершено" },
    "chat.callEnd": { en: "End call", ru: "Завершить", uk: "Завершити" },
    "chat.callMute": { en: "Mute", ru: "Без звука", uk: "Без звуку" },
    "chat.callUnmute": { en: "Unmute", ru: "Со звуком", uk: "Зі звуком" },
    "chat.callSpeaker": { en: "Speaker", ru: "Динамик", uk: "Динамік" },
    "chat.callClose": { en: "Close", ru: "Закрыть", uk: "Закрити" },
    "chat.searchThread": { en: "Search in chat", ru: "Поиск в чате" },
    "chat.searchThreadFocus": {
      en: "Type a name in the search field on the left",
      ru: "Введите имя собеседника в поиск слева",
    },
    "chat.searchThreadOpen": { en: "Chat search is open", ru: "Поиск чата открыт" },
    "chat.attachDone": { en: "File attached: {{name}}", ru: "Файл прикреплён: {{name}}" },
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
    "reg.socialOr": { en: "or", ru: "или", uk: "або" },
    "reg.continueGoogle": { en: "Continue with Google", ru: "Продолжить через Google", uk: "Продовжити через Google" },
    "reg.continueFacebook": { en: "Continue with Facebook", ru: "Продолжить через Facebook", uk: "Продовжити через Facebook" },
    "reg.socialConnecting": {
      en: "Connecting to {{provider}}…",
      ru: "Подключение к {{provider}}…",
      uk: "Підключення до {{provider}}…",
    },
    "reg.socialSuccess": {
      en: "Signed in with {{provider}}.",
      ru: "Вход через {{provider}} выполнен.",
      uk: "Вхід через {{provider}} виконано.",
    },
    "reg.socialError": {
      en: "Could not sign in with this provider. Try again.",
      ru: "Не удалось войти через этот сервис. Попробуйте снова.",
      uk: "Не вдалося увійти через цей сервіс. Спробуйте ще раз.",
    },
    "reg.providerGoogle": { en: "Google", ru: "Google", uk: "Google" },
    "reg.providerFacebook": { en: "Facebook", ru: "Facebook", uk: "Facebook" },
    "reg.socialStepConnect": {
      en: "Connecting to {{provider}}…",
      ru: "Подключение к {{provider}}…",
      uk: "Підключення до {{provider}}…",
    },
    "reg.socialStepSecure": {
      en: "Securing your session…",
      ru: "Защищаем вашу сессию…",
      uk: "Захищаємо вашу сесію…",
    },
    "reg.socialStepDone": {
      en: "You're all set!",
      ru: "Готово!",
      uk: "Готово!",
    },
    "reg.socialWelcome": {
      en: "Welcome, {{name}}",
      ru: "Добро пожаловать, {{name}}",
      uk: "Ласкаво просимо, {{name}}",
    },
    "reg.socialRedirect": {
      en: "Redirecting…",
      ru: "Перенаправление…",
      uk: "Перенаправлення…",
    },
    "reg.socialLabelConnect": { en: "Connect", ru: "Связь", uk: "Зв'язок" },
    "reg.socialLabelSecure": { en: "Secure", ru: "Защита", uk: "Захист" },
    "reg.socialLabelDone": { en: "Done", ru: "Готово", uk: "Готово" },
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
    "reg.errFillAll": { en: "Please fill in all fields.", ru: "Заполните все поля.", uk: "Заповніть усі поля." },
    "reg.errUserExists": { en: "User already exists.", ru: "Пользователь уже существует.", uk: "Користувач уже існує." },
    "reg.errRegister": {
      en: "Registration failed. Please try again.",
      ru: "Не удалось зарегистрироваться.",
      uk: "Не вдалося зареєструватися.",
    },

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

  function tForLang(key, lang) {
    const row = STRINGS[key];
    if (!row) return key;
    const l = lang === "en" || lang === "uk" ? lang : "ru";
    return row[l] ?? row.ru ?? row.en ?? key;
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
  window.uiTForLang = tForLang;
  window.uiTmpl = (key, vars) => applyTemplate(t(key), vars);
  window.getUiLang = getLang;
  window.setUiLang = setLang;
  window.applyDomTranslations = applyDomTranslations;
  window.syncThemeToggleI18n = syncThemeToggleI18n;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
