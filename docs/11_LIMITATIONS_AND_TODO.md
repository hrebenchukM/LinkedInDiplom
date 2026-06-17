

---

<!-- merged from: 11_LIMITATIONS_AND_TODO.md -->

# Limitations and TODO (актуально)

# 26. Limitations and TODO

> Честный статус backend на момент обновления документации (2026-06-17).  
> Для защиты диплома: что можно показать, что — с оговорками.

Legacy index: [11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md).

---

## Полностью реализовано

| Область | Что работает |
|---------|--------------|
| **Auth** | Register, login, JWT, refresh, logout, Google/Facebook external login |
| **Profile** | CRUD, search, avatar/header upload+delete, profile views |
| **Content** | Posts, feed (public + network-aware), comments, reactions, media, hashtags, mentions, reposts, saved posts |
| **Network** | Contacts (paged), follows, blocks, groups, pages, page admins |
| **Messaging** | Chats, messages, reads, media; SignalR hub для realtime |
| **Jobs** | Vacancies (paged + filters incl. `minSalaryFrom`), applications, favorites, search queries |
| **Events** | Discover, attending, schedule, speakers, cover upload |
| **Professional** | Experience, education, skills, certificates, companies, recommendations |
| **Notifications** | CRUD + domain event handlers (comment, reaction, contact) |
| **Admin** | Users, roles, lock/unlock, soft delete/restore, stats, content/jobs/events moderation |
| **AI** | Recommended jobs, career advice (Gemini) |
| **FileStorage** | Local + AWS S3, 11 upload endpoints |
| **Demo seed** | 24-step orchestrator incl. skills catalog, jobs catalog, bot content, bot network |
| **Tests** | 87 unit/integration tests (Profile, Content, Network services) |

---

## Реализовано частично

| Область | Что есть | Чего нет / ограничение |
|---------|----------|------------------------|
| **SignalR** | Hub `/hubs/messaging`, 5 server events | Frontend integration pending; нет Redis backplane для scale-out |
| **Notifications** | 4 domain events → notifications | Realtime push нет; `MentionAddedEvent`, job application events — pending |
| **Feed** | Network-aware с JWT | Не фильтрует blocked users |
| **Events** | Discover, attending | Capacity, waitlist, draft/published lifecycle — нет |
| **Pagination** | PagedResponse на ключевых lists | Много endpoints ещё plain array (followers, favorites, etc.) |
| **File upload** | 11 endpoints в backend | Frontend wiring частично; orphan file при DB failure — known limitation |
| **Domain events** | In-memory publisher | Нет outbox/message broker |
| **External auth** | Google/Facebook endpoints | Edge cases конфигурации — проверить на production |
| **Jobs** | Vacancy CRUD + filters | `CompanyId` не валидируется через Professional module |
| **Demo seed Reset** | Flag exists | `Reset=true` не реализован — только warning |

---

## Заглушки / pending

- Audit log для admin actions
- Reports/complaints moderation queue
- Admin moderation для companies, groups, pages
- Production CORS origins для deployed frontend (нужно заполнить `Cors:AllowedOrigins`)
- Frontend HTTPS / Vite dev-server HTTPS
- AI module без Client/Resource boundary (при microservice extraction потребуется)

---

## Frontend integration status

| Feature | Backend | Frontend |
|---------|---------|----------|
| Auth/JWT | ✓ | ✓ wired |
| Profile + media | ✓ | ✓ wired |
| Feed/posts | ✓ | ✓ wired |
| Network | ✓ | ✓ wired |
| Jobs + MinSalaryFrom | ✓ | ✓ wired |
| Messaging HTTP | ✓ | ✓ wired |
| SignalR chat | ✓ | **pending** |
| Upload flows (content, certificates) | ✓ | **partial** |
| Admin panel | ✓ | depends on frontend admin UI |

---

## Production risks

1. **Secrets in git** — AWS keys в `appsettings.Development.json`; production keys через env vars / Azure Key Vault
2. **JWT SecretKey** — dev key в appsettings; production needs strong secret
3. **No global exception middleware** — unhandled exceptions → 500 без unified format
4. **Single instance SignalR** — без backplane не масштабируется горизонтально
5. **Soft delete без global query filters** — каждый service фильтрует вручную; риск забыть фильтр
6. **Orphan files** — при failed DB update после successful upload

---

## Что сказать на защите

**Сильные стороны:**
- Modular monolith с чёткими границами модулей — готовность к микросервисам
- 9 PostgreSQL schemas, один host, ~200 HTTP endpoints
- Domain events для decoupling (notifications без прямых вызовов Content→Notifications)
- Demo seed для демонстрации без ручного ввода
- JWT + role-based admin + unified validation errors

**Честные ограничения:**
- SignalR реализован на backend, frontend integration — следующий шаг
- Realtime notifications — только через polling API, не push
- Pagination не везде единообразна
- Production deployment требует externalized secrets и CORS config

**Демо-сценарий:**
1. Login as Marya (`marya101204@gmail.com`)
2. Home feed — bot posts + engagement
3. Jobs — filter by salary
4. Profile → skills autocomplete
5. Network — followers/contacts from bot seed
6. Messages — existing chats from seed

---

## TODO (приоритеты)

| Priority | Task |
|----------|------|
| High | Frontend SignalR integration |
| High | Production secrets management |
| Medium | Extend pagination to remaining list endpoints |
| Medium | Feed blocked users filter |
| Medium | Demo seed Reset implementation |
| Low | Outbox pattern for domain events |
| Low | Admin audit log |
| Low | AI Client/Resource boundary |


---

<!-- merged from: 11_LIMITATIONS_AND_TODO.md -->

# V1 Limitations (legacy, полный текст)

> **Актуальная версия:** [11_LIMITATIONS_AND_TODO.md](11_LIMITATIONS_AND_TODO.md) (2026-06-17).  
> Этот файл сохранён как legacy index.

## Ограничения v1 (факт)

- realtime уведомлений нет; **SignalR Hub для Messaging** (`/hubs/messaging`): `JoinChat` / `LeaveChat`; backend realtime events — `MessageCreated`, `MessageUpdated`, `MessageDeleted`, `MessageRead`, `MessageMediaAttached` (group `chat:{chatId}`) после успешных HTTP операций; **manual testing docs** — `docs/09_TESTING_AND_POSTMAN.md` (раздел «Messaging SignalR manual testing»); **dev CORS** для SignalR: explicit localhost origins (`5173`, `3000`) + `AllowCredentials` в `DevelopmentCors`; **frontend SignalR integration still pending**; production CORS origins для deployed frontend **pending**; scale-out (Redis backplane / Azure SignalR Service) **pending**; HTTP send остаётся primary flow
- **Backend local HTTPS** documented (`docs/06_INFRASTRUCTURE_AND_DEVELOPMENT.md` → «Backend HTTPS local run»): `dotnet run --launch-profile https` → `https://localhost:7011`; HTTP frontend (`http://localhost:5173`) может вызывать HTTPS backend без mixed content; **frontend HTTPS / Vite dev-server HTTPS integration pending** (not in scope for backend-only step); **Production HTTPS** — через Azure App Service (platform TLS termination); **Docker local** — контейнер API слушает HTTP `:8080` / host `:5000`, TLS termination external / Azure, не внутри контейнера
- domain events в Identity — in-memory (без outbox/broker); **`CommentCreatedEvent`** (Content) → notification для автора поста; **`ReactionUpsertedEvent`** (Content) → notification для автора поста **только при первой реакции** (update reaction type не создаёт новое notification); **`ContactRequestSentEvent`** (Network) → notification получателю contact request; **`ContactRequestAcceptedEvent`** (Network) → notification отправителю request; другие events pending: `MentionAddedEvent`, `VacancyApplicationSubmittedEvent`
- Jobs: `CompanyId` не валидируется через Professional module
- Network: ограниченная кросс-проверка существования target user
- Events: `EventSpeaker` — глобальный справочник **без `OwnerId`**; write endpoints (create/patch/delete/avatar) **Admin-only**; обычный user может **читать** speaker (`GET me/speakers/{id}`), но не менять каталог
- покрытие тестами ограничено (в основном Profile/Content/Network) — **87 tests passing** на master

### Demo seed (актуально)

- **24-step orchestrator** — см. [08_SEED_DATA.md](08_SEED_DATA.md)
- Enrichment: skills catalog (23), jobs catalog (10+10), bot content (18 users, 40 posts), bot network (follows/contacts), bot engagement
- `DemoSeed:Reset=true` — **не реализован**

### FileStorage / uploads (v1)

- **Frontend integration не выполнена** — 11 multipart upload endpoints есть только в backend/Swagger/Postman.
- **Content media upload** (`POST /api/content/me/media/upload`) создаёт `Media` row отдельно; привязка к post — через `POST /api/content/me/posts/{postId}/media` (JSON `mediaId`).
- **`IFileStorageService.DeleteAsync` реализован** для replace-flows: после успешного DB update старый URL удаляется best-effort (local `/uploads/` или S3 в своём bucket; external URLs пропускаются). Используется при замене: Profile `AvatarUrl` / `HeaderUrl`, Company `LogoUrl`, Academy `LogoUrl`, Certificate `DownloadRef`, Page `LogoUrl`, UserGroup `AvatarUrl`, Event `CoverImageUrl`, EventSpeaker `AvatarUrl`. **Не** вызывается для Content media upload и Messaging media upload — там создаётся новая row/attachment, а не replace существующего URL.
- **Orphan new file (known limitation)**: если `SaveAsync` **нового** файла успешен, а последующий DB update падает, новый файл может остаться на диске/S3; rollback/cleanup этого нового файла при DB failure **не реализован**.
- **Secrets in git**: production AWS/RDS/JWT/Gemini keys не должны быть в `appsettings` в репозитории; при утечке — ротация в AWS/RDS.
- Profile avatar/header и content media не требуют entity ownership check на facade-уровне (только JWT user).

### Pagination (v1)

- **Pagination common contract** (`Facade.Shared.Contracts`: `PagedRequest`, `PagedResponse<T>`, `Pagination` helper).
- **Уже `PagedResponse`:** admin users; content feed / me posts / post comments / user public posts; messaging chats & messages; **jobs vacancies**, **notifications me**, **network contacts**; events discover / attending / speakers catalog; admin posts/vacancies/events/comments lists; professional/content catalog lists (skills, languages, academies, hashtags).
- **`GET /api/content/feed`:** без JWT — public global feed; с JWT — network-aware feed (author IDs из Network graph). **V1 limitation:** feed **не фильтрует** blocked users.
- **`limit` alias:** сохранён на feed и notifications (`pageSize` на page 1).
- **Ещё plain array / без paging (medium/low priority):**
  - network: followers, following, blocked users, my groups/pages lists
  - content: reactions list, saved posts, reposts, post media list
  - jobs: favorites, applications, search results
  - events: `GET /api/events/me` (my events), attendees list (limit-based)
  - messaging: chat members, message reads, message media list
  - notifications: user activity list

### Events (v1 limitations)

- **discover / attending / speakers catalog** — реализованы; это **не** limitation.
- **visibility на `GET /api/events/{eventId}`** может не полностью enforce visibility rules (V1 read-by-id behavior).
- **capacity, status, lifecycle** (draft/published/cancelled), waitlist — **не реализованы**.

### Platform Admin (v1)
- `GET /api/admin/stats/overview` — агрегаты (users, posts, vacancies, recommended queries, **events**); **без фильтров по датам** и без графиков
- нет moderation компаний (Professional companies), groups, pages
- нет очереди жалоб / reports / complaints
- нет audit log
- нет granular permissions — только роли **Admin** и **User**
- admin post soft delete **не** обновляет `EditedAt` (в отличие от user delete поста)
- recommended job queries: user write endpoints **удалены** — это исправление модели доступа, не limitation
- **pending admin APIs:** catalog update/delete (кроме существующих writes); admin job applications overview
- **catalog list (skills):** `GET /api/professional/skills` — paged list (публичный read); `POST /api/professional/skills` — Admin-only create
- **catalog list (languages):** `GET /api/professional/languages` — paged list (публичный read); `POST /api/professional/languages` — Admin-only create
- **catalog list (academies):** `GET /api/professional/academies` — paged list (публичный read); `POST /api/professional/academies` — Admin-only create; `POST /api/professional/academies/{id}/logo` — Admin-only upload
- **catalog list (hashtags):** `GET /api/content/hashtags` — paged list (User JWT); `POST /api/content/hashtags` — Admin-only create

### Исправлено в v1 (не limitation)

**Profile & Professional**
- people search: `GET /api/profile/search`
- public professional sections: `GET /api/professional/users/{userId}/experiences|educations|skills`

**Content & Network**
- network-aware feed (JWT) + public feed (anonymous)
- public user posts: `GET /api/content/users/{userId}/posts`
- contacts pagination + cancel outgoing pending + pending counts + incoming/outgoing shortcuts

**Jobs & Notifications**
- `GET /api/jobs/vacancies` — `PagedResponse<VacancyDto>`
- `GET /api/notifications/me` — `PagedResponse<NotificationDto>`

**Events**
- discover: `GET /api/events`; attending: `GET /api/events/me/attending`; speakers catalog: `GET /api/events/speakers`
- `EventDto`: `attendeeCount`, `isAttending` (facade, с JWT)

**Admin**
- user не может POST/DELETE `/api/jobs/recommended-queries` (только Admin)
- **catalog writes** — Admin-only
- защита self-lock/delete/remove Admin role
- `GET /api/admin/users` — search/filter/sort
- `GET /api/admin/content/posts` — paged moderation
- `GET /api/admin/jobs/vacancies` — paged moderation
- **`GET /api/admin/events`** + soft delete/restore
- **`GET /api/admin/content/comments`** + soft delete/restore
- stats overview incl. event aggregates

### AI (v1 architectural note)

- `AIManagement` вызывает `IAIService` напрямую (без `AI.Client` / `I*Resource`); при microservice extraction потребуется client boundary.

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
