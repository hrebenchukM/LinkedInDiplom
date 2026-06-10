# 13. Ограничения v1 и что проверить позже

## Ограничения v1 (факт)

- realtime уведомлений нет; **SignalR Hub для Messaging** (`/hubs/messaging`): `JoinChat` / `LeaveChat`; backend realtime events — `MessageCreated`, `MessageUpdated`, `MessageDeleted`, `MessageRead`, `MessageMediaAttached` (group `chat:{chatId}`) после успешных HTTP операций; **manual testing docs** — `docs/api/POSTMAN_TESTING.md` (раздел «Messaging SignalR manual testing»); **dev CORS** для SignalR: explicit localhost origins (`5173`, `3000`) + `AllowCredentials` в `DevelopmentCors`; **frontend SignalR integration still pending**; production CORS origins для deployed frontend **pending**; scale-out (Redis backplane / Azure SignalR Service) **pending**; HTTP send остаётся primary flow
- domain events в Identity — in-memory (без outbox/broker)
- Jobs: `CompanyId` не валидируется через Professional module
- Network: ограниченная кросс-проверка существования target user
- Events: `EventSpeaker` — глобальный справочник **без `OwnerId`**; write endpoints (create/patch/delete/avatar) **Admin-only**; обычный user может **читать** speaker (`GET me/speakers/{id}`), но не менять каталог
- покрытие тестами ограничено (в основном Profile/Content)

### FileStorage / uploads (v1)

- **Frontend integration не выполнена** — 11 multipart upload endpoints есть только в backend/Swagger/Postman.
- **Content media upload** (`POST /api/content/me/media/upload`) создаёт `Media` row отдельно; привязка к post — через `POST /api/content/me/posts/{postId}/media` (JSON `mediaId`).
- **`IFileStorageService.DeleteAsync` реализован** для replace-flows: после успешного DB update старый URL удаляется best-effort (local `/uploads/` или S3 в своём bucket; external URLs пропускаются). Используется при замене: Profile `AvatarUrl` / `HeaderUrl`, Company `LogoUrl`, Academy `LogoUrl`, Certificate `DownloadRef`, Page `LogoUrl`, UserGroup `AvatarUrl`, Event `CoverImageUrl`, EventSpeaker `AvatarUrl`. **Не** вызывается для Content media upload и Messaging media upload — там создаётся новая row/attachment, а не replace существующего URL.
- **Orphan new file (known limitation)**: если `SaveAsync` **нового** файла успешен, а последующий DB update падает, новый файл может остаться на диске/S3; rollback/cleanup этого нового файла при DB failure **не реализован**.
- **Secrets in git**: production AWS/RDS/JWT/Gemini keys не должны быть в `appsettings` в репозитории; при утечке — ротация в AWS/RDS.
- Profile avatar/header и content media не требуют entity ownership check на facade-уровне (только JWT user).

### Pagination (v1)

- **Pagination common contract** (`Facade.Shared.Contracts`: `PagedRequest`, `PagedResponse<T>`, `Pagination` helper) добавлен; **`GET /api/admin/users`**, **`GET /api/content/feed`**, **`GET /api/content/me/posts`**, **`GET /api/messaging/me/chats`** и **`GET /api/messaging/me/chats/{chatId}/messages`** уже возвращают `PagedResponse`; остальные Content list endpoints (comments, media, reactions и т.д.) и остальные Messaging list endpoints (members, reads, media) пока ещё возвращают старые массивы — подключение будет выполняться по модулям.
- **`GET /api/content/feed`**: response shape изменён с массива на `PagedResponse<PostDto>`; query `limit` поддерживается как backward-compatible alias для `pageSize` на `page=1`; frontend должен читать `response.items`.
- **`GET /api/content/me/posts`**: response shape изменён с массива на `PagedResponse<PostDto>`; query `page`/`pageSize`; frontend должен читать `response.items`.
- **`GET /api/messaging/me/chats`**: response shape изменён с массива на `PagedResponse<ChatDto>`; query `page`/`pageSize` (default `page=1`, `pageSize=20`, max `pageSize=100`); frontend должен читать `response.items`.
- **`GET /api/messaging/me/chats/{chatId}/messages`**: response shape изменён с массива на `PagedResponse<MessageDto>`; query `page`/`pageSize` (default `page=1`, `pageSize=20`, max `pageSize=100`); frontend должен читать `response.items`.

### Platform Admin (v1)
- `GET /api/admin/stats/overview` — только агрегаты, **без фильтров по датам** и без графиков
- нет moderation компаний (Professional companies)
- нет очереди жалоб / reports / complaints
- нет granular permissions — только роли **Admin** и **User**
- admin post soft delete **не** обновляет `EditedAt` (в отличие от user delete поста)
- recommended job queries: user write endpoints **удалены** — это исправление модели доступа, не limitation

### Исправлено в admin v1 (не limitation)

- user не может POST/DELETE `/api/jobs/recommended-queries` (только Admin)
- **catalog writes** (Skill, Hashtag, Academy, Language, RecommendedSkill, EventSpeaker) — Admin-only; user **403** на POST/PATCH/DELETE глобального справочника
- защита: admin не lock/delete себя; не снять себе Admin; не снять Admin у последнего admin

### Catalog security (осознанная модель)

- Глобальные справочники не засоряются обычными пользователями.
- User-scoped действия (`me/skills`, follow hashtag, attach hashtag к post) **не затронуты**.
- Защита на **controller** (`[Authorize(Roles = Admin)]`); facade services не дублируют проверку роли.

## Что проверить позже (без изменения кода сейчас)

- конфигурацию и edge-cases Google/Facebook login
- соответствие not-found string sets и текстов ошибок core
- единообразие list endpoint поведения (200 empty vs 404)
- расширение integration/regression тестов

## Что нельзя делать при развитии

- переносить бизнес-логику в controllers
- добавлять ссылки на чужой DataAccess
- ломать route-контракты без версии API
- менять net8.0 без отдельного согласования
