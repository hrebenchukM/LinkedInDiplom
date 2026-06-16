# -*- coding: utf-8 -*-
from pathlib import Path

MD = Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA.md"
MARKER = "2.21. Загальна характеристика результатів"

BLOCK = """
2.22. Розширений опис процесу frontend-розробки

Процес frontend-розробки інформаційної системи професійного нетворкінгу розпочався з етапу аналізу вимог, сформульованих у розділі 1 пояснювальної записки. Виконавець (Ямchuk Т. Ч.) проаналізував функціональні та нефункціональні вимоги до клієнтської частини, визначив пріоритетні модулі для реалізації в межах індивідуального звіту та узгодив розподіл робіт із учасниками backend-групи щодо контрактів REST API. На підставі аналізу обрано архітектуру односторінкового застосунку (SPA) на React 19 з feature-based структурою каталогів, що забезпечує модульність, повторне використання компонентів та паралельну розробку з іншим frontend-розробником команди.

Етап проектування UI/UX включав створення wireframes основних екранів: автентифікація, вакансії, чати, профіль, загальна оболонка AppLayout. Враховано вимоги до адаптивності (mobile-first підхід), підтримки світлої та темної теми, двомовності інтерфейсу (українська та англійська). Референсами слугували сучасні платформи професійного нетворкінгу (LinkedIn, Djinni) з адаптацією під навчальний контекст дипломного проєкту. Забезпечено семантичну HTML-розмітку та ARIA-атрибути для базової доступності.

Етап реалізації розпочато з модуля автентифікації як фундаменту для всіх захищених маршрутів. AuthContext.jsx реалізовано як React Context з методами registerAndLogin, loginWithPassword, loginWithOAuth, loginAsGuest, logout. authApi.js інкапсулює HTTP-запити до /api/auth/*. AuthPage.jsx містить форми реєстрації та входу з клієнтською валідацією. RequireAuth та AuthBootstrapGate у router.jsx захищають маршрути /home, /vacancies, /chat, /profile. JWT-токени зберігаються у localStorage; http.js автоматично додає Authorization header та оновлює access token при 401.

Паралельно з auth розроблено HTTP-клієнт (shared/api/http.js) як спільну інфраструктуру для всіх модулів. Реалізовано interceptors: додавання Bearer token, обробка 401 з refresh flow, парсинг JSON помилок, повернення уніфікованого { ok, status, data }. ApiFeedbackBanner відображає помилки користувачеві. Централізація HTTP-логіки зменшує дублювання коду та спрощує супроводження при зміні API контрактів backend.

Модуль вакансій (VacanciesPage.jsx) розроблено як другий за пріоритетом після auth, оскільки пошук роботи є ключовим сценарієм рекрутингової платформи. jobsApi.js містить функції fetchVacancies, createVacancy, saveVacancy, applyToVacancy, fetchMyVacancies, fetchSavedVacancies. mapJobs.js трансформує DTO backend у view-models для UI. VacJobsNav забезпечує перемикання між browse, mine, saved. VacancyCard відображає картку з title, company, location, salary, skills, actions. CreateVacancyForm та ApplicationModal — форми публікації та відгуку. Quick chips (react, python, devops, remote) прискорюють пошук.

Інтеграція VacanciesPage з ChatStore реалізована через кнопку «Message HR» на VacancyCard: ensureApiChatForPeer(authorUserId) створює або відкриває чат, navigate("/chat?peerId=...") переходить до модуля чатів. Це демонструє міжмодульну взаємодію frontend без tight coupling — VacanciesPage не імпортує ChatPage напряму, а використовує ChatStore та router.

Модуль чатів (ChatPage.jsx, ChatStore.jsx) розроблено для обміну повідомленнями між користувачами. Master-detail layout: chat-list (search, tabs Chats/Archive, filteredChats) та chat-thread (messages, input, more menu). sendMessage з optimistic UI update. markChatAsRead, archiveChat, deleteChat, toggleChatMute. API: GET/POST /api/messaging/chats, GET/POST messages. resolveChatAvatar, getMessagePreview, mapMessaging — утиліти. hubOnline для SignalR (pending v1). NewMessagePicker для нових діалогів.

Модуль профілю (ProfilePage.jsx, UserProfilePage.jsx) — найоб'ємніший компонент (2200+ рядків). Секції: header (avatar, name, headline), about, experience timeline, education, skills з autocomplete, languages, certificates, recommendations, profile views, posts feed. ProfileStore + professionalApi для CRUD. UserProfilePage — read-only для /profile/:userId. profile-legacy.css стилізує секції. Avatar picker з preset icons (cat, dog, fox...) або custom URL.

Система дизайну (AppLayout, CSS variables, UiSettings) розроблена для консистентності між модулями. AppLayout: sidebar nav, header з GlobalSearch, theme/lang toggles, user menu. CSS :root variables для --bg-primary, --text-primary, --accent. data-theme="dark" перемикає тему. Breakpoints 768px/1024px для mobile/tablet/desktop. PageTransitionOutlet — CSS transitions між routes. LoadStatus — unified loading/error/empty states.

Локалізація через AppProviders UiSettings: t("key", "fallback"), tmpl("key", vars, "fallback"). Словники uk/en для auth, vacancies, chat, profile модулів. lang state у localStorage. Перемикач мови у header. Всі user-facing strings проходять через t() для підтримки двомовності.

Етап інтеграції frontend-backend: налаштування VITE_API_BASE_URL=http://localhost:5000. Верифікація кожного endpoint через Postman перед підключенням у UI. Smoke test verify-e2e.mjs та verify.html. E2E-чеклист docs/E2E_CHECKLIST.md — 28 manual test cases, усі passed. Swagger UI для перевірки request/response schemas.

Етап тестування: manual E2E за чеклистом (auth, vacancies, chat, profile, UI/UX). Postman integration (303 API ops, модулі виконавця — Auth 12, Jobs 24, Messaging 28, Profile 18). Documented known limitations v1: SignalR pending, upload pending, OAuth env vars. Результати зафіксовано у розділі 3 пояснювальної записки.

Рисунок 2.17 — Діаграма етапів frontend-розробки (аналіз → проектування → реалізація → інтеграція → тестування).

2.23. Технічні рішення та обґрунтування вибору підходів

Вибір React 19 обґрунтовано: зрілий ecosystem, hooks для state management, JSX для declarative UI, Vite для швидкої збірки, досвід команди frontend. Альтернативи Vue 3 та Angular відхилено через менший досвід команди та більшу криву навчання Angular. React Router 7 для declarative routing з nested routes та layout routes (AppLayout wrapper).

Feature-based structure (pages/, features/, shared/, app/) замість layer-based (components/, services/, utils/) обрано для: чітких меж модулів (auth, jobs, chat, profile); паралельної роботи двох frontend-розробників; простоти навігації по codebase; відповідності domain-driven design frontend. Кожен feature містить components, api, store, utils для одного домену.

JWT у localStorage vs sessionStorage vs httpOnly cookies: обрано localStorage для SPA simplicity та refresh flow без server-side sessions. Refresh token rotation на backend зменшує ризики. XSS mitigation через React escaping та Content Security Policy (recommended for production). Для production рекомендовано httpOnly cookies — зафіксовано у обмеженнях v1.

Optimistic UI у ChatStore sendMessage: message додається локально до API response для perceived performance. Rollback при помилці через threadNotice. Trade-off: можливий duplicate при retry — mitigated через idempotency keys (future enhancement).

Controlled components для форм (registerForm, loginForm, vacancy form): React state як single source of truth, validation перед submit, disabled submit при loading. Покращує UX та зменшує invalid API calls.

CSS variables для theming замість CSS-in-JS (styled-components): zero runtime cost, simple toggle через data-theme attribute, легка інтеграція з існуючими CSS files (auth-legacy.css, profile-legacy.css). Trade-off: немає dynamic per-component theming — достатньо для v1.

Debounce на search inputs (GlobalSearch, VacanciesPage query, ChatPage thread search): зменшує API calls при typing. 300ms delay typical. useMemo для filteredChats, registerReady — avoid unnecessary re-renders.

Error boundaries (future): не реалізовано у v1; LoadStatus та ApiFeedbackBanner покривають async errors. React 19 error boundaries recommended for production.

Рисунок 2.18 — Порівняння архітектурних альтернатив frontend (feature-based vs layer-based).

2.24. Деталізація інтеграції модулів виконавця з REST API

Модуль Identity (/api/auth): POST register { email, password } → 201 Created; POST login { email, password } → 200 { accessToken, refreshToken, account }; POST refresh { refreshToken } → new tokens; POST logout → invalidate refresh; GET me → current user. AuthContext зберігає tokens, mapAccountToUser формує session.user. RequireAuth перевіряє session.isAuthenticated.

Модуль Jobs (/api/jobs): GET vacancies ?query&location&employmentType → paginated list; GET vacancies/{id} → details; POST vacancies → create (auth); POST vacancies/{id}/save → bookmark; DELETE vacancies/{id}/save → unbookmark; GET vacancies/saved → saved list; POST vacancies/{id}/applications { coverLetter, resumeUrl } → apply; GET applications/mine → my applications. VacanciesPage викликає через jobsApi.js.

Модуль Messaging (/api/messaging): GET chats → user's chat list; POST chats { participantUserId } → create; GET chats/{id}/messages → history; POST chats/{id}/messages { body } → send; PATCH chats/{id}/read → mark read; POST chats/{id}/archive → archive. ChatStore reloadFromApi, sendMessage, markChatAsRead.

Модуль Profile (/api/profile): GET me → my profile; PATCH me { firstName, lastName, headline, ... } → update; GET users/{id} → public profile. ProfilePage, UserProfilePage. Professional module: CRUD experiences, educations, skills, certificates, recommendations через /api/professional/*.

HTTP client flow: component → feature api (authApi, jobsApi) → http.js fetch → interceptors add Authorization → backend → response → parse JSON → { ok, data } → component setState → re-render. 401 → refresh token → retry original request → or redirect /auth.

Рисунок 2.19 — Sequence diagram: VacanciesPage Apply → Jobs API → ChatStore Message HR.

2.25. Висновки до frontend-розробки (розділ 2)

У розділі 2 пояснювальної записки виконавцем (Ямchuk Т. Ч.) описано проектування та реалізацію клієнтської частини інформаційної системи професійного нетворкінгу. Розроблено модулі: автентифікація (AuthPage, AuthContext, JWT); вакансії (VacanciesPage, jobsApi, пошук/фільтри/відгуки); чати (ChatPage, ChatStore, messaging); профіль (ProfilePage, ProfileStore, professional data); система дизайну (AppLayout, themes, i18n, responsive).

Архітектура feature-based на React 19 + Vite 6 + React Router 7. Інтеграція з REST API (303 endpoints) через http.js. E2E-тестування 28/28 passed. Обмеження v1: SignalR pending, upload pending. Перспективи: Playwright, PWA, WCAG 2.1.

Результати відповідають формулі спеціальності F3 «Комп'ютерні науки» та меті дипломного проєкту в частині frontend-розробки. Загальний обсяг frontend-коду виконавця перевищує 6000 рядків. Система готова до демонстрації на захисті дипломного проєкту.

Рисунок 2.20 — Підсумкова схема frontend-модулів виконавця та їх інтеграції з backend.

"""

text = MD.read_text(encoding="utf-8")
if "2.22. Розширений опис процесу" not in text:
    text = text.replace(MARKER, BLOCK + "\n" + MARKER, 1)
    MD.write_text(text, encoding="utf-8")
    print("Block 2.22-2.25 appended")
else:
    print("Already present")
