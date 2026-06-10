# POSTMAN_TESTING: полная схема тестирования API

## Подготовка

1. Запуск backend:
   - `docker-compose up -d`
   - или `dotnet run` в `backend/Facade.API`
2. Проверка Swagger:
   - `https://localhost:7011/swagger/index.html` (или локальный URL из launchSettings)
3. Импорт в Postman:
   - `docs/postman/LinkedInDiplom.postman_collection.json`
   - `docs/postman/LinkedInDiplom.local.postman_environment.json`
4. Выбрать environment `LinkedInDiplom Local`.

### Backend HTTPS testing

Для backend HTTPS (profile `https`, `dotnet run --launch-profile https`):

| Что | URL |
|-----|-----|
| Postman `baseUrl` | `https://localhost:7011` |
| Swagger | `https://localhost:7011/swagger` |
| SignalR Hub | `https://localhost:7011/hubs/messaging` |

Self-signed dev certificate: Postman может потребовать **Settings → SSL certificate verification → OFF** для localhost, или доверить cert через `dotnet dev-certs https --trust`.

Подробнее: `docs/10_DEVELOPMENT.md` → «Backend HTTPS local run».

## Рекомендуемый порядок тестирования

1. Auth: `register -> login -> me -> refresh`
2. Profile
3. Professional
4. Content
5. Network
6. Messaging
7. Jobs
8. Notifications
9. Events
10. **Admin** (отдельный admin token — см. ниже)
11. Auth: `logout`

## Таблицы endpoint-ов по модулям

> Примечание: `Auth=Yes` означает Bearer `{{accessToken}}`.

### 01 Auth / Account

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST | `/api/auth/register` | No | `email,password` | `userId` (если есть в ответе) | Регистрация | Может вернуть 400 при дубликате email |
| POST | `/api/auth/login` | No | `email,password` | `accessToken,refreshToken,userId` | Логин | Основная точка входа |
| POST | `/api/auth/google` | No | `idToken` | - | OAuth login | Требует валидный токен Google |
| POST | `/api/auth/facebook` | No | `accessToken` | - | OAuth login | Требует валидный токен Facebook |
| POST | `/api/auth/refresh` | No | `refreshToken` | `accessToken,refreshToken` | Обновление токена | 401 при невалидном refresh |
| POST | `/api/auth/logout` | No/Yes* | `refreshToken` | - | Завершение сессии | Проверить поведение после logout |
| GET | `/api/auth/me` | Yes | - | - | Текущий пользователь | 401 без JWT |

### 02 Profile

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| GET | `/api/profile/me` | Yes | - | - | Мой профиль | Базовая проверка авторизации |
| PUT | `/api/profile/me` | Yes | Полный объект профиля | - | Полное обновление | 400 при невалидных полях |
| PATCH | `/api/profile/me` | Yes | Частичный объект | - | Частичное обновление | Удобно для smoke PATCH |
| GET | `/api/profile/{userId}` | No | route `userId` | - | Публичный профиль | 404 если юзер не найден |
| POST | `/api/profile/me/avatar` | Yes | form-data file | - | Загрузка аватара | Файл выбирается вручную |
| POST | `/api/profile/me/header` | Yes | form-data file | - | Загрузка обложки | Файл выбирается вручную |
| GET | `/api/profile/me/message-settings` | Yes | - | - | Настройки сообщений | - |
| PUT | `/api/profile/me/message-settings` | Yes | Полный объект settings | - | Полное обновление settings | - |
| PATCH | `/api/profile/me/message-settings` | Yes | Частичный settings | - | Частичное обновление settings | - |
| POST | `/api/profile/{profileOwnerId}/views` | No | query (например source) | - | Зафиксировать просмотр профиля | Публичный endpoint |
| GET | `/api/profile/me/profile-views` | Yes | - | - | Мои просмотры | - |

### 03 Professional

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| GET | `/api/professional/me/experiences` | Yes | - | - | Список опыта | - |
| GET | `/api/professional/me/experiences/{experienceId}` | Yes | route | - | Опыт по id | - |
| POST | `/api/professional/me/experiences` | Yes | create body | `experienceId`* | Создать опыт | Сохранение id может потребовать ручной настройки |
| PUT/PATCH/DELETE | `/api/professional/me/experiences/{experienceId}` | Yes | body/route | - | Управление опытом | - |
| GET | `/api/professional/academies` | No | query | - | Список academies (paged) | `page`, `pageSize`, `search`, `sortBy`, `sortDirection`; публичный read |
| GET | `/api/professional/academies/{academyId}` | No | route | - | Академия по id | публичный read |
| POST | `/api/professional/academies` | **Admin** | body | `academyId`* | Создать академию | User → **403** |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/educations...` | Yes | body/route | `educationId`* | Образование | - |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/companies...` + `/api/professional/companies/{companyId}` | Yes | body/route | `companyId` | Компании | Для Jobs часто нужен `companyId` |
| POST | `/api/professional/me/companies/{companyId}/logo` | Yes | form-data `file` | - | Logo компании | `CompanyResponse` |
| POST | `/api/professional/academies/{academyId}/logo` | Admin | form-data `file` | - | Logo академии | `AcademyResponse` |
| POST | `/api/professional/me/certificates/{certificateId}/file` | Yes | form-data `file` | - | Файл сертификата | 10 MB |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/certificates...` | Yes | body/route | `certificateId`* | Сертификаты | - |
| GET/POST/DELETE | `/api/professional/me/certificates/{certificateId}/skills...` | Yes | body/route | `certificateSkillId`* | Связь сертификат-скилл | - |
| GET | `/api/professional/skills` | No | query | - | Список skills (paged) | `page`, `pageSize`, `search`, `sortBy`, `sortDirection`; публичный read |
| GET | `/api/professional/skills/{skillId}` | No | route | - | Skill по id | публичный read |
| POST | `/api/professional/skills` | **Admin** | body | `skillId`* | Создать skill | User → **403** |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/skills...` | Yes | body/route | `userSkillId`* | Навыки пользователя | - |
| GET | `/api/professional/recommended-skills?position=...` | No | query | - | Рекомендуемые навыки | публичный read |
| POST | `/api/professional/recommended-skills` | **Admin** | body | - | Создать mapping | User → **403** |
| DELETE | `/api/professional/recommended-skills/{rspId}` | **Admin** | route | - | Удалить mapping | User → **403** |
| GET | `/api/professional/languages` | No | query | - | Список languages (paged) | `page`, `pageSize`, `search`, `sortBy`, `sortDirection`; публичный read |
| GET | `/api/professional/languages/{languageId}` | No | route | - | Language по id | публичный read |
| POST | `/api/professional/languages` | **Admin** | body | `languageId`* | Создать language | User → **403** |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/languages...` | Yes | body/route | `userLanguageId`* | Языки пользователя | - |
| GET | `/api/professional/users/{userId}/recommendations` | No | route | - | Рекомендации пользователя | Публичный |
| GET | `/api/professional/recommendations/{recommendationId}` | No | route | - | Рекомендация по id | Публичный |
| POST/PATCH/DELETE | `/api/professional/recommendations...` | Yes | body/route | `recommendationId`* | Управление рекомендациями | Может требоваться 2-й пользователь |

### 04 Network

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET | `/api/network/me/contacts` | Yes | body/list | `contactId`* | Контакты | После send request — см. manual check в Notifications |
| GET/PATCH/PATCH/DELETE | `/api/network/me/contacts/{contactId}` + `/accept` `/reject` | Yes | route | - | Подтверждение/отклонение | - |
| POST/DELETE/GET | `/api/network/me/following`... + `/me/followers` | Yes | body/route | - | Подписки | Нужен `followedUserId` |
| POST/DELETE/GET | `/api/network/me/blocked-users...` | Yes | body/route | - | Блокировки | Нужен `blockedUserId` |
| POST/GET/GET/PATCH/DELETE | `/api/network/me/groups...` | Yes | body/route | `groupId`* | Группы | - |
| POST/DELETE/GET | `/api/network/me/groups/{groupId}/join|membership|members` | Yes | route | - | Членство в группе | - |
| POST/DELETE/GET | `/api/network/me/groups/{groupId}/posts/{postId}` | Yes | route | - | Посты группы | Требуется существующий `postId` |
| POST/GET/GET/GET/PATCH/DELETE | `/api/network/me/pages...` | Yes | body/route | `pageId`* | Страницы | - |
| POST | `/api/network/me/pages/{pageId}/logo` | Yes | form-data `file` | - | Logo страницы | |
| POST | `/api/network/me/groups/{groupId}/avatar` | Yes | form-data `file` | - | Аватар группы | |
| POST/DELETE/GET | `/api/network/me/pages/{pageId}/admins...` | Yes | body/route | - | Админы страницы | Нужен `otherUserId` |
| POST/DELETE/GET | `/api/network/me/pages/{pageId}/follow` + `/followers` | Yes | route | - | Подписчики страницы | - |

### 05 Content

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| GET | `/api/content/feed` | Yes | `page`, `pageSize`, `limit` | - | Paged public feed | `PagedResponse<PostDto>`; default `page=1`, `pageSize=20`; `limit` = alias `pageSize` on page 1 |
| GET | `/api/content/feed?page=1&pageSize=20` | Yes | query | - | Smoke: paged feed | `items`, `totalCount`, `hasNextPage` |
| GET | `/api/content/feed?limit=50` | Yes | query | - | Backward-compat limit | `page=1`, `pageSize=50` |
| GET | `/api/content/feed?page=0` | Yes | query | - | Negative: invalid page | **400** unified validation |
| GET | `/api/content/feed?pageSize=101` | Yes | query | - | Negative: pageSize too large | **400** unified validation |
| GET | `/api/content/me/posts` | Yes | `page`, `pageSize` | - | Paged my posts | `PagedResponse<PostDto>`; default `page=1`, `pageSize=20` |
| GET | `/api/content/me/posts?page=1&pageSize=20` | Yes | query | - | Smoke: paged my posts | `items`, `totalCount`, `hasNextPage` |
| GET | `/api/content/me/posts?page=0` | Yes | query | - | Negative: invalid page | **400** unified validation |
| GET | `/api/content/me/posts?pageSize=101` | Yes | query | - | Negative: pageSize too large | **400** unified validation |
| POST/GET/PATCH/DELETE | `/api/content/me/posts...` + `/api/content/posts/{postId}` | Yes | body/route | `postId` | Посты (кроме list GET) | Базовый модуль для зависимостей |
| POST/GET/DELETE | `/api/content/me/posts/{postId}/media...` | Yes | body/route | - | Медиа поста | Нужен `mediaId` |
| POST | `/api/content/me/media/upload` | Yes | form-data `file` | `mediaId`* | Upload медиа-файла | multipart; см. smoke checklist ниже |
| POST/GET | `/api/content/me/media` / `/api/content/media/{mediaId}` | Yes | JSON body / route | `mediaId`* | Медиа по URL / read | `POST me/media` — JSON URL, не файл |
| POST/GET/PATCH/DELETE | `/api/content/posts/{postId}/comments` + `/api/content/me/comments/{commentId}` | Yes | body/route, `page`, `pageSize` (GET list) | `commentId`* | Комментарии | GET list: `PagedResponse<CommentDto>`; default `page=1`, `pageSize=20` |
| GET | `/api/content/posts/{postId}/comments?page=1&pageSize=20` | Yes | query | - | Smoke: paged post comments | `items`, `totalCount`, `hasNextPage` |
| PUT/DELETE/GET/GET | `/api/content/posts/{postId}/reactions...` | Yes | body/route | - | Реакции | После первой reaction — см. manual check в Notifications |
| POST | `/api/content/hashtags` | **Admin** | body | `hashtagId`* | Создать hashtag | User → **403** |
| GET | `/api/content/hashtags` | Yes | query | - | Список hashtags (paged) | `page`, `pageSize`, `search`, `sortBy`, `sortDirection`; User JWT |
| GET | `/api/content/hashtags/{hashtagId}` | Yes | route | - | Hashtag по id | User JWT |
| POST/GET/DELETE | `/api/content/me/posts/{postId}/hashtags...` | Yes | body/route | - | Хэштеги поста | - |
| POST/DELETE/GET | `/api/content/me/hashtags/{hashtagId}/follow` + `/following` | Yes | route | - | Подписки на хэштеги | - |
| POST/DELETE/GET | `/api/content/me/posts/{postId}/save` + `/me/saved-posts` | Yes | route | - | Сохранённые посты | - |
| POST/DELETE/GET/GET | `/api/content/me/posts/{postId}/repost` + `/me/reposts` + `/posts/{postId}/reposts` | Yes | route | - | Репосты | - |
| POST/GET | `/api/content/posts/{postId}/views` + `/api/content/me/posts/{postId}/views` | Yes | query/route | - | Просмотры постов | `source` может быть query |
| POST/DELETE/GET | `/api/content/me/posts/{postId}/mentions...` | Yes | body/route | - | Упоминания | Нужен `otherUserId` |

### 06 Messaging

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET/GET/DELETE | `/api/messaging/me/chats...` | Yes | body/route, `page`, `pageSize` (GET list) | `chatId`* | Чаты | GET list: `PagedResponse<ChatDto>`; default `page=1`, `pageSize=20` |
| GET | `/api/messaging/me/chats?page=1&pageSize=20` | Yes | query | - | Smoke: paged my chats | `items`, `totalCount`, `hasNextPage` |
| POST/DELETE/GET | `/api/messaging/me/chats/{chatId}/join|membership|members` | Yes | route | - | Участники чата | Часто нужен второй пользователь |
| POST/GET | `/api/messaging/me/chats/{chatId}/messages` | Yes | body/route, `page`, `pageSize` (GET) | `messageId`* | Сообщения | GET: `PagedResponse<MessageDto>`; POST: REST response без изменений; при успехе + `JoinChat` — SignalR `MessageCreated` |
| GET | `/api/messaging/me/chats/{chatId}/messages?page=1&pageSize=20` | Yes | query | - | Smoke: paged chat messages | `items`, `totalCount`, `hasNextPage` |
| GET/PATCH/DELETE | `/api/messaging/me/messages/{messageId}` | Yes | body/route | - | Сообщение по id | REST response без изменений; PATCH/DELETE + `JoinChat` — `MessageUpdated` / `MessageDeleted` |
| POST/GET | `/api/messaging/me/messages/{messageId}/read|reads` | Yes | route | - | Прочтение | REST response без изменений; POST read + `JoinChat` — `MessageRead` |
| POST | `/api/messaging/me/messages/{messageId}/media/upload` | Yes | form-data `file` | `messageMediaId`* | Upload медиа сообщения | multipart; REST response без изменений; при успехе + `JoinChat` — `MessageMediaAttached` |
| POST/GET/DELETE | `/api/messaging/me/messages/{messageId}/media...` | Yes | JSON/route | `messageMediaId`* | Attach/read/delete media | JSON attach; attach success + `JoinChat` — `MessageMediaAttached` |

#### Messaging SignalR manual testing

Postman REST collection **не проверяет** полноценный SignalR flow как обычный REST endpoint. Realtime events (`MessageCreated`, `MessageUpdated`, …) приходят только клиентам с активным WebSocket-подключением к Hub и успешным `JoinChat(chatId)`.

**Primary flow остаётся HTTP:** сообщение создаётся через `POST /api/messaging/me/chats/{chatId}/messages`; backend после успешной операции пушит event в SignalR group `chat:{chatId}`.

**Hub:** `/hubs/messaging`  
**Auth:** JWT через `accessTokenFactory` (SignalR добавляет `?access_token=...` при negotiate/WebSocket).  
**Base URL:** адаптируйте под локальный backend — см. `launchSettings.json` или Postman `baseUrl` (`http://localhost:5000`, `http://localhost:5282`, `https://localhost:7011`).

##### Manual flow

**Step 1 — Login (REST)**  
`POST /api/auth/login` → скопировать `accessToken` из ответа (Postman: `01 Auth -> Login`, или Swagger).

**Step 2 — Получить chatId**  
`GET /api/messaging/me/chats` → выбрать `id` чата, где текущий user — **active member**.  
Если список пуст — сначала `POST /api/messaging/me/chats`.

**Step 3 — SignalR client**  
Откройте временную HTML-страницу или browser DevTools console на origin, с которого браузер может достучаться до API (см. ограничение CORS ниже). Вставьте snippet, подставьте `token` и `chatId`.

**Step 4 — Send message (REST)**  
В другой вкладке / Postman / Swagger:  
`POST /api/messaging/me/chats/{chatId}/messages`  
Body: `{ "content": "Hello from REST" }`

**Step 5 — Проверить console**  
Ожидается log `MessageCreated` с payload `MessageDto`.

**Step 6 — Остальные events (REST → console)**

| REST action | Expected SignalR event | Payload |
|---|---|---|
| `PATCH /api/messaging/me/messages/{messageId}` | `MessageUpdated` | `MessageDto` |
| `DELETE /api/messaging/me/messages/{messageId}` | `MessageDeleted` | `{ chatId, messageId }` |
| `POST /api/messaging/me/messages/{messageId}/read` | `MessageRead` | `{ chatId, id, messageId, userId, readAt }` |
| `POST .../media` или `POST .../media/upload` | `MessageMediaAttached` | `{ chatId, messageId, media }` |

Перед каждым тестом убедитесь, что Hub подключён и выполнен `JoinChat(chatId)`.

**JoinChat access:** если user не active member чата → `HubException: Chat not found.`

**CORS (Development):** `DevelopmentCors` разрешает localhost frontend origins с `AllowCredentials` (нужно для SignalR из браузера). Разрешены: `http://localhost:5173`, `https://localhost:5173`, `http://localhost:3000`, `https://localhost:3000` (Vite по умолчанию — `5173`). **Нельзя** использовать `AllowAnyOrigin()` вместе с `AllowCredentials()`. Frontend integration в React-проект **ещё pending**; для manual test откройте snippet с одного из allowed origins или временную HTML на `http://localhost:5173`.

##### JS snippet (browser console / temporary HTML)

```html
<script src="https://cdn.jsdelivr.net/npm/@microsoft/signalr@latest/dist/browser/signalr.min.js"></script>
<script>
  const token = "PASTE_JWT_HERE";
  const chatId = "PASTE_CHAT_ID_HERE"; // GUID строкой

  // Адаптируйте host/port под ваш backend (без /api prefix):
  const hubUrl = "https://localhost:7011/hubs/messaging";

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => token
    })
    .withAutomaticReconnect()
    .build();

  connection.on("MessageCreated", message => {
    console.log("MessageCreated", message);
  });

  connection.on("MessageUpdated", message => {
    console.log("MessageUpdated", message);
  });

  connection.on("MessageDeleted", payload => {
    console.log("MessageDeleted", payload);
  });

  connection.on("MessageRead", payload => {
    console.log("MessageRead", payload);
  });

  connection.on("MessageMediaAttached", payload => {
    console.log("MessageMediaAttached", payload);
  });

  async function start() {
    await connection.start();
    console.log("Connected:", connection.connectionId);

    await connection.invoke("JoinChat", chatId);
    console.log("Joined chat:", chatId);
  }

  start().catch(console.error);

  // Опционально при закрытии страницы:
  // await connection.invoke("LeaveChat", chatId);
  // await connection.stop();
</script>
```

**Notes:**
- `chatId` в `JoinChat` передаётся как GUID (строка `"xxxxxxxx-xxxx-..."` в JS).
- REST endpoints и их response shape **не меняются** — SignalR только дополнительный push.
- Frontend проект **не** содержит этой интеграции; snippet только для manual QA.

### 07 Jobs

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET/GET/PATCH/DELETE | `/api/jobs/me/vacancies...` + `/api/jobs/vacancies...` | Yes | body/route | `vacancyId`* | Вакансии | Для create часто нужен `companyId` |
| POST/DELETE/GET | `/api/jobs/me/favorites/{vacancyId}` + `/me/favorites` | Yes | route | - | Избранные вакансии | - |
| POST/DELETE/GET/GET | `/api/jobs/me/vacancies/{vacancyId}/apply` + `/me/applications...` | Yes | route | `applicationId`* | Отклики | - |
| POST/GET/GET/DELETE/GET | `/api/jobs/me/search-queries...` | Yes | body/route | `searchQueryId`* | Поисковые запросы | - |
| GET | `/api/jobs/recommended-queries` | Yes | - | - | Рекомендуемые запросы (read) | User **не** может POST/DELETE (404) |

### 08 Notifications

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| GET | `/api/notifications/me` | Yes | - | - | Мои уведомления | После comment на post — см. manual check ниже |
| GET | `/api/notifications/me/{notificationId}` | Yes | route | - | Уведомление по id | - |
| PATCH | `/api/notifications/me/{notificationId}/read` | Yes | route | - | Прочитать 1 уведомление | - |
| PATCH | `/api/notifications/me/read-all` | Yes | - | - | Прочитать всё | - |
| DELETE | `/api/notifications/me/{notificationId}` | Yes | route | - | Удалить уведомление | - |
| POST/GET | `/api/notifications/me/activity` | Yes | body/- | - | Активность пользователя | - |

#### Notifications manual check (CommentCreatedEvent)

1. Login **user A** → `POST /api/auth/login` → сохранить `accessToken`.
2. **User A** создаёт post → `POST /api/content/me/posts`.
3. Login **user B** → новый token.
4. **User B** комментирует post user A → `POST /api/content/posts/{postId}/comments` `{ "content": "..." }`.
5. Login **user A** снова.
6. `GET /api/notifications/me` → ожидается notification с `type: "post_comment"`, `entityType: "post"`, `entityId` = postId.
7. **Self-comment:** user A комментирует свой post → notification **не** создаётся.

#### Notifications manual check (ContactRequestSentEvent)

1. Login **user A** → `POST /api/auth/login`.
2. Login **user B** → сохранить `otherUserId` user B.
3. **User A** отправляет contact request → `POST /api/network/me/contacts` `{ "otherUserId": "<user B id>" }`.
4. Login **user B**.
5. `GET /api/notifications/me` → ожидается notification с `type: "contact_request"`, `entityType: "contact_request"`, `entityId` = contactRequestId.
6. **Self-request:** user A отправляет request самому себе → API error, notification **не** создаётся.

#### Notifications manual check (ContactRequestAcceptedEvent)

1. Login **user A** → отправить contact request user B → `POST /api/network/me/contacts`.
2. Login **user B** → принять request → `PATCH /api/network/me/contacts/{contactId}/accept`.
3. Login **user A**.
4. `GET /api/notifications/me` → ожидается notification с `type: "contact_request_accepted"`, `entityType: "contact_request"`, `entityId` = contactRequestId.

#### Notifications manual check (ReactionUpsertedEvent)

1. Login **user A** → создать post → `POST /api/content/me/posts`.
2. Login **user B**.
3. **User B** ставит реакцию → `PUT /api/content/posts/{postId}/reactions` `{ "reactionType": "like" }`.
4. Login **user A**.
5. `GET /api/notifications/me` → ожидается notification с `type: "post_reaction"`, `entityType: "post"`, `entityId` = postId.
6. **Update reaction:** user B меняет тип → `PUT .../reactions` `{ "reactionType": "love" }` → duplicate notification **не** создаётся.
7. **Self-reaction:** user A реагирует на свой post → notification **не** создаётся.

### 09 Events

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET/GET/PATCH/DELETE | `/api/events/me...` + `/api/events/{eventId}` | Yes | body/route | `eventId` | События | - |
| POST/DELETE/GET | `/api/events/me/{eventId}/join|attendance` + `/api/events/{eventId}/attendees` | Yes | route | - | Посетители | - |
| POST/GET/PATCH/DELETE | `/api/events/me/{eventId}/schedule...` + `/api/events/{eventId}/schedule` | Yes | body/route | `scheduleItemId`* | Расписание | - |
| POST | `/api/events/me/speakers` | **Admin** | body | `speakerId`* | Создать speaker | User → **403** |
| GET | `/api/events/me/speakers/{speakerId}` | Yes | route | - | Speaker по id | User JWT |
| PATCH | `/api/events/me/speakers/{speakerId}` | **Admin** | body | - | Обновить speaker | User → **403** |
| DELETE | `/api/events/me/speakers/{speakerId}` | **Admin** | route | - | Удалить speaker | User → **403** |
| POST/DELETE/GET | `/api/events/me/{eventId}/speakers...` + `/api/events/{eventId}/speakers` | Yes | body/route | - | Спикеры события | - |
| POST | `/api/events/me/{eventId}/cover` | Yes | form-data `file` | - | Обложка события | `EventResponse` |
| POST | `/api/events/me/speakers/{speakerId}/avatar` | **Admin** | form-data `file` | - | Аватар спикера | User → **403** |

### File uploads (11 endpoints)

Полная таблица (auth, limits, DB fields, local paths): **`09_CONFIG_UPLOADS.md`**.

| Method | Route | Auth | form-data | Response |
|---|---|---|---|---|
| POST | `/api/profile/me/avatar` | User | `file` | `ProfileResponse` |
| POST | `/api/profile/me/header` | User | `file` | `ProfileResponse` |
| POST | `/api/content/me/media/upload` | User | `file` | `MediaResponse` |
| POST | `/api/professional/me/companies/{companyId}/logo` | User | `file` | `CompanyResponse` |
| POST | `/api/professional/academies/{academyId}/logo` | **Admin** | `file` | `AcademyResponse` |
| POST | `/api/professional/me/certificates/{certificateId}/file` | User | `file` | `CertificateResponse` |
| POST | `/api/network/me/pages/{pageId}/logo` | User | `file` | `PageResponse` |
| POST | `/api/network/me/groups/{groupId}/avatar` | User | `file` | `UserGroupResponse` |
| POST | `/api/events/me/{eventId}/cover` | User | `file` | `EventResponse` |
| POST | `/api/events/me/speakers/{speakerId}/avatar` | **Admin** | `file` | `EventSpeakerResponse` |
| POST | `/api/messaging/me/messages/{messageId}/media/upload` | User | `file` | `MessageMediaResponse` |

#### Upload smoke checklist (любой endpoint из таблицы)

1. **401** без JWT.
2. **400** `errors: ["File is empty."]` — нет файла / пустой `file`.
3. **400** too large — 5 MB (images) или 10 MB (certificate / message media).
4. **404 / 400** — чужая или несуществующая сущность (для entity-scoped routes).
5. **200** — валидный файл; URL в response и в БД.
6. **Local mode** (`AwsS3:BucketName` пустой): открыть `/uploads/...` URL в браузере.

Postman: Body → **form-data** → key **`file`**, type **File**.

### Global catalog writes (Admin-only)

Полная таблица: `04_FACADE_MODULES.md`.

| Method | Route | Entity | Role | User (no Admin) |
|---|---|---|---|---|
| POST | `/api/professional/skills` | Skill | Admin | **403** |
| POST | `/api/professional/recommended-skills` | RecommendedSkill | Admin | **403** |
| DELETE | `/api/professional/recommended-skills/{rspId}` | RecommendedSkill | Admin | **403** |
| POST | `/api/professional/academies` | Academy | Admin | **403** |
| POST | `/api/professional/academies/{academyId}/logo` | Academy | Admin | **403** |
| POST | `/api/professional/languages` | Language | Admin | **403** |
| POST | `/api/content/hashtags` | Hashtag | Admin | **403** |
| POST | `/api/events/me/speakers` | EventSpeaker | Admin | **403** |
| PATCH | `/api/events/me/speakers/{speakerId}` | EventSpeaker | Admin | **403** |
| DELETE | `/api/events/me/speakers/{speakerId}` | EventSpeaker | Admin | **403** |
| POST | `/api/events/me/speakers/{speakerId}/avatar` | EventSpeaker | Admin | **403** |

#### Catalog smoke checklist

1. **401** — catalog write без JWT.
2. **403** — `{{accessToken}}` (User) на любой catalog write из таблицы выше.
3. **200** — `{{adminToken}}` на тот же write с валидным body/file.
4. **200** (не 403) — User на `POST /api/professional/me/skills`, `POST .../hashtags/{id}/follow`, attach hashtag к post.
5. **200** — публичный `GET /api/professional/skills`, `GET /api/professional/skills/{id}`, `GET /api/professional/languages`, `GET /api/professional/languages/{id}`, `GET /api/professional/academies`, `GET /api/professional/academies/{id}` или `GET recommended-skills?position=...` без Admin.

#### Skills list examples

```
GET /api/professional/skills?page=1&pageSize=20
GET /api/professional/skills?search=sql
GET /api/professional/skills?sortBy=name&sortDirection=asc
GET /api/professional/skills?sortBy=bad   → 400
```

#### Languages list examples

```
GET /api/professional/languages?page=1&pageSize=20
GET /api/professional/languages?search=eng
GET /api/professional/languages?sortBy=name&sortDirection=asc
GET /api/professional/languages?sortBy=bad   → 400
```

#### Academies list examples

```
GET /api/professional/academies?page=1&pageSize=20
GET /api/professional/academies?search=university
GET /api/professional/academies?sortBy=name&sortDirection=asc
GET /api/professional/academies?sortBy=bad   → 400
```

#### Hashtags list examples

```
GET /api/content/hashtags?page=1&pageSize=20
GET /api/content/hashtags?search=dotnet
GET /api/content/hashtags?sortBy=name&sortDirection=asc
GET /api/content/hashtags?sortBy=bad   → 400
```

В Postman для catalog writes используйте **`{{adminToken}}`** (папка `10 Admin` → Admin Login). Для negative test **403** — тот же request с `{{accessToken}}`.

### 10 Admin / Platform

> Используйте `{{adminToken}}` после `POST /api/auth/login` с `admin@local.dev` / `Admin123!` (Development seed).  
> Для проверки 403 сохраните обычный `{{accessToken}}` как `normalUserToken` и вызывайте admin routes с ним.

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST | `/api/auth/login` | No | admin credentials | `adminToken`, `adminUserId` | Login admin | тот же endpoint, что у user |
| GET | `/api/admin/roles` | Admin | - | - | Роли платформы | |
| GET | `/api/admin/users` | Admin | `page`, `pageSize`, `email`, `role`, `isDeleted`, `isLocked`, `sortBy`, `sortDirection` | - | Paged users | `PagedResponse<AdminUserDto>`; default `page=1`, `pageSize=20`; max `pageSize=100`; incl. deleted when filter absent |
| GET | `/api/admin/users?page=1&pageSize=20` | Admin | query | - | Smoke: paged users | response: `items`, `totalCount`, `hasNextPage` |
| GET | `/api/admin/users?email=admin` | Admin | query | - | Filter by email (contains, case-insensitive) | |
| GET | `/api/admin/users?isDeleted=true` | Admin | query | - | Only soft-deleted users | |
| GET | `/api/admin/users?isDeleted=false` | Admin | query | - | Only active (non-deleted) users | |
| GET | `/api/admin/users?isLocked=true` | Admin | query | - | Only locked users | |
| GET | `/api/admin/users?role=Admin` | Admin | query | - | Filter by role | unknown role → empty list |
| GET | `/api/admin/users?sortBy=email&sortDirection=asc` | Admin | query | - | Sort users | allowed `sortBy`: `createdAt`, `email`, `userName`, `updatedAt`; `sortDirection`: `asc`, `desc` |
| GET | `/api/admin/users?sortBy=badField` | Admin | query | - | Negative: invalid sortBy | **400** unified validation |
| GET | `/api/admin/users?page=0` | Admin | query | - | Negative: invalid page | **400** unified validation |
| GET | `/api/admin/users?pageSize=101` | Admin | query | - | Negative: pageSize too large | **400** unified validation |
| GET | `/api/admin/users/{userId}` | Admin | route | - | User by id | |
| GET | `/api/admin/users/{userId}/roles` | Admin | route | - | Роли user | |
| POST | `/api/admin/users/{userId}/roles` | Admin | `{ "roleName": "Admin" }` | - | Назначить роль | 204 |
| DELETE | `/api/admin/users/{userId}/roles/{roleName}` | Admin | route | - | Снять роль | self Admin → 400 |
| PATCH | `/api/admin/users/{userId}/lock` | Admin | optional body | - | Lock user | self → 400 |
| PATCH | `/api/admin/users/{userId}/unlock` | Admin | route | - | Unlock | |
| DELETE | `/api/admin/users/{userId}` | Admin | route | - | Soft delete user | self → 400 |
| PATCH | `/api/admin/users/{userId}/restore` | Admin | route | - | Restore soft-deleted user | 204; idempotent if not deleted |
| GET | `/api/admin/content/posts` | Admin | `page`, `pageSize`, `authorId`, `isDeleted`, `includeDeleted`, `search`, `createdFrom`, `createdTo`, `sortBy`, `sortDirection` | - | Paged admin posts | `PagedResponse<AdminPostDto>`; incl. deleted when filters absent |
| GET | `/api/admin/content/posts?page=1&pageSize=20` | Admin | query | - | Smoke: all posts | `items`, `totalCount`, `hasNextPage` |
| GET | `/api/admin/content/posts?isDeleted=false` | Admin | query | - | Active posts only | |
| GET | `/api/admin/content/posts?isDeleted=true` | Admin | query | - | Deleted posts only | |
| GET | `/api/admin/content/posts?authorId={{userId}}` | Admin | query | - | Posts by author | |
| GET | `/api/admin/content/posts?search=test` | Admin | query | - | Search in content | case-insensitive contains |
| GET | `/api/admin/content/posts?sortBy=createdAt&sortDirection=desc` | Admin | query | - | Sort posts | allowed `sortBy`: `createdAt`, `updatedAt`, `authorId`, `deletedAt` |
| GET | `/api/admin/content/posts?sortBy=badField` | Admin | query | - | Negative: invalid sortBy | **400** unified validation |
| DELETE | `/api/admin/content/posts/{postId}` | Admin | route `postId` | - | Soft delete post | 204 |
| PATCH | `/api/admin/content/posts/{postId}/restore` | Admin | route | - | Restore post | 204 |
| GET | `/api/admin/jobs/vacancies` | Admin | `page`, `pageSize`, `companyId`, `postedByUserId`, `isDeleted`, `includeDeleted`, `search`, `createdFrom`, `createdTo`, `sortBy`, `sortDirection` | - | Paged admin vacancies | `PagedResponse<AdminVacancyDto>`; incl. deleted when filters absent |
| GET | `/api/admin/jobs/vacancies?page=1&pageSize=20` | Admin | query | - | Smoke: all vacancies | `items`, `totalCount`, `hasNextPage` |
| GET | `/api/admin/jobs/vacancies?isDeleted=false` | Admin | query | - | Active vacancies only | |
| GET | `/api/admin/jobs/vacancies?isDeleted=true` | Admin | query | - | Deleted vacancies only | |
| GET | `/api/admin/jobs/vacancies?companyId={{companyId}}` | Admin | query | - | Vacancies by company | |
| GET | `/api/admin/jobs/vacancies?search=developer` | Admin | query | - | Search title/description | case-insensitive contains |
| GET | `/api/admin/jobs/vacancies?sortBy=createdAt&sortDirection=desc` | Admin | query | - | Sort vacancies | allowed `sortBy`: `createdAt`, `updatedAt`, `title`, `companyId`, `deletedAt` |
| GET | `/api/admin/jobs/vacancies?sortBy=badField` | Admin | query | - | Negative: invalid sortBy | **400** unified validation |
| DELETE | `/api/admin/jobs/vacancies/{vacancyId}` | Admin | route | - | Soft delete vacancy | 204 |
| PATCH | `/api/admin/jobs/vacancies/{vacancyId}/restore` | Admin | route | - | Restore vacancy | 204 |
| GET | `/api/admin/jobs/recommended-queries` | Admin | - | - | List recommended | |
| POST | `/api/admin/jobs/recommended-queries` | Admin | `{ "query": "..." }` | `recommendedJobQueryId`* | Create recommended | 200 |
| DELETE | `/api/admin/jobs/recommended-queries/{id}` | Admin | route | - | Delete recommended | 204 |
| GET | `/api/admin/stats/overview` | Admin | - | - | Stats overview | |
| GET | `/api/admin/stats/overview` | User token | - | - | Negative: 403 | обычный user |

#### Сценарии безопасности (smoke)

1. **Self lock**: `PATCH .../users/{{adminUserId}}/lock` → **400** `Admin cannot lock own account.`
2. **Self delete**: `DELETE .../users/{{adminUserId}}` → **400** `Admin cannot delete own account.`
3. **Self remove Admin**: `DELETE .../users/{{adminUserId}}/roles/Admin` → **400** `Admin cannot remove own Admin role.`
4. **Lock other user**: `PATCH .../users/{{otherUserId}}/lock` → **204** (если user существует).
5. **User on admin route**: `GET /api/admin/stats/overview` с `{{accessToken}}` (User) → **403**.

#### Recommended queries (user vs admin)

| Caller | GET `/api/jobs/recommended-queries` | POST/DELETE user routes |
|---|---|---|
| User JWT | **200** | **404** (endpoints removed) |
| Admin JWT | N/A (use admin routes) | `POST/DELETE` under `/api/admin/jobs/recommended-queries` |

## Какие переменные должны быть подготовлены заранее

- `otherUserId` — для контактов, подписок, упоминаний, чатов.
- `companyId` — для некоторых профессиональных и job-сценариев.
- `postId` — для content/network/jobs/notifications cross-flow.
- `adminToken`, `adminUserId` — для `/api/admin/*` (после login admin).
- `normalUserToken`, `normalUserId` — для negative tests (403 на admin routes).
- `recommendedJobQueryId` — для admin DELETE recommended query.
- `eventId`, `speakerId`, `scheduleItemId` — для module Events.

## Когда save-script может потребовать ручной донастройки

Из-за отличий shape ответов (`id`, `item.id`, `entity.id`) в некоторых create endpoint-ах:

- первый запуск лучше сделать вручную и посмотреть фактический JSON response;
- если id не сохранился автоматически, занести его в environment вручную.

## Типовые ошибки

- `400` — неверный body/валидация.
- `401` — отсутствует или просрочен `accessToken`.
- `404` — неверный id или нет доступа к сущности.
- `500` — backend exception (смотреть логи API контейнера/процесса).

## Что стоит проверить позже

1. Точные JSON shape ответов для всех create endpoint-ов (чтобы расширить авто-save scripts).
2. Отдельный набор Negative tests (ожидаемые 400/401/404) в отдельной папке коллекции.
3. Дополнительные сценарии с двумя пользователями (race/ownership cases).
