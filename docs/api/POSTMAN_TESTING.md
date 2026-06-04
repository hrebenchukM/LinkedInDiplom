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
10. Auth: `logout`

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
| GET/POST | `/api/professional/academies/{academyId}` / `/api/professional/academies` | No/Yes | route/body | `academyId`* | Справочник академий | POST требует auth |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/educations...` | Yes | body/route | `educationId`* | Образование | - |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/companies...` + `/api/professional/companies/{companyId}` | Yes | body/route | `companyId` | Компании | Для Jobs часто нужен `companyId` |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/certificates...` | Yes | body/route | `certificateId`* | Сертификаты | - |
| GET/POST/DELETE | `/api/professional/me/certificates/{certificateId}/skills...` | Yes | body/route | `certificateSkillId`* | Связь сертификат-скилл | - |
| GET/POST | `/api/professional/skills/{skillId}` / `/api/professional/skills` | No/Yes | route/body | `skillId`* | Справочник навыков | POST требует auth |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/skills...` | Yes | body/route | `userSkillId`* | Навыки пользователя | - |
| GET/POST/DELETE | `/api/professional/recommended-skills...` | Yes | body/route | - | Рекомендуемые навыки | - |
| GET/POST | `/api/professional/languages/{languageId}` / `/api/professional/languages` | No/Yes | route/body | `languageId`* | Справочник языков | POST требует auth |
| GET/POST/PUT/PATCH/DELETE | `/api/professional/me/languages...` | Yes | body/route | `userLanguageId`* | Языки пользователя | - |
| GET | `/api/professional/users/{userId}/recommendations` | No | route | - | Рекомендации пользователя | Публичный |
| GET | `/api/professional/recommendations/{recommendationId}` | No | route | - | Рекомендация по id | Публичный |
| POST/PATCH/DELETE | `/api/professional/recommendations...` | Yes | body/route | `recommendationId`* | Управление рекомендациями | Может требоваться 2-й пользователь |

### 04 Network

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET | `/api/network/me/contacts` | Yes | body/list | `contactId`* | Контакты | Для запроса контакта нужен `otherUserId` |
| GET/PATCH/PATCH/DELETE | `/api/network/me/contacts/{contactId}` + `/accept` `/reject` | Yes | route | - | Подтверждение/отклонение | - |
| POST/DELETE/GET | `/api/network/me/following`... + `/me/followers` | Yes | body/route | - | Подписки | Нужен `followedUserId` |
| POST/DELETE/GET | `/api/network/me/blocked-users...` | Yes | body/route | - | Блокировки | Нужен `blockedUserId` |
| POST/GET/GET/PATCH/DELETE | `/api/network/me/groups...` | Yes | body/route | `groupId`* | Группы | - |
| POST/DELETE/GET | `/api/network/me/groups/{groupId}/join|membership|members` | Yes | route | - | Членство в группе | - |
| POST/DELETE/GET | `/api/network/me/groups/{groupId}/posts/{postId}` | Yes | route | - | Посты группы | Требуется существующий `postId` |
| POST/GET/GET/GET/PATCH/DELETE | `/api/network/me/pages...` | Yes | body/route | `pageId`* | Страницы | - |
| POST/DELETE/GET | `/api/network/me/pages/{pageId}/admins...` | Yes | body/route | - | Админы страницы | Нужен `otherUserId` |
| POST/DELETE/GET | `/api/network/me/pages/{pageId}/follow` + `/followers` | Yes | route | - | Подписчики страницы | - |

### 05 Content

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET/GET/PATCH/DELETE | `/api/content/me/posts...` + `/api/content/posts/{postId}` | Yes | body/route | `postId` | Посты | Базовый модуль для зависимостей |
| POST/GET/DELETE | `/api/content/me/posts/{postId}/media...` | Yes | body/route | - | Медиа поста | Нужен `mediaId` |
| POST/GET | `/api/content/me/media` / `/api/content/media/{mediaId}` | Yes | file/route | `mediaId`* | Медиа-файлы | Upload через form-data |
| POST/GET/PATCH/DELETE | `/api/content/posts/{postId}/comments` + `/api/content/me/comments/{commentId}` | Yes | body/route | `commentId`* | Комментарии | - |
| PUT/DELETE/GET/GET | `/api/content/posts/{postId}/reactions...` | Yes | body/route | - | Реакции | - |
| POST/GET | `/api/content/hashtags...` | Yes | body/route | `hashtagId`* | Хэштеги | - |
| POST/GET/DELETE | `/api/content/me/posts/{postId}/hashtags...` | Yes | body/route | - | Хэштеги поста | - |
| POST/DELETE/GET | `/api/content/me/hashtags/{hashtagId}/follow` + `/following` | Yes | route | - | Подписки на хэштеги | - |
| POST/DELETE/GET | `/api/content/me/posts/{postId}/save` + `/me/saved-posts` | Yes | route | - | Сохранённые посты | - |
| POST/DELETE/GET/GET | `/api/content/me/posts/{postId}/repost` + `/me/reposts` + `/posts/{postId}/reposts` | Yes | route | - | Репосты | - |
| POST/GET | `/api/content/posts/{postId}/views` + `/api/content/me/posts/{postId}/views` | Yes | query/route | - | Просмотры постов | `source` может быть query |
| POST/DELETE/GET | `/api/content/me/posts/{postId}/mentions...` | Yes | body/route | - | Упоминания | Нужен `otherUserId` |

### 06 Messaging

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET/GET/DELETE | `/api/messaging/me/chats...` | Yes | body/route | `chatId`* | Чаты | - |
| POST/DELETE/GET | `/api/messaging/me/chats/{chatId}/join|membership|members` | Yes | route | - | Участники чата | Часто нужен второй пользователь |
| POST/GET | `/api/messaging/me/chats/{chatId}/messages` | Yes | body/route | `messageId`* | Сообщения | - |
| GET/PATCH/DELETE | `/api/messaging/me/messages/{messageId}` | Yes | body/route | - | Сообщение по id | - |
| POST/GET | `/api/messaging/me/messages/{messageId}/read|reads` | Yes | route | - | Прочтение | - |
| POST/GET/DELETE | `/api/messaging/me/messages/{messageId}/media...` | Yes | file/route | `messageMediaId`* | Медиа сообщения | Upload через form-data |

### 07 Jobs

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET/GET/PATCH/DELETE | `/api/jobs/me/vacancies...` + `/api/jobs/vacancies...` | Yes | body/route | `vacancyId`* | Вакансии | Для create часто нужен `companyId` |
| POST/DELETE/GET | `/api/jobs/me/favorites/{vacancyId}` + `/me/favorites` | Yes | route | - | Избранные вакансии | - |
| POST/DELETE/GET/GET | `/api/jobs/me/vacancies/{vacancyId}/apply` + `/me/applications...` | Yes | route | `applicationId`* | Отклики | - |
| POST/GET/GET/DELETE/GET | `/api/jobs/me/search-queries...` | Yes | body/route | `searchQueryId`* | Поисковые запросы | - |
| POST/GET/DELETE | `/api/jobs/recommended-queries...` | Yes | body/route | `recommendedQueryId`* | Рекомендуемые запросы | - |

### 08 Notifications

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| GET | `/api/notifications/me` | Yes | - | - | Мои уведомления | - |
| GET | `/api/notifications/me/{notificationId}` | Yes | route | - | Уведомление по id | - |
| PATCH | `/api/notifications/me/{notificationId}/read` | Yes | route | - | Прочитать 1 уведомление | - |
| PATCH | `/api/notifications/me/read-all` | Yes | - | - | Прочитать всё | - |
| DELETE | `/api/notifications/me/{notificationId}` | Yes | route | - | Удалить уведомление | - |
| POST/GET | `/api/notifications/me/activity` | Yes | body/- | - | Активность пользователя | - |

### 09 Events

| Method | Route | Auth | Body/Params | Saves variable | Purpose | Notes |
|---|---|---|---|---|---|---|
| POST/GET/GET/PATCH/DELETE | `/api/events/me...` + `/api/events/{eventId}` | Yes | body/route | `eventId` | События | - |
| POST/DELETE/GET | `/api/events/me/{eventId}/join|attendance` + `/api/events/{eventId}/attendees` | Yes | route | - | Посетители | - |
| POST/GET/PATCH/DELETE | `/api/events/me/{eventId}/schedule...` + `/api/events/{eventId}/schedule` | Yes | body/route | `scheduleItemId`* | Расписание | - |
| POST/GET/PATCH/DELETE | `/api/events/me/speakers...` | Yes | body/route | `speakerId`* | Спикеры | - |
| POST/DELETE/GET | `/api/events/me/{eventId}/speakers...` + `/api/events/{eventId}/speakers` | Yes | body/route | - | Спикеры события | - |

## Какие переменные должны быть подготовлены заранее

- `otherUserId` — для контактов, подписок, упоминаний, чатов.
- `companyId` — для некоторых профессиональных и job-сценариев.
- `postId` — для content/network/jobs/notifications cross-flow.
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
