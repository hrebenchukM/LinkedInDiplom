# 26. Limitations and TODO

> Честный статус backend на момент обновления документации (2026-06-17).  
> Для защиты диплома: что можно показать, что — с оговорками.

Legacy index: [13_V1_LIMITATIONS.md](13_V1_LIMITATIONS.md).

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
