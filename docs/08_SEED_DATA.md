# 08. Demo Seed Data

> Как на пустой Development БД появляются пользователи, посты, jobs, network и messages.  
> **Обновлено:** 2026-06-18 — recommended queries, demo job application, rolling showcase event dates.

---

## 1. Зачем нужен demo seed

На защите диплома frontend должен показывать **живую** систему без ручного наполнения:

- Home feed с постами и комментариями  
- Jobs page с вакансиями, **recommended search chips**, **withdraw demo** (pre-seeded application)  
- Profile → Add skill с autocomplete  
- Network → contacts, followers, pending requests  
- Messages, notifications, **upcoming events** (EventPanel)  

Demo seed запускается **автоматически** при старте backend в Development, если включён флаг в конфиге.

---

## 2. Точка входа (не трогать при enrichment)

| Компонент | Файл | Роль |
|-----------|------|------|
| Trigger | `Facade.API/Extensions/DatabaseExtensions.cs` | После всех миграций, если `IsDevelopment()` и `DemoSeed:Enabled` |
| Registration | `Facade.API/Seeding/DemoSeedServiceCollectionExtensions.cs` | DI: каждый seeder + `IEnumerable<IDemoSeeder>` |
| Contract | `Facade.API/Seeding/IDemoSeeder.cs` | `Order`, `Name`, `SeedAsync` для всех 24 seeders |
| Orchestrator | `Facade.API/Seeding/DemoSeedOrchestrator.cs` | `IEnumerable<IDemoSeeder>` → sort by `Order`, `SeedStepResult` summary |
| Step result | `Facade.API/Seeding/SeedStepResult.cs` | Success/failure + duration per step |
| Options | `Facade.API/Seeding/DemoSeedOptions.cs` | Конфиг секции `DemoSeed` |
| Constants | `Facade.API/Seeding/DemoSeedConstants.cs` | Shared demo emails, marker prefix, thresholds |
| Marker helper | `Facade.API/Seeding/DemoSeederSupport.cs` | `NormalizeMarker`, user resolve/create helpers |

**Program.cs** только вызывает `AddDemoSeeders()` — логика seed не в Program.

Каждый seeder реализует `IDemoSeeder` с фиксированным `Order` (1..24). Orchestrator сортирует по `Order` и вызывает `SeedAsync`; имя шага для логов — `Name`.

---

## 3. Конфигурация (`appsettings.Development.json`)

```json
"DemoSeed": {
  "Enabled": true,
  "Reset": false,
  "MinUsers": 3,
  "DefaultUserPassword": "Test123!",
  "MarkerPrefix": "demo-seed:",
  "UserEmails": ["admin@local.dev", "test@example.com", "test2@example.com"]
}
```

| Поле | Назначение |
|------|------------|
| `Enabled` | `false` → orchestrator сразу выходит |
| `Reset` | **Не реализован** — только warning в логах; данные **не удаляются**. Для полного пересоздания — drop БД (см. §9) |
| `DefaultUserPassword` | Пароль для test/showcase/bot users |
| `PrimaryDemoUserEmail` | В options по умолчанию `marya101204@gmail.com` |
| `PrimaryDemoUserPassword` | Пароль primary user (showcase) |
| `MarkerPrefix` | Префикс `demo-seed:` для идempotency baseline data |
| `UserEmails` | Emails для `DemoSeedUserLookup` (baseline seeders) — см. §5.1 |

**Admin user** создаётся отдельно через `AdminSeed` + `IdentityDataSeeder` при миграции Identity (не через orchestrator, не через `DemoUsersSeeder`).

**Shared constants:** повторяющиеся demo emails и marker prefix — `Facade.API/Seeding/DemoSeedConstants.cs`; showcase catalog ссылается на те же значения через `DemoShowcaseSeedData`.

---

## 4. Порядок seeders (24 шага)

Порядок задаётся `IDemoSeeder.Order` (1..24). Orchestrator сортирует seeders по `Order` и запускает каждый шаг в `try/catch` через `SeedStepResult` — падение одного шага **не останавливает** остальные.

| Order | Seeder | Что создаёт |
|-------|--------|-------------|
| 1 | `DemoUsersSeeder` | `test@example.com`, `test2@example.com` |
| 2 | `DemoShowcaseUsersSeeder` | Primary (Marya) + ~16 showcase emails |
| 3 | `DemoSkillsSeeder` | **23 global skills** (Java, React, PostgreSQL, …) |
| 4 | `DemoProfileSeeder` | Базовые профили admin/test users |
| 5 | `DemoShowcaseProfileSeeder` | Богатые профили showcase |
| 6 | `DemoContentSeeder` | ≥3 baseline posts (`demo-seed:` marker) |
| 7 | `DemoBotContentSeeder` | **18 bot users** `@demo.linkup`, **до 40 posts**, 2 comments/post |
| 8 | `DemoShowcaseContentSeeder` | Showcase posts с медиа |
| 9 | `DemoShowcaseProfessionalSeeder` | Experience, education, skills Marya/David |
| 10 | `DemoJobsSeeder` | LinkUp Labs + 2 vacancies |
| 11 | `DemoJobsCatalogSeeder` | **10 companies + 10 vacancies**; **8 admin recommended queries**; **1 demo job application** (Marya → catalog vacancy) |
| 12 | `DemoShowcaseJobsSeeder` | Showcase companies/vacancies, Marya **saved searches** (`job_search_queries`, не admin recommended) |
| 13 | `DemoEventsSeeder` | LinkUp Dev Meetup (**StartAt = UtcNow + 7 days**, 18:00 UTC) |
| 14 | `DemoShowcaseEventsSeeder` | Design Systems Conference — speakers + schedule; **rolling StartAt** (+21 days если дата в прошлом) |
| 15 | `DemoNetworkSeeder` | test1↔test2 contact, follows |
| 16 | `DemoBotNetworkSeeder` | Primary ↔ bots: **8+8 follows**, **5 accepted**, **4 pending** |
| 17 | `DemoShowcaseNetworkSeeder` | Groups, pages, showcase contacts |
| 18 | `DemoMessagingSeeder` | Chat test1↔test2 |
| 19 | `DemoShowcaseMessagingSeeder` | Chat Marya↔Emma |
| 20 | `DemoContentEngagementSeeder` | Comments/reactions на **marker posts** (`Content.StartsWith(marker)`, до 2 постов) |
| 21 | `DemoBotContentEngagementSeeder` | Reactions/comments showcase users на bot posts |
| 22 | `DemoPagesGroupsSeeder` | Baseline page + group |
| 23 | `DemoNotificationsSeeder` | Sample notifications для Marya (`post_like`, `post_comment`, `contact_request_accepted`, `vacancy_recommendation`, `event_reminder`) — **не** для test@ |
| 24 | `DemoShowcaseViewsSeeder` | Profile views, post views, activity |

### 4.1. Jobs & events enrichment (Order 11 / 14)

**`DemoJobsCatalogSeeder`** (после catalog vacancies):

| Данные | Детали | Idempotency |
|--------|--------|-------------|
| **Recommended job queries** | 8 chips: `React developer`, `Frontend developer`, `.NET developer`, `Remote`, `UI designer`, `Product manager`, `DevOps`, `Warsaw` | `RecommendedJobQueries.Query` exact match |
| **Demo application** | Applicant: **Marya** (`marya101204@gmail.com`); vacancy: **Senior Frontend Engineer** @ NovaStack (catalog, posted by admin) | Skip if active `UserId + VacancyId`; withdrawn → `ApplyAsync` reactivates on next seed |

**`DemoShowcaseEventsSeeder`:**

| Поведение | Детали |
|-----------|--------|
| **Новое событие** | `StartAt = UtcNow + 21 days`, `EndAt = StartAt + 8h` |
| **Существующее, дата в прошлом** | `StartAt` → `UtcNow + 21 days`, `EndAt` с сохранением длительности |
| **Уже upcoming** | Даты не меняются |
| **Schedule** | `TimeLabel` относительные (`9:00 AM`, …) — не сдвигаются |

Title для поиска: `{marker}Design Systems Conference 2026` (`marker` = `demo-seed:`).

---

## 5. Ключевые пользователи

| Email | Роль в demo | Пароль (Dev) |
|-------|-------------|--------------|
| `admin@local.dev` | Admin + jobs poster | `Admin123!` (AdminSeed) |
| `marya101204@gmail.com` | Primary showcase (Marya) | `Mgg101204` или из options |
| `test@example.com` | Lucas / test user 1 | `DefaultUserPassword` |
| `test2@example.com` | Test user 2 / backend dev | `DefaultUserPassword` |
| `designer@demo.com` | Emma (showcase) | `DefaultUserPassword` |
| `*@demo.linkup` | Bot personas (18 unique) | `DefaultUserPassword` |

Showcase emails: `DemoShowcaseSeedData.AdditionalUserEmails` (Google personas, demo.com designers, etc.).

### 5.1. Зависимости `DemoSeed:UserEmails`

| Источник | Кого создаёт / находит | Пароль (Dev) |
|----------|------------------------|--------------|
| `IdentityDataSeeder` + `AdminSeed` | `admin@local.dev` (роль Admin) | `Admin123!` |
| `DemoUsersSeeder` | `test@example.com`, `test2@example.com` | `DefaultUserPassword` |
| `DemoShowcaseUsersSeeder` | Marya + showcase emails из `DemoShowcaseSeedData` | Marya: `PrimaryDemoUserPassword`; остальные: `DefaultUserPassword` |
| `DemoBotContentSeeder` | 18 bot users `@demo.linkup` | `DefaultUserPassword` |

`DemoSeedUserLookup` читает только `DemoSeed:UserEmails`. Baseline seeders используют этот lookup.

| Email в `UserEmails` | Baseline seeders, зависящие от пользователя |
|----------------------|---------------------------------------------|
| `admin@local.dev` | Profile, Jobs (company/vacancies), Events (organizer), Jobs catalog poster |
| `test@example.com` | Profile, Content, Network (contact), Messaging (chat), Engagement |
| `test2@example.com` | Profile, Content, Network, Messaging, Events (attendee), Engagement |
| `marya101204@gmail.com` | **Не обязателен** для showcase (Marya создаётся `DemoShowcaseUsersSeeder`). Если **отсутствует** в `UserEmails`, baseline шаги для Marya **пропускаются**: Content (welcome post), Network (follow), PagesGroups (owner), ContentEngagement (primary). Showcase seeders резолвят Marya по `DemoShowcaseSeedData`. |

Если убрать email из `UserEmails`, связанные baseline seeders логируют warning и пропускают шаги — orchestrator **не падает**.

Showcase/bot seeders не используют `UserEmails`; резолв по `DemoShowcaseSeedData` / `DemoBotCatalog`.

---

## 6. Idempotency — как seed не дублирует данные

| Seeder | Проверка перед insert |
|--------|------------------------|
| Skills | `Id` или `Name` (ILIKE) |
| Jobs catalog | Company `Id`/Name; vacancy `CompanyId + Title` |
| **Recommended job queries** | `Query` (exact, trimmed) |
| **Demo job application** | Active: `UserId + VacancyId` + `WithdrawnAt == null` |
| **Showcase event dates** | Title match; roll only if `StartAt < UtcNow` |
| Bot content | User by email; post by content; comments by pair |
| Bot network | Follow `FollowerId+FollowingId`; contact pair status |
| Baseline content | Count posts with `MarkerPrefix` |
| Baseline messaging | Direct chat test1↔test2; per-message idempotency by `ChatId` + `SenderId` + exact demo content |
| Content engagement | Target posts: `Content.StartsWith(marker)` only (до 2, never first N globally). Comments skip if `>= 2` marker comments exist; per-comment/reaction duplicate check by post+user+content. Fallback marker post: exact content check before create |
| Baseline jobs | Count vacancies with marker prefix |

Повторный `dotnet run` на той же БД → логи `skipped`, `added 0`.

---

## 7. Как включить / выключить

```json
"DemoSeed": { "Enabled": false }
```

Или запуск не в Development — seed не вызывается.

---

## 8. Как проверить после seed

### Swagger / API (login as Marya)

```
GET /api/content/feed?page=1&pageSize=10
GET /api/jobs/vacancies?minSalaryFrom=80000
GET /api/jobs/recommended-queries
GET /api/jobs/me/applications
GET /api/events/discover?page=1&pageSize=5
GET /api/network/me/following
GET /api/network/me/followers
GET /api/network/me/contacts
GET /api/professional/skills?search=React
```

**Withdraw demo (без ручного apply):** login Marya → `/app/vacancies` → **Senior Frontend Engineer** (NovaStack) уже **Applied** → Withdraw → re-apply.

**Recommended chips:** `VacanciesSidebar` показывает 8 queries после seed (без ручного admin CRUD).

### SQL (пример)

```sql
SELECT COUNT(*) FROM content.posts WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM professional.skills;
SELECT COUNT(*) FROM jobs.vacancies WHERE deleted_at IS NULL;
```

### Логи

```
Demo seed orchestrator started.
Demo seed step starting: DemoBotContentSeeder.
Demo seed step completed: DemoBotContentSeeder in 842ms.
Demo seed orchestrator finished: 24/24 steps succeeded, 0 failed.
```

При ошибке шага orchestrator продолжает остальные шаги и в конце пишет summary, например:

```
Demo seed orchestrator finished: 22/24 steps succeeded, 2 failed: DemoMessagingSeeder, DemoNotificationsSeeder.
```

При неверной регистрации seeders orchestrator только пишет warning/error (count ≠ 24, duplicate/missing `Order`) и **не падает**.

---

## 9. Очистка и пересоздание БД

1. Остановить backend  
2. Drop database `linkedin_dev` или `docker compose down -v`  
3. Запустить снова — миграции + seed  

`DemoSeed:Reset=true` **не удаляет** данные (не реализовано). Orchestrator только пишет warning и продолжает idempotent seed. См. также XML-комментарий на `DemoSeedOptions.Reset`.

---

## 10. Demo flows, включённые seed (2026-06-18)

| UI flow | Seed source | Login |
|---------|-------------|-------|
| Vacancies sidebar chips | `DemoJobsCatalogSeeder` → recommended queries | любой user |
| Withdraw application | `DemoJobsCatalogSeeder` → Marya applied to catalog vacancy | Marya |
| EventPanel **Upcoming** | `DemoShowcaseEventsSeeder` rolling + `DemoEventsSeeder` +7d | любой user |
| Admin recommended queries list | те же 8 queries (можно CRUD поверх) | admin |

Ранний enrichment plan выполнен в коде seeders; отдельный `DEMO_SEED_ENRICHMENT_PLAN.md` в репозитории не хранится.
