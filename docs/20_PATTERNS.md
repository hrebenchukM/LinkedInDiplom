# 20. Patterns and Principles (from this project)

> Не абстрактная теория — только то, что реально видно в коде LinkedInDiplom.

---

## Modular Monolith

**Что:** один deployable (`Facade.API`), но логически разделён на bounded contexts (Identity, Profile, Content, …).

**Зачем:** проще deploy чем microservices, но границы модулей позволяют позже extract service.

**Пример:** `Content.Services` не ссылается на `Network.DataAccess` — только на `INetworkClient`.

---

## Facade Pattern

**Что:** `Facade.*Management` модули — тонкий API-слой над core.

**Зачем:** 
- HTTP concerns (controllers, DTO mapping, auth attributes)
- Orchestration нескольких core clients
- BFF-like aggregation (feed + network graph)

**Пример:** `ProfileManagementService.Media.cs` — проверяет JWT user, вызывает `IFileStorageService`, затем `IProfileClient`.

**Admin facade:** `Facade.AdminManagement` — platform admin без своего DbContext.

---

## DTO Pattern

**Что:** Request/Response/Dto классы в `*.Contracts` проектах.

**Зачем:** не expose EF entities наружу; stable API contract.

**Пример:** `CreatePostRequest` → `PostService` → `Post` entity → `PostDto` response.

---

## Client / Resource Abstraction

**Что:** Core modules expose `I*Client` with `I*Resource` interfaces.

**Зачем:** другие modules вызывают через contract, не через DbContext.

**Пример:** `ContentManagementService` → `INetworkClient.UserGraph.GetUserNetworkUserIdsAsync()` для network-aware feed.

**Исключение:** `AIManagement` вызывает `IAIService` напрямую (architectural debt для future extraction).

---

## Dependency Injection

**Что:** все services/clients/handlers регистрируются в `*.DI` projects.

**Пример:** `Program.cs`:
```csharp
builder.Services.AddIdentityModule(...);
builder.Services.AddProfileManagementFacade(...);
```

---

## Options Pattern

**Что:** strongly-typed config classes bound from `appsettings`.

**Примеры:**
- `JwtSettings` — token signing
- `DemoSeedOptions` — seed configuration
- `AdminSeedOptions` — admin user on first run
- `UploadsOptions` / `AwsS3Options` — file storage

---

## Domain Events

См. [19_DOMAIN_EVENTS_NOTIFICATIONS.md](19_DOMAIN_EVENTS_NOTIFICATIONS.md).

**Пример:** `UserRegisteredEvent` → auto-create empty profile.

---

## Soft Delete

**Что:** nullable `DeletedAt` timestamp вместо physical DELETE.

**Где:** posts, comments, users, vacancies, events, profiles, …

**Важно:** нет global EF query filter — каждый service фильтрует `DeletedAt == null` в queries.

**Admin restore:** `PATCH .../restore` clears `DeletedAt`.

---

## Pagination

**Contract:** `Facade.Shared.Contracts` — `PagedRequest`, `PagedResponse<T>`, `Pagination` helper.

**Пример:** `GET /api/jobs/vacancies?page=1&pageSize=20` → `{ items, totalCount, page, pageSize }`.

**Defaults:** typically page=1, pageSize=20; max pageSize enforced in helper.

---

## Result / Response Wrappers

**Что:** facade services return typed responses with `Success`, `Errors`, `Data`.

**Пример:** `ProfileResponse { Success, Errors, Profile }`

Controllers map via `MapErrors()` in base classes → 400/404.

---

## CQRS-like Requests

**Что:** query/request classes для complex reads.

**Примеры:**
- `GetVacanciesQueryRequest` — filters + pagination
- `GetFeedParameters` — feed paging
- `AdminUsersQueryRequest` — admin search/filter

Не full CQRS (нет MediatR), но separation read parameters от write requests.

---

## Separation of Concerns

| Layer | Responsibility |
|-------|----------------|
| Controllers | HTTP, auth attributes, model binding |
| Facade Services | Orchestration, DTO mapping, permissions |
| Core Services | Business rules, DbContext access |
| DataAccess | EF entities, migrations |

**Правило:** controllers не содержат business logic.

---

## SOLID (видимые примеры)

- **S:** `CommentService` — только comments; `ReactionService` — только reactions
- **O:** new notification types via new handlers, не меняя CommentService
- **L:** `IFileStorageService` — local и S3 interchangeable
- **I:** small interfaces: `IProfileClient`, `IUserResource`
- **D:** controllers depend on `IProfileManagementService`, not concrete class

---

## BFF / Facade API

`Facade.API` — единая точка входа для frontend:
- Aggregates data from multiple modules
- Single JWT validation
- Single CORS policy
- Swagger documentation

При microservices → Facade becomes API Gateway or stays as BFF.
