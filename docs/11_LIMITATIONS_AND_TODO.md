# Limitations and TODO

> Честный статус проекта на **2026-06-18** (после анализа Frontend ↔ Backend и последних интеграций).  
> Для защиты диплома: что можно показать, что — с оговорками, что отложено.

**V1 limitations (legacy detail):** ниже в разделе «V1 Limitations (reference)» — полный текст сохранён для справки.

---

## Архитектурная позиция v1

1. **Backend экспонирует больше capabilities, чем frontend полностью использует** — это допустимо для modular monolith v1.
2. Часть endpoints **намеренно готова** для будущей frontend-работы (events CRUD, admin catalog, recruiter applications).
3. **Client-only/demo** фичи frontend документированы отдельно — не путать с backend persistence.
4. **Текущие frontend integration fixes не требуют изменений БД** — wiring через существующие API.
5. Backend tasks, требующие **новых migrations** (chat preferences, resume upload, profile fields) — **после защиты**.

---

## Полностью реализовано (backend + frontend wired)

| Область | Backend | Frontend (активный App.jsx) |
|---------|---------|----------------------------|
| **Auth** | Register, login, JWT, refresh, logout, Google/Facebook | ✓ `Auth.jsx` |
| **Profile** | CRUD, search, avatar/header | ✓ `ProfilePage`, `PublicProfilePage` |
| **Content core** | Posts, feed, comments, reactions, media, save | ✓ `HomePage`, `PostCard` |
| **Content repost API** | repost/saved endpoints | ✓ API; UI repost — **partial** (см. ниже) |
| **Portfolio public** | `users/{id}/certificates`, `languages` | ✓ `PortfolioPage` |
| **Mentions/hashtags API** | read/write endpoints | ✓ API; UI add — **нет**; panel — partial |
| **Network** | Contacts, follows, groups, pages | ✓ `NetworkPage` |
| **Messaging** | HTTP + SignalR | ✓ `MessagesPage`, `createDirectChat` |
| **Jobs** | Vacancies, apply, favorites, withdraw | ✓ `VacanciesPage` |
| **Recommended queries** | user GET + admin CRUD | ✓ sidebar + `AdminJobsPage` |
| **Notifications** | REST + domain events + SignalR | ✓ badge + `NotificationsPage` |
| **Admin** | Users, roles, lock, moderation | ✓ admin UI |
| **AI recommended jobs** | `GET /api/ai/recommended-jobs` | ✓ vacancies section |
| **Demo seed** | 24-step orchestrator; recommended queries, withdraw demo application, rolling events | — |
| **Tests** | 111 unit tests | `dotnet test` |

---

## Реализовано частично

| Область | Что есть | Ограничение |
|---------|----------|-------------|
| **Repost UI** | API + `UserProfilePosts` / `FeedPostCard` | Home `PostCard` без Repost; вкладка Reposts на Home не подключена |
| **Mentions/hashtags UI** | `PostTagsPanel` read-only; API add/delete | Нет composer UI; panel не на Home feed; mention только автором поста |
| **Message settings** | Backend API | `MessageSettingsModal` — stub |
| **Read receipts (chat)** | `markMessageAsRead` + SignalR `MessageRead` | Визуальные ticks в UI могут отсутствовать; unread badge работает |
| **Notification deep links** | entityType/entityId в notification | Нет route `/app/post/:id` |
| **SignalR scale-out** | 2 hubs работают | Нет Redis backplane |
| **Feed** | Network-aware | Не фильтрует blocked users |
| **Domain events** | In-memory publisher | Нет outbox/broker |
| **Events** | Discover, attending | Create/edit UI minimal |
| **File upload** | 11 backend endpoints | Orphan file при DB failure — known |
| **Demo seed Reset** | Flag exists | `Reset=true` не реализован |

---

## Frontend integration matrix (актуально 2026-06-18)

| Feature | Backend | Frontend API | Active UI |
|---------|---------|--------------|-----------|
| Repost | ✓ | ✓ | partial |
| Portfolio certs/languages | ✓ | ✓ | ✓ |
| Post mentions/hashtags | ✓ | ✓ | partial (read-only panel) |
| `fetchMySavedPostIds` | ✓ (via saved-posts) | ✓ | ✓ |
| Withdraw application | ✓ | ✓ | ✓ |
| Admin recommended queries | ✓ | ✓ | ✓ |
| Notifications SignalR | ✓ | ✓ | ✓ |
| Messaging SignalR | ✓ | ✓ | ✓ |
| Direct chat `participantUserId` | ✓ | ✓ | ✓ |
| Career advice AI | ✓ | — | — |
| Message settings API | ✓ | partial | stub modal |
| Saved job searches | ✓ | — | — |
| Notifications activity | ✓ | — | — |
| Admin catalog UI | ✓ (API) | — | — |
| Recruiter applications list | ✓ | — | — |

Подробности: [10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md).

---

## Backend capabilities not yet used by frontend

См. полную таблицу в [10_FRONTEND_INTEGRATION.md §12](10_FRONTEND_INTEGRATION.md#12-backend-capabilities-available-but-not-fully-used-by-frontend-yet).

Кратко:

| Capability | Timing |
|------------|--------|
| Career advice AI | After defense |
| Message settings modal → API | Optional before defense |
| Events create/edit UI | After defense |
| Network group/page create UI | After defense |
| Recruiter applications view | After defense |
| Saved job searches UI | After defense (optional) |
| Notifications activity | After defense (optional) |
| Admin catalog UI | After defense |

---

## Frontend client-only / demo (not backend v1)

См. [10_FRONTEND_INTEGRATION.md §13](10_FRONTEND_INTEGRATION.md#13-frontend-client-only--demo-features-not-backend-persistence-in-v1).

| Feature | Backend in v1? |
|---------|----------------|
| Chat archive/favorites/spam/drafts | **Нет** |
| AI chat assistant in messages | **Нет** (есть другие AI endpoints) |
| Voice/video calls | **Нет** |
| Resume upload persistence | **Нет** |
| Extra profile local fields | **Частично** — не все поля в Profile entity |

---

## Roadmap

### A. Must have before defense

- [ ] `dotnet build LinkedIn.sln` — 0 errors
- [ ] `dotnet test LinkedIn.Tests` — all pass (111)
- [ ] `cd frontend && npm run build` — success
- [ ] Manual QA: two users + admin (см. [09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md))
- [ ] Docs updated (этот файл + integration guide)

### B. Optional before defense (frontend-only, no DB)

- [ ] Post deep link `/app/post/:postId` + `PostDetailsPage`
- [ ] `MessageSettingsModal` → `profileApi.get/updateMessageSettings`
- [ ] Repost button + Reposts tab on `HomePage` (`PostCard` / feed tabs)
- [ ] `PostTagsPanel` on Home `PostCard`
- [ ] Mention/hashtag add UI in post composer

### C. After defense

- Event create/edit UI
- Admin catalog UI (skills, languages, academies, hashtags, speakers)
- Network group/page create & admin UI
- Recruiter vacancy applications view
- Saved job searches UI
- Career advice widget
- Chat preferences backend (migration)
- Voice/video backend (CallHub, WebRTC)
- AI chat assistant backend
- Resume upload backend (migration)
- Profile extra fields persistence (migration)
- Outbox pattern for domain events
- Admin audit log
- Legacy frontend cleanup (`router.jsx`, broken API stubs)
- Redis SignalR backplane
- Production secrets / CORS hardening

### D. Do not touch before defense

- Backend schema / migrations (unless critical bug)
- Outbox / message broker introduction
- Major routing refactor (удаление legacy)
- Changing modular monolith module boundaries
- Deleting legacy frontend files без отдельного PR
- Force-push / destructive git на shared branches

---

## Заглушки / pending (backend platform)

- Audit log для admin actions
- Reports/complaints moderation queue
- Admin moderation для companies, groups, pages (beyond current scope)
- Production CORS origins
- `DemoSeed:Reset=true` implementation

---

## Известные риски (не блокеры защиты)

1. **Secrets in git** — dev keys в `appsettings.Development.json`; production via env
2. **JWT SecretKey** — dev key; production needs strong secret
3. **Single instance SignalR** — без backplane
4. **Soft delete** — нет global EF filters
5. **Orphan files** — upload success + DB failure
6. **Legacy frontend files** — не в bundle, но в repo

---

## Что сказать на защите

**Сильные стороны:**
- Modular monolith, 9 PostgreSQL schemas, ~200 HTTP endpoints, 2 SignalR hubs
- Domain events → notifications без прямых cross-module calls
- Demo seed для live demo
- Frontend интегрирован с ключевыми flows: auth, feed, messaging realtime, notifications realtime, jobs apply/withdraw, admin

**Честные ограничения:**
- Backend шире frontend — часть API готова «на вырост»
- Repost/mentions UI не на главной ленте; mention add — через API/Postman для demo
- Client-only: chat folders, AI assistant chat, calls, resume — **не backend features**
- SignalR только для online; offline — REST
- Нет outbox / push / email

**Демо-сценарий (15–20 мин):**
1. Build + tests green
2. User A post + media; User B comment → A notification realtime
3. Reaction → notification
4. Messaging A↔B без refresh
5. Jobs: Marya → **Senior Frontend Engineer** already Applied (seed) → **withdraw** → re-apply; sidebar chips from seed
6. Network → EventPanel **Upcoming** → Design Systems Conference
7. Admin: recommended queries list (8 seeded) + moderation smoke
8. Portfolio Marya: certificates/languages

---

## TODO (приоритеты после защиты)

| Priority | Task |
|----------|------|
| High | Production secrets management |
| High | Frontend: Home repost + post deep links |
| Medium | Message settings wiring |
| Medium | Events/network create UI |
| Medium | Admin catalog UI |
| Medium | Extend pagination to remaining lists |
| Low | Outbox, audit log, AI.Client boundary |
| Low | Demo seed Reset |

---

## V1 Limitations (reference)

> Полный legacy-текст сохранён ниже для детальной справки по backend v1.

### SignalR

- **Messaging** — `/hubs/messaging` (`JoinChat` / `LeaveChat`, group `chat:{chatId}`); events `MessageCreated`, `MessageUpdated`, `MessageDeleted`, `MessageRead`, `MessageMediaAttached` after HTTP. Frontend: `signalRService.js`.
- **Notifications** — `/hubs/notifications` (auto-join `user:{userId}`); event `NotificationCreated`. Frontend: `notificationsSignalRService.js`.
- Offline notifications — только REST. **Нет** outbox/retry. HTTP — source of truth.

### Domain events → notifications

| Event | Notification type |
|-------|-------------------|
| `CommentCreatedEvent` | `post_comment` |
| `ReactionUpsertedEvent` | `post_reaction` (first reaction only) |
| `MentionAddedEvent` | `post_mention` |
| `VacancyApplicationSubmittedEvent` | `job_application` |
| `ContactRequestSentEvent` | `contact_request` |
| `ContactRequestAcceptedEvent` | `contact_request_accepted` |

### Demo seed

- 24-step orchestrator — [08_SEED_DATA.md](08_SEED_DATA.md)
- **Enriched (2026-06-18):** admin recommended queries (8), Marya → catalog job application (withdraw demo), rolling showcase event dates
- `DemoSeed:Reset=true` — **не реализован**

### FileStorage / uploads (v1)

- 11 multipart endpoints; Content media: upload then attach via `mediaId`
- Orphan new file on DB failure — **не реализован** rollback
- Profile avatar/header — no entity ownership check on facade

### Pagination (v1)

- **PagedResponse:** feed, me posts, comments, jobs vacancies, notifications, network contacts, admin lists, catalogs
- **Plain array:** saved posts, reposts, favorites, applications, followers, etc.

### Events (v1)

- Discover / attending / speakers — реализованы
- Capacity, waitlist, draft lifecycle — **нет**

### Platform Admin (v1)

- Stats overview без date filters
- Нет moderation companies/groups/pages
- Нет audit log / reports queue
- Recommended queries: user write удалён — только Admin CRUD + user GET

### AI (v1)

- `AIManagement` → `IAIService` напрямую (без `AI.Client`) — осознанное упрощение

### Catalog security

- Global catalog writes — Admin-only
- User-scoped actions (`me/skills`, attach hashtag) — User JWT

### Исправлено в v1 (не limitation)

- Public professional: `users/{userId}/certificates|languages`
- Network-aware feed
- Jobs vacancies paged
- Admin events/comments moderation
- **Frontend wiring (2026-06-18):** repost API, portfolio certs/languages, mentions/hashtags API, withdraw application, admin recommended queries, notifications/messaging SignalR

---

## Что проверить позже (без изменения кода)

- Google/Facebook login edge cases
- Единообразие 200 empty vs 404 на list endpoints
- Integration/regression tests expansion

## Что нельзя делать при развитии

- Бизнес-логика в controllers
- Ссылки на чужой DataAccess
- Ломать route-контракты без версии API
- Менять net8.0 без согласования
