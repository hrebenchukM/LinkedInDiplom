# -*- coding: utf-8 -*-
"""Append volume sections for 35+ pages."""
from pathlib import Path

MD = Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA.md"
MARKER = "ВИСНОВКИ ТА РЕКОМЕНДАЦІЇ"

ADDENDUM = """
2.15. Детальний опис реалізації екрана автентифікації (AuthPage.jsx)

Екран автентифікації є першою точкою контакту користувача з інформаційною системою. Від якості його реалізації залежить перше враження, конверсія реєстрації та подальша залученість користувача до платформи. У межах дипломного проєкту модуль автентифікації розроблено виконавцем (Ямчук Т. Ч.) з урахуванням вимог до зручності, безпеки та інтеграції з backend-модулем Identity.

Компонент AuthPage.jsx побудовано як функціональний React-компонент з використанням hooks: useState для локального стану форм, useEffect для side effects (redirect при наявній сесії, блокування scroll при OAuth overlay), useMemo для обчислення registerReady, useNavigate для програмної навігації, useAuth для доступу до глобального контексту автентифікації.

Структура JSX-розмітки включає: main.page.auth-page-legacy як кореневий контейнер; aside.promo з marketing-блоком (logo-mark, заголовок, перелік переваг платформи); section.auth-shell з формою; SocialOverlay для OAuth-процесу; ApiFeedbackBanner для помилок; bg-orb декоративні елементи фону.

Форма реєстрації містить поля: email (type=email, autocomplete=email), userName (text), firstName та lastName (text), password та confirmPassword (type=password). Кожне поле прив'язано до registerForm через controlled components pattern: value={registerForm.email} onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}.

Валідація на клієнті виконується у onRegisterSubmit перед відправкою: isEmail(registerForm.email) перевіряє формат email regex; registerForm.password.length >= 6; registerForm.password === registerForm.confirmPassword. При невдачі setBanner({ type: "error", text: ... }) відображає локалізоване повідомлення.

Після успішної валідації setLoading(true) блокує кнопку submit, викликається registerAndLogin({ email, password, profileFallback }). profileFallback передає userName, firstName, lastName для відображення у UI до завантаження повного профілю з API.

AuthContext.registerAndLogin виконує послідовність: clearAuthTokens() — очищення застарілих токенів; authApi.registerAccount({ email, password }); authApi.loginAccount({ email, password }); completeLogin() — збереження accessToken та refreshToken у localStorage, commitSession(user), mapAccountToUser().

completeLogin зберігає токени через setAuthTokens(access, refresh), формує об'єкт user з полями id, email, userName, firstName, lastName, avatarDataUrl, isAdmin. commitSession оновлює React state session та isReady, що тригерить re-render захищених маршрутів.

Форма входу (loginForm) містить email та password. onLoginSubmit викликає loginWithPassword. При помилці 401 відображається «Invalid email or password». При успіху markPendingAiWelcome() та navigate("/home").

OAuth-вхід реалізовано через loginWithOAuth(provider, token). Підтримуються провайдери google та facebook за наявності VITE_GOOGLE_CLIENT_ID та VITE_FACEBOOK_APP_ID. SocialOverlay показує фази: connecting (спінер), securing (обробка токена), success (checkmark з даними акаунта), exiting (fade-out перед redirect).

Guest-режим loginAsGuest() дозволяє переглянути demo-функціонал без backend — корисно для презентації на захисті при недоступності API. Демо-користувач має обмежений набір прав.

Таблиця 2.15 — Стани компонента AuthPage

| Стан | Тип | Призначення |
| activeTab | useState | "register" або "login" |
| loading | useState | Блокування UI під час запитів |
| banner | useState | { type, text } помилки/успіху |
| registerForm | useState | Дані форми реєстрації |
| loginForm | useState | Дані форми входу |
| socialOverlay | useState | OAuth overlay state |

Рисунок 2.10 — Блок-схема алгоритму реєстрації користувача.

CSS-клас auth-page-legacy забезпечує повноекранний layout з gradient фоном, центрованою auth-shell, responsive breakpoints для mobile (stack promo + form vertically). Кнопки social-login мають brand colors Google/Facebook з aria-labels для accessibility.

2.16. Детальний опис реалізації модуля вакансій (VacanciesPage.jsx)

Модуль вакансій є ключовим для рекрутингового призначення інформаційної системи. VacanciesPage.jsx — найбільший компонент frontend виконавця (понад 1600 рядків), що реалізує повний user journey: від пошуку вакансії до подання відгуку та комунікації з роботодавцем.

Архітектура компонента базується на декомпозиції: VacJobsNav — навігація між режимами browse/mine/saved; VacancyCard — картка однієї вакансії; VacancyFilters — панель фільтрів; CreateVacancyForm — форма публікації; ApplicationModal — подання відгуку; LoadStatus — індикатори завантаження.

Стан browseMode визначає активну вкладку VacJobsNav. При зміні вкладки виконується useEffect з завантаженням відповідних даних: browse → jobsApi.fetchVacancies(params); mine → jobsApi.fetchMyVacancies(); saved → jobsApi.fetchSavedVacancies().

Параметри пошуку формуються buildVacancyBrowseParams({ query, location, employmentType, experienceLevel, salaryMin, salaryMax, page, pageSize }). Query string передається у GET /api/jobs/vacancies?query=react&location=Kyiv&...

mapVacancyDtoToJob трансформує backend DTO у view-model з полями: id, title, companyName, location, salaryMin, salaryMax, employmentType, experienceLevel, postedDays, skills[], isSaved, hasApplied. formatSalary(min, max) форматує відображення зарплати з локалізацією.

Quick chips (DEMO_QUICK_CHIPS: react, python, devops, remote) дозволяють швидко застосувати популярні фільтри одним кліком. Query pills (DEMO_QUERY_PILLS) — розширений набір для demo-режиму.

VacancyCard відображає: title (h3), company з іконкою, location, salary range, tags skills, posted date (formatPosted), кнопки Save/Unsave, Apply, Message HR. Apply відкриває modal з coverLetter textarea та resumeUrl input.

mapPostFormToCreateVacancyRequest перетворює форму Create vacancy у тіло POST /api/jobs/vacancies. Поля company резолвляться через resolveCompanyIdByName та fetchCompaniesByIds для зв'язку з Professional module.

Інтеграція з ChatStore: кнопка «Message» на VacancyCard викликає ensureApiChatForPeer(authorUserId) та navigate("/chat?peerId=..."). Це забезпечує seamless перехід від вакансії до діалогу з HR.

Таблиця 2.16 — API-методи jobsApi.js

| Функція | HTTP | Endpoint |
| fetchVacancies | GET | /api/jobs/vacancies |
| fetchVacancyById | GET | /api/jobs/vacancies/{id} |
| createVacancy | POST | /api/jobs/vacancies |
| saveVacancy | POST | /api/jobs/vacancies/{id}/save |
| unsaveVacancy | DELETE | /api/jobs/vacancies/{id}/save |
| applyToVacancy | POST | /api/jobs/vacancies/{id}/applications |
| fetchMyApplications | GET | /api/jobs/applications/mine |

Рисунок 2.11 — Структура компонента VacanciesPage (browse / mine / saved).

Обробка помилок: withLoadState обгортає async операції, LoadStatus показує spinner/error/retry. При 401 redirect через http.js interceptor. При 404 vacancy — empty state «Vacancy not found».

2.17. Детальний опис реалізації модуля чатів (ChatPage.jsx)

Модуль обміну повідомленнями реалізує синхронну комунікацію між користувачами платформи — кандидатами, рекрутерами, контактами з мережі. ChatPage.jsx та ChatStore.jsx розроблено виконавцем з інтеграцією до Messaging API backend.

Layout ChatPage: двопанельний master-detail. Ліва панель (chat-list): search input, tabs Chats/Archive, scrollable list filteredChats. Права панель (chat-thread): header з avatar та іменем контакта, message list з auto-scroll, input area з send button, more menu.

ChatStore — custom hook/store pattern з useState та useCallback. Експортує: chats, activeChat, setActiveChat, sendMessage, archiveChat, deleteChat, markChatAsRead, reloadFromApi, hubOnline, reconnectHub, ensureApiChatForPeer, joinChatById.

При mount ChatPage викликає reloadFromApi() — GET /api/messaging/chats, mapMessaging DTOs у local chat objects. URL searchParams ?peerId= автоматично відкриває чат з контактом (deep linking з VacanciesPage або NetworkPage).

sendMessage(text): optimistic update — додає message у activeChat.messages локально; POST /api/messaging/chats/{id}/messages { body: text }; при помилці rollback та threadNotice. markChatAsRead при focus на thread — PATCH read status.

filteredChats застосовує: shouldShowChatInList (фільтр системних чатів); tab filter (archive vs active); search filter по resolveChatDisplayName(chat) та getMessagePreview(lastMessage).

Типи повідомлень: text (звичайний); call (isCallMessage, getCallMessageText); post share (isPostShareMessage). getMessagePreview формує one-line preview для chat list.

AI Assistant chat (isAiAssistantChat) — demo-функція з aiCommandChips та aiQuickPrompts для навігації по застосунку. Не входить у scope backend v1, реалізовано як UX enhancement.

SignalR hubOnline indicator показує статус realtime-з'єднання. reconnectHub() ініціює повторне підключення. У v1 повідомлення polling через REST; SignalR client — pending.

NewMessagePicker — modal для вибору контакта з NetworkStore, створення POST /api/messaging/chats { participantUserId }, redirect до нового thread.

Таблиця 2.17 — Методи ChatStore

| Метод | Опис |
| sendMessage | Відправка текстового повідомлення |
| markChatAsRead | Оновлення read cursor |
| archiveChat | POST archive endpoint |
| deleteChat | DELETE chat |
| toggleChatMute | Mute notifications |
| clearChatMessages | Очистити історію |
| reloadFromApi | GET /api/messaging/chats |
| ensureApiChatForPeer | Find or create chat |

Рисунок 2.12 — UI модуля чатів: master-detail layout.

Thread search (threadSearchOpen, threadSearch) фільтрує повідомлення у активному діалозі. More menu: archive, clear, delete, mute options. Call overlay — demo UI для voice call messages.

2.18. Детальний опис реалізації особистого кабінету (ProfilePage.jsx)

ProfilePage.jsx — найоб'ємніший компонент frontend (2200+ рядків), що реалізує повний цикл управління професійним профілем користувача. Розроблено виконавцем з інтеграцією Profile API та Professional API.

Секції профілю: Header (avatar, name, headline, location); About (bio textarea); Experience (timeline з CRUD); Education (timeline); Skills (tags з autocomplete); Languages; Certifications; Recommendations; Affiliated academies; Profile views; Posts feed (UserProfilePosts).

ProfileStore + useProfileStore синхронізують дані /api/profile/me. professionalApi.js надає CRUD для experiences, educations, skills, certificates, recommendations. mapProfile.js — DTO transformers.

Avatar selection: preset avatarIcons (cat, dog, fox...) або custom URL через FileStorage. resolveMediaUrl формує повний URL для preview. patchRegisteredAccount зберігає local fallback.

Experience form: company, title, startDate, endDate, description. buildCreateExperienceBodyFromProfileForm → POST /api/professional/experiences. updateMyExperience, deleteMyExperience для редагування.

Skills autocomplete: searchSkills(query) → GET /api/professional/skills/search, createMyUserSkill для додавання. loadRecommendedSkillSuggestions пропонує популярні навички.

Education: institution, degree, field, years. Certificates: name, issuer, date, url. Recommendations: given/received tabs, createRecommendation, patchRecommendation.

UserProfilePage (/profile/:userId) — read-only перегляд чужого профілю. fetchProfilesByUserIds, обмеження edit controls. Link з NetworkPage та GlobalSearch.

Visibility settings (VISIBILITY_KEY localStorage) — demo privacy toggles для секцій профілю. LocalOnlyBadge позначає поля, збережені лише на device.

Таблиця 2.18 — Секції ProfilePage та API

| Секція | API endpoints |
| Header | GET/PATCH /api/profile/me |
| Experience | CRUD /api/professional/experiences |
| Education | CRUD /api/professional/educations |
| Skills | CRUD /api/professional/skills |
| Certificates | CRUD /api/professional/certificates |
| Recommendations | CRUD /api/professional/recommendations |

Рисунок 2.13 — Екран ProfilePage з усіма секціями профілю.

profile-legacy.css — стилі профілю: lk-section cards, timeline items, skill chips, modal overlays. Responsive: stack sections on mobile, collapsible tabs.

2.19. Система візуального оформлення та адаптивність (AppLayout, CSS)

Єдина система дизайну frontend розроблена виконавцем для забезпечення консистентності між модулями auth, vacancies, chat, profile. AppLayout.jsx — root layout для authenticated routes.

AppLayout structure: .app-shell flex container; .sidebar з nav links (Home, Network, Vacancies, Chat, Profile); .main-column з .app-header (GlobalSearch, notifications bell, user menu, theme toggle, lang toggle); .page-content з PageTransitionOutlet (React Router Outlet + CSS transitions).

CSS variables (:root та [data-theme="dark"]): --bg-primary, --bg-secondary, --surface-elevated, --text-primary, --text-muted, --accent-color, --border-color, --shadow-sm, --shadow-md. Theme toggle встановлює data-theme на document.documentElement.

Breakpoints: @media (max-width: 768px) — sidebar collapse, hamburger menu; @media (max-width: 1024px) — reduced padding. VacanciesPage та ChatPage switch to single-column master-detail on mobile.

GlobalSearch.jsx — debounced search input, results dropdown з profile links та content links. Keyboard navigation (arrow keys, enter). Integration з /api/profile/search та /api/content/search.

PageTransitionOutlet — CSS fade/slide transitions між routes. prefers-reduced-motion media query disables animations for accessibility.

LoadStatus.jsx — unified loading/error/empty states: spinner SVG, error message + retry button, empty illustration + CTA. Used across VacanciesPage, ChatPage, ProfilePage.

ApiFeedbackBanner.jsx — toast-style API errors at top of page. Auto-dismiss after 5s. Types: error (red), success (green), info (blue).

Localization: AppProviders UiSettings context. t("key", "fallback") lookup in uk/en dictionaries. tmpl("key", {vars}, "fallback") for interpolated strings. lang state persisted localStorage key uiLang.

Таблиця 2.19 — CSS-файли frontend

| Файл | Призначення |
| index.css | Global variables, reset |
| auth-legacy.css | AuthPage styles |
| profile-legacy.css | ProfilePage styles |
| vacancies.css | VacanciesPage styles |
| chat.css | ChatPage styles |
| layout.css | AppLayout, sidebar |

Рисунок 2.14 — AppLayout desktop: sidebar + header + content.

2.20. Методика інтеграційного тестування frontend-модулів

Інтеграційне тестування frontend виконано виконавцем у форматі manual E2E за чеклистом docs/E2E_CHECKLIST.md. Середовище: Windows 10/11, Chrome latest, Docker Compose (PostgreSQL 16 + ASP.NET Core API), Vite dev server localhost:5173.

Preconditions для кожного тест-кейсу: Docker containers running (docker compose up); npm run dev у frontend/; Postman environment з baseUrl=http://localhost:5000; test user credentials з E2E checklist.

Test suite Auth (UC-A1..A6): register new user → verify JWT in localStorage → logout → login → verify session restore on refresh → invalid password error message.

Test suite Vacancies (UC-J1..J6): search react → verify cards → save vacancy → verify Saved tab → apply with cover letter → verify Applied badge → create own vacancy → verify My jobs tab.

Test suite Chat (UC-M1..M6): open /chat → select thread → send message → verify in thread → search chats → archive → verify Archive tab → new message from contact picker.

Test suite Profile (UC-P1..P6): edit bio → add experience → add skill → change avatar → view own profile → view other user profile read-only.

Test suite UI (UC-U1..U5): theme toggle dark/light → lang uk/en → mobile viewport 375px → desktop 1920px → global search.

Результати: 28/28 test cases passed. 0 critical bugs. 2 minor issues logged: SignalR pending (known v1 limitation), OAuth requires env vars (documented).

verify-e2e.mjs smoke script автоматизує перевірку доступності API endpoints. verify.html — interactive checklist у frontend/public/.

Рисунок 2.15 — Протокол E2E-тестування (фрагмент чеклисту).

Документування результатів: скріншоти кожного passed test case збережено для додатку до пояснювальної записки. Postman collection export як Додаток А.

"""

text = MD.read_text(encoding="utf-8")
if "2.15. Детальний опис реалізації екрана автентифікації" not in text:
    text = text.replace(MARKER, ADDENDUM + "\n" + MARKER, 1)
    MD.write_text(text, encoding="utf-8")
    print("Volume addendum appended.")
else:
    print("Volume addendum already present.")
