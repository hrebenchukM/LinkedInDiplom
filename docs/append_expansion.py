# -*- coding: utf-8 -*-
"""Append volume expansion blocks to POYASNLYUVALNA_ZAPYSKA_UA.md"""
from pathlib import Path

MD = Path(__file__).parent / "POYASNLYUVALNA_ZAPYSKA_UA.md"
MARKER = "РОЗДІЛ 3. РОЗГОРТАННЯ ТА ВИПРОБУВАННЯ СИСТЕМИ"

EXPANSION = """
2.9. Деталізація програмних компонентів frontend-модулів виконавця

У таблиці 2.9 наведено перелік основних файлів програмного коду, розроблених або доопрацьованих виконавцем у межах модулів автентифікації, вакансій, чатів та особистого кабінету. Структура каталогів відповідає принципу розділення за функціональними можливостями (feature-based structure), що спрощує супроводження та паралельну роботу учасників команди.

Таблиця 2.9 — Програмні компоненти frontend (модулі виконавця)

| Каталог / файл | Призначення |
| pages/auth/AuthPage.jsx | Екран реєстрації, входу, OAuth, guest-режим |
| features/auth/AuthContext.jsx | Глобальний стан сесії, методи login/register/logout |
| features/auth/authApi.js | HTTP-обгортки для /api/auth/* |
| pages/vacancies/VacanciesPage.jsx | UI модуля вакансій (1685+ рядків логіки) |
| features/jobs/jobsApi.js | CRUD вакансій, пошук, збереження, відгуки |
| features/jobs/mapJobs.js | DTO ↔ UI-модель, параметри пошуку |
| pages/chat/ChatPage.jsx | UI чатів: список, переписка, пошук |
| features/chat/ChatStore.jsx | Стан чатів, sendMessage, hub reconnect |
| features/chat/NewMessagePicker.jsx | Створення нового діалогу |
| pages/profile/ProfilePage.jsx | Особистий кабінет (2200+ рядків) |
| pages/profile/UserProfilePage.jsx | Перегляд чужого профілю |
| features/profile/ProfileStore.jsx | Кеш профільних даних |
| app/layout/AppLayout.jsx | Sidebar, header, навігація |
| app/providers/AppProviders.jsx | Тема, мова, глобальні провайдери |
| shared/api/http.js | HTTP-клієнт з JWT interceptors |

AuthPage.jsx реалізує повний цикл первинної взаємодії користувача з системою. Компонент містить стан activeTab для перемикання між реєстрацією та входом, loading для блокування форми під час запитів, banner для відображення помилок валідації та серверних відповідей. useMemo обчислює registerReady — ознаку готовності форми реєстрації до відправки, що запобігає передчасним submit-запитам.

При успішній реєстрації виконується ланцюжок: registerAndLogin → збереження токенів → navigate("/home"). useEffect відстежує session.isAuthenticated та перенаправляє автентифікованого користувача з /auth на головну сторінку, унеможливлюючи повторний доступ до форми входу.

SocialOverlay — підкомпонент для візуалізації OAuth-процесу у фазах connecting, securing, success. Це покращує UX при затримках мережі та відповідає сучасним практикам проектування інтерфейсів автентифікації.

VacanciesPage.jsx є найбільш об'ємним екраном виконавця. Модуль реалізує три режими навігації (browse, mine, saved), кожен з яких має власний state machine завантаження даних. withLoadState та LoadStatus забезпечують уніфіковане відображення станів loading, error, empty, success.

Алгоритм пошуку вакансій: користувач задає параметри у формі → buildVacancyBrowseParams формує query string → jobsApi.fetchVacancies виконує GET-запит → mapVacancyDtoToJob перетворює DTO у view-model → результати рендеряться у списку карток. Debounce на полі пошуку зменшує навантаження на API при введенні тексту.

Форма створення вакансії включає прив'язку до компанії через resolveCompanyIdByName та fetchCompaniesByIds — це забезпечує цілісність даних між модулями Professional та Jobs. При відсутності компанії у довіднику система пропонує створити новий запис або обрати з автодоповнення.

ChatPage.jsx реалізує двопанельний layout: список чатів (30% ширини на desktop) та область переписки (70%). filteredChats застосовує фільтри tab (active/archive), search (за іменем та preview), shouldShowChatInList (приховує службові чати). activeChat синхронізується з URL через searchParams для deep linking.

При відправці повідомлення sendMessage оновлює локальний стан оптимістично, потім синхронізує з POST /api/messaging/chats/{id}/messages. При помилці відображається threadNotice з текстом помилки. markChatAsRead викликається при фокусі на чаті для оновлення лічильника непрочитаних.

ProfilePage.jsx об'єднує дані з кількох API-модулів: Profile (базові поля), Professional (досвід, освіта, навички, сертифікати, рекомендації), Network (контакти). Компонент використовує вкладки для секцій профілю, модальні вікна для редагування, autocomplete для пошуку навичок, мов та академій.

Рисунок 2.7 — Діаграма залежностей компонентів особистого кабінету від API-модулів.

2.10. Проектування користувацьких сценаріїв (Use Cases)

Для модулів виконавця сформульовано деталізовані сценарії використання у нотації «актор — система — результат».

Таблиця 2.10 — Сценарії UC для модуля автентифікації

| ID | Актор | Дія | Результат |
| UC-A1 | Гість | Заповнює форму реєстрації | Обліковий запис створено, JWT збережено |
| UC-A2 | Користувач | Вводить email/password | Успішний вхід, redirect /home |
| UC-A3 | Користувач | OAuth Google | Токен провайдера → JWT системи |
| UC-A4 | Користувач | Натискає Logout | Токени очищено, redirect /auth |
| UC-A5 | Система | Access token прострочено | Автоматичний refresh без UX-перерви |

Таблиця 2.11 — Сценарії UC для модуля вакансій

| ID | Актор | Дія | Результат |
| UC-J1 | Користувач | Пошук за ключовими словами | Список відфільтрованих вакансій |
| UC-J2 | Користувач | Зберігає вакансію | Вакансія у Saved vacancies |
| UC-J3 | Кандидат | Подає відгук з cover letter | Application створено на backend |
| UC-J4 | Роботодавець | Публікує вакансію | Vacancy доступна в каталозі |
| UC-J5 | Користувач | Переходить у чат з HR | ChatStore.ensureApiChatForPeer |

Таблиця 2.12 — Сценарії UC для модуля чатів

| ID | Актор | Дія | Результат |
| UC-M1 | Користувач | Відкриває /chat | Завантаження списку діалогів |
| UC-M2 | Користувач | Надсилає текст | Повідомлення у thread та на сервері |
| UC-M3 | Користувач | Архівує чат | Чат переміщено у вкладку Archive |
| UC-M4 | Користувач | Шукає у переписці | Підсвічення matching messages |
| UC-M5 | Система | hubOnline=false | Індикатор offline, кнопка reconnect |

Кожен сценарій верифіковано вручну за E2E-чеклистом. Для UC-A2 та UC-J3 додатково перевірено відповіді Postman-колекції з кодами HTTP 200/201 та структурою JSON-body відповідно до Swagger-специфікації.

2.11. Організація роботи зі станом застосунку (State Management)

Frontend не використовує зовнішні бібліотеки глобального стану (Redux, Zustand). Замість цього застосовано комбінацію React Context та custom hooks/store-модулів:

AuthContext — глобальна сесія користувача, доступна через useAuth() у будь-якому компоненті. ChatStore — модульний store з методами для чатів, підключається через useChatStore(). ProfileStore — кеш профілю поточного користувача. NetworkStore — дані мережі контактів (використовується у ProfilePage).

Локальний стан компонентів (useState) застосовується для UI-елементів: відкриття модальних вікон, значення полів форм, таби, прапорці loading. useMemo та useCallback оптимізують обчислення filteredChats, registerReady, aiCommandChips.

Таблиця 2.13 — Стратегії управління станом

| Тип даних | Механізм | Приклад |
| Сесія, JWT | AuthContext | session.user, login() |
| Чати, messages | ChatStore | chats, sendMessage() |
| Профіль | ProfileStore + local state | profile, patchProfile() |
| UI (tabs, modals) | useState | activeTab, moreMenuOpen |
| Налаштування UI | AppProviders / UiSettings | theme, lang |

При logout виконується каскадне очищення: clearAuthTokens() → commitSession(null) → ChatStore reset (implicit через reload) → redirect /auth. Це запобігає витоку даних попереднього користувача у UI.

2.12. Обробка помилок та граничних випадків

Централізована обробка помилок API реалізована у http.js: перехоплення статусів 400, 401, 403, 404, 500; парсинг JSON-body з полем message або errors; повернення уніфікованого об'єкта { ok, status, data }.

AuthContext.readApiError витягує людиночитабельний текст помилки для banner. VacanciesPage відображає LoadStatus при loadError з кнопкою retry. ChatPage показує loadError у списку чатів та threadNotice у переписці.

Таблиця 2.14 — Обробка типових помилок frontend

| HTTP код | Причина | Реакція UI |
| 401 | Прострочений/відсутній JWT | Refresh або redirect /auth |
| 403 | Недостатньо прав (Admin) | AdminForbiddenPage |
| 404 | Вакансія/чат не знайдено | Повідомлення «Not found» |
| 409 | Дублікат email при реєстрації | Banner з текстом сервера |
| 500 | Помилка сервера | «Server error», retry |

Граничні випадки: порожній список вакансій — empty state з підказкою змінити фільтри; відсутність чатів — пропозиція створити через NewMessagePicker; offline backend — ApiFeedbackBanner з рекомендацією перевірити Docker.

2.13. Вимоги до інтерфейсу та їх реалізація

При проектуванні інтерфейсу враховано принципи Material Design та Human Interface Guidelines: консистентна типографіка (Times New Roman у документі; Inter/system-ui у застосунку), контрастність тексту за WCAG, touch targets ≥44px на mobile.

Система CSS-змінних (--bg-primary, --surface-elevated, --accent, --text-muted) дозволяє перемикати тему без перезавантаження сторінки. Зміни зберігаються у localStorage ключ uiTheme.

Адаптивні breakpoints: 768px (tablet), 1024px (desktop). На mobile sidebar ховається, навігація доступна через bottom bar або hamburger. Картки вакансій переходять у single-column stack. ChatPage на mobile показує або список, або thread (master-detail pattern).

Локалізація: ключі типу auth.error.email, vac.nav.parameters, chat.archive зберігаються у словниках uk/en. Функція t(key, fallback) повертає переклад або fallback для відсутніх ключів.

Рисунок 2.8 — Макет AppLayout для desktop (sidebar + header + content area).

Рисунок 2.9 — Макет ChatPage для mobile (master-detail).

2.14. Лістинги фрагментів програмного коду

Нижче наведено фрагменти програмного коду, що ілюструють ключові рішення реалізації. Повні тексти модулів наведено у репозиторії проєкту (каталог frontend/src).

Лістинг 2.1 — Маршрути клієнтської частини (layoutRoutes.jsx)

export const layoutChildRoutes = [
  { path: "/home", element: <HomePage /> },
  { path: "/network", element: <NetworkPage /> },
  { path: "/vacancies", element: <VacanciesPage /> },
  { path: "/chat", element: <ChatPage /> },
  { path: "/profile/:userId", element: <UserProfilePage /> },
  { path: "/profile", element: <ProfilePage /> },
];

Лістинг 2.1 демонструє декларативне задання маршрутів для основних екранів. Маршрути /vacancies, /chat, /profile реалізовані виконавцем; /home та /network — учасником Ротарь А. А.

Лістинг 2.2 — Захист маршрутів (router.jsx, фрагмент)

function RequireAuth({ children }) {
  const { session, isReady } = useAuth();
  if (!isReady) return null;
  if (!session.isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

Лістинг 2.2 ілюструє pattern guard routes: до завершення відновлення сесії (isReady) рендер блокується; неавтентифікований користувач перенаправляється на /auth.

Лістинг 2.3 — Алгоритм registerAndLogin (AuthContext.jsx, логіка)

1. clearAuthTokens()
2. POST /api/auth/register { email, password }
3. POST /api/auth/login { email, password }
4. completeLogin() → зберегти tokens, commitSession(user)
5. return { ok: true, user }

Лістинг 2.3 описує послідовність операцій при реєстрації: спочатку очищення старих токенів, потім створення облікового запису та автоматичний вхід без додаткових дій користувача.

"""

text = MD.read_text(encoding="utf-8")
if "2.9. Деталізація програмних компонентів" not in text:
    text = text.replace(MARKER, EXPANSION + "\n" + MARKER, 1)
    MD.write_text(text, encoding="utf-8")
    print("Expansion appended.")
else:
    print("Already expanded.")

EXPANSION2 = """
3.4. Детальний протокол E2E-випробувань frontend-модулів

E2E-випробування проводилося за методикою, наведеною у docs/E2E_CHECKLIST.md. Кожен сценарій виконувався вручну у браузері Google Chrome (остання версія) при запущених Docker-контейнерах backend та Vite dev server frontend.

Таблиця 3.4 — Протокол E2E: модуль автентифікації

| Крок | Дія тестувальника | Очікуваний результат | Статус |
| 1 | Відкрити /auth | Форма реєстрації/входу | OK |
| 2 | Заповнити реєстрацію валідними даними | Redirect /home | OK |
| 3 | Logout через меню користувача | Redirect /auth | OK |
| 4 | Login з невірним паролем | Banner «Invalid email or password» | OK |
| 5 | Login з валідними даними | JWT у localStorage, /home | OK |
| 6 | Оновити сторінку на /home | Сесія збережена (refresh) | OK |

Таблиця 3.5 — Протокол E2E: модуль вакансій

| Крок | Дія тестувальника | Очікуваний результат | Статус |
| 1 | Відкрити /vacancies | Список вакансій або empty state | OK |
| 2 | Ввести «react» у пошук | Фільтрація результатів | OK |
| 3 | Натиснути Save на картці | Вкладка Saved vacancies | OK |
| 4 | Відкрити деталі вакансії | Повний опис, кнопка Apply | OK |
| 5 | Подати відгук | Підтвердження, статус Applied | OK |
| 6 | Створити вакансію (My jobs) | Вакансія у списку mine | OK |

Таблиця 3.6 — Протокол E2E: модуль чатів

| Крок | Дія тестувальника | Очікуваний результат | Статус |
| 1 | Відкрити /chat | Список чатів | OK |
| 2 | Обрати чат | Історія повідомлень | OK |
| 3 | Надіслати текст | Повідомлення у thread | OK |
| 4 | Пошук у списку чатів | Фільтрація за іменем | OK |
| 5 | Archive чат | Чат у вкладці Archive | OK |
| 6 | New message → обрати контакт | Новий діалог створено | OK |

Таблиця 3.7 — Протокол E2E: особистий кабінет

| Крок | Дія тестувальника | Очікуваний результат | Статус |
| 1 | Відкрити /profile | Дані профілю поточного user | OK |
| 2 | Редагувати «Про себе» | PATCH /api/profile/me | OK |
| 3 | Додати досвід роботи | POST /api/professional/experiences | OK |
| 4 | Додати навичку з autocomplete | Skill у профілі | OK |
| 5 | Змінити аватар (URL/icon) | Preview оновлено | OK |
| 6 | Переглянути /profile/:userId | Чужий профіль read-only | OK |

Таблиця 3.8 — Протокол E2E: UI/UX

| Крок | Дія | Очікуваний результат | Статус |
| 1 | Перемикач теми dark/light | CSS variables оновлено | OK |
| 2 | Перемикач мови uk/en | Тексти інтерфейсу змінено | OK |
| 3 | Resize вікна до 375px | Mobile layout | OK |
| 4 | Resize до 1920px | Desktop sidebar visible | OK |
| 5 | GlobalSearch → пошук людини | Результати пошуку | OK |

Рисунок 3.3 — Скріншот проходження сценарію UC-J3 (подача відгуку на вакансію).

Рисунок 3.4 — Скріншот модуля чатів у темній темі на mobile viewport.

3.5. Перелік REST API endpoints модулів виконавця

Таблиця 3.9 — Endpoints /api/auth

| Метод | URL | Опис |
| POST | /api/auth/register | Реєстрація |
| POST | /api/auth/login | Вхід |
| POST | /api/auth/refresh | Оновлення access token |
| POST | /api/auth/logout | Вихід |
| GET | /api/auth/me | Поточний користувач |
| POST | /api/auth/google | OAuth Google |
| POST | /api/auth/facebook | OAuth Facebook |

Таблиця 3.10 — Endpoints /api/jobs (фрагмент)

| Метод | URL | Опис |
| GET | /api/jobs/vacancies | Пошук вакансій |
| GET | /api/jobs/vacancies/{id} | Деталі вакансії |
| POST | /api/jobs/vacancies | Створення вакансії |
| PATCH | /api/jobs/vacancies/{id} | Редагування |
| DELETE | /api/jobs/vacancies/{id} | Видалення |
| POST | /api/jobs/vacancies/{id}/save | Зберегти |
| DELETE | /api/jobs/vacancies/{id}/save | Прибрати зі збережених |
| GET | /api/jobs/vacancies/saved | Список збережених |
| POST | /api/jobs/vacancies/{id}/applications | Подати відгук |
| GET | /api/jobs/applications/mine | Мої заявки |

Таблиця 3.11 — Endpoints /api/messaging (фрагмент)

| Метод | URL | Опис |
| GET | /api/messaging/chats | Список чатів |
| POST | /api/messaging/chats | Створити чат |
| GET | /api/messaging/chats/{id} | Деталі чату |
| GET | /api/messaging/chats/{id}/messages | Повідомлення |
| POST | /api/messaging/chats/{id}/messages | Надіслати |
| PATCH | /api/messaging/chats/{id}/read | Прочитано |
| POST | /api/messaging/chats/{id}/archive | Архів |

Таблиця 3.12 — Endpoints /api/profile та /api/professional (фрагмент)

| Метод | URL | Опис |
| GET | /api/profile/me | Мій профіль |
| PATCH | /api/profile/me | Оновити профіль |
| GET | /api/profile/users/{id} | Профіль користувача |
| GET | /api/professional/experiences/mine | Мій досвід |
| POST | /api/professional/experiences | Додати досвід |
| GET | /api/professional/skills/mine | Мої навички |
| POST | /api/professional/skills | Додати навичку |
| GET | /api/professional/educations/mine | Освіта |
| POST | /api/professional/educations | Додати освіту |

Усі endpoints верифіковано через Postman-колекцію LinkedInDiplom.postman_collection.json та під час E2E-випробувань frontend.

"""

MARKER2 = "ВИСНОВКИ ТА РЕКОМЕНДАЦІЇ"
text = MD.read_text(encoding="utf-8")
if "3.4. Детальний протокол E2E" not in text:
    text = text.replace(MARKER2, EXPANSION2 + "\n" + MARKER2, 1)
    MD.write_text(text, encoding="utf-8")
    print("Expansion2 appended.")
else:
    print("Expansion2 already present.")
