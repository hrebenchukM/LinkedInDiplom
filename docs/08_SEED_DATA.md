# 08. Demo Seed Data

> Как на пустой Development БД появляются пользователи, посты, jobs, network и messages.  
> **Код не меняется этим документом** — описание актуального состояния `master`.

---

## 1. Зачем нужен demo seed

На защите диплома frontend должен показывать **живую** систему без ручного наполнения:

- Home feed с постами и комментариями  
- Jobs page с вакансиями и фильтром зарплаты  
- Profile → Add skill с autocomplete  
- Network → contacts, followers, pending requests  
- Messages, notifications, events  

Demo seed запускается **автоматически** при старте backend в Development, если включён флаг в конфиге.

---

## 2. Точка входа (не трогать при enrichment)

| Компонент | Файл | Роль |
|-----------|------|------|
| Trigger | `Facade.API/Extensions/DatabaseExtensions.cs` | После всех миграций, если `IsDevelopment()` и `DemoSeed:Enabled` |
| Registration | `Facade.API/Seeding/DemoSeedServiceCollectionExtensions.cs` | DI для всех seeders |
| Orchestrator | `Facade.API/Seeding/DemoSeedOrchestrator.cs` | Порядок шагов, изоляция ошибок |
| Options | `Facade.API/Seeding/DemoSeedOptions.cs` | Конфиг секции `DemoSeed` |

**Program.cs** только вызывает `AddDemoSeeders()` — логика seed не в Program.

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
| `Reset` | **Не реализован** — только warning в логах |
| `DefaultUserPassword` | Пароль для test/showcase/bot users |
| `PrimaryDemoUserEmail` | В options по умолчанию `marya101204@gmail.com` |
| `PrimaryDemoUserPassword` | Пароль primary user (showcase) |
| `MarkerPrefix` | Префикс `demo-seed:` для идempotency baseline data |
| `UserEmails` | Emails для `DemoSeedUserLookup` (baseline seeders) |

**Admin user** создаётся отдельно через `AdminSeed` + `IdentityDataSeeder` при миграции Identity (не через orchestrator).

---

## 4. Порядок seeders (24 шага)

Каждый шаг в `try/catch` — падение одного шага **не останавливает** остальные.

| # | Seeder | Что создаёт |
|---|--------|-------------|
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
| 11 | `DemoJobsCatalogSeeder` | **10 companies + 10 vacancies** (catalog) |
| 12 | `DemoShowcaseJobsSeeder` | Showcase companies/vacancies, saved searches |
| 13 | `DemoEventsSeeder` | Dev Meetup event |
| 14 | `DemoShowcaseEventsSeeder` | Design Systems Conference |
| 15 | `DemoNetworkSeeder` | test1↔test2 contact, follows |
| 16 | `DemoBotNetworkSeeder` | Primary ↔ bots: **8+8 follows**, **5 accepted**, **4 pending** |
| 17 | `DemoShowcaseNetworkSeeder` | Groups, pages, showcase contacts |
| 18 | `DemoMessagingSeeder` | Chat test1↔test2 |
| 19 | `DemoShowcaseMessagingSeeder` | Chat Marya↔Emma |
| 20 | `DemoContentEngagementSeeder` | Comments/reactions на baseline posts |
| 21 | `DemoBotContentEngagementSeeder` | Reactions/comments showcase users на bot posts |
| 22 | `DemoPagesGroupsSeeder` | Baseline page + group |
| 23 | `DemoNotificationsSeeder` | Sample notifications для Marya |
| 24 | `DemoShowcaseViewsSeeder` | Profile views, post views, activity |

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

---

## 6. Idempotency — как seed не дублирует данные

| Seeder | Проверка перед insert |
|--------|------------------------|
| Skills | `Id` или `Name` (ILIKE) |
| Jobs catalog | Company `Id`/Name; vacancy `CompanyId + Title` |
| Bot content | User by email; post by content; comments by pair |
| Bot network | Follow `FollowerId+FollowingId`; contact pair status |
| Baseline content | Count posts with `MarkerPrefix` |
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
GET /api/network/me/following
GET /api/network/me/followers
GET /api/network/me/contacts
GET /api/professional/skills?search=React
```

### SQL (пример)

```sql
SELECT COUNT(*) FROM content.posts WHERE deleted_at IS NULL;
SELECT COUNT(*) FROM professional.skills;
SELECT COUNT(*) FROM jobs.vacancies WHERE deleted_at IS NULL;
```

### Логи

```
Demo seed orchestrator started.
Demo seed step completed: DemoBotContentSeeder.
Demo seed orchestrator finished.
```

---

## 9. Очистка и пересоздание БД

1. Остановить backend  
2. Drop database `linkedin_dev` или `docker compose down -v`  
3. Запустить снова — миграции + seed  

`DemoSeed:Reset=true` **не удаляет** данные (не реализовано).

---

## 10. Связь с enrichment plan

План: [DEMO_SEED_ENRICHMENT_PLAN.md](DEMO_SEED_ENRICHMENT_PLAN.md) — **выполнен** (Steps 1–4 + BotNetwork).  
Merger backend **не** копировался целиком — только catalog data и идеи.
