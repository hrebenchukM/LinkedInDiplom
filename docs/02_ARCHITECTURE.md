# 02. Архитектура, ООП и правила

## Слои

Frontend  
↓ HTTP  
Facade.API  
↓ Controllers (`Facade.*.Controllers`)  
Facade services (`Facade.*.Services`)  
↓ `I*Client` / Resource (+ `IFileStorageService` для uploads)  
Core services (`*.Services`)  
↓ `*DbContext` (`*.DataAccess`)  
PostgreSQL schema

## Program.cs (факт)

Facade.API регистрирует:

- 9 core модулей: `AddIdentityModule ... AddEventsModule`
- shared **FileStorage**: `AddFileStorage(configuration)`
- facade модулей: `AddAccountManagementFacade`, `AddProfileManagementFacade`, … `AddEventsManagementFacade`, `AddAdminManagementFacade`, `AddAIManagementFacade`
- controllers через `AddApplicationPart(...)` (включая `AdminManagementControllersAssemblyMarker`, `AIController`)
- JWT, CORS, Swagger (dev), static files `/uploads`

## FileStorage (shared infrastructure)

Не core-модуль и не facade bounded context. Отдельные проекты `backend/FileStorage/Facade.FileStorage.*`.

```
Upload Controller (IFormFile)
  → Facade *ManagementService
    → permission / existence check (entity uploads)
    → IFileStorageService.SaveAsync
      → local /uploads/...  OR  S3 HTTPS URL
    → I*Client updates URL in DB (string only, no blob)
```

- Feature facades зависят только от `Facade.FileStorage.Contracts`.
- `FileStorageService` не зависит от Profile/Content/Professional/Network/Events/Messaging.
- Подробности: `09_CONFIG_UPLOADS.md`.

## Facade.Shared.Contracts (shared facade contracts)

`backend/Facade/Facade.Shared.Contracts` — **не** бизнес-модуль и не bounded context.

- Хранит только **технические** общие facade/API contracts, переиспользуемые несколькими `Facade.*Management` модулями.
- Сейчас: **pagination** (`PagedRequest`, `PagedResponse<T>`, `Pagination` helper).
- Feature modules **не** должны складывать туда свои бизнес DTO, Request/Response bounded context или entities.
- При подключении пагинации к list endpoints модули добавляют `ProjectReference` только когда реально используют contract.
- При будущем переходе к микросервисам такие contracts могут быть вынесены в отдельный shared NuGet/package без переноса бизнес-логики.

## Platform Admin (Facade.AdminManagement)

`Facade.AdminManagement` — facade для **platform admin** (администратор платформы), а не отдельный core-модуль.

- **Нет своего** `*DbContext` и schema: admin facade не владеет данными.
- **Не путать** с `network.page_admins` — это админы **страниц** (Network), другая сущность и другие endpoints (`/api/network/.../pages/.../admins`).

### Request flow (admin)

```
HTTP /api/admin/*
  → Facade.AdminManagement.Controllers (Admin*Controller)
  → IAdminManagementService (Facade.AdminManagement.Services)
  → Client Resources: IUserResource (Identity), IPostResource + ICommentResource (Content),
    IVacancyResource + IRecommendedJobQueryResource (Jobs), IEventResource (Events)
  → Core Services (UserAdminService, PostService, CommentService, VacancyService, EventService, …)
  → свой DbContext модуля
```

Правило сохранено: `Facade.AdminManagement` **не ссылается** на чужой `*DataAccess` напрямую.

### Cross-module read orchestration (примеры)

**Network-aware feed (Content → Network):**

```
GET /api/content/feed (+ optional JWT)
  → ContentManagementService
  → INetworkClient.UserGraph.GetUserNetworkUserIdsAsync (если JWT)
  → IPostResource.GetFeedPostsAsync(GetFeedPostsParameters { AuthorUserIds, ViewerUserId })
  → PostService (Content schema)
```

**Events list enrichment (Events facade):**

```
GET /api/events (discover)
  → EventsManagementService
  → IEventResource.DiscoverEventsAsync + attendee counts из core
  → при JWT: IsAttending вычисляется в facade по attending set
```

Такой orchestration **не** нарушает границу модулей: facade координирует, core владеет данными своей schema.

### Facade.API как composition root

`Facade.API/Program.cs` — host-level composition root: регистрация core modules, facades, JWT, Swagger, **и** `ApplyMigrationsAsync` для всех 9 `DbContext` в фиксированном порядке (см. «Порядок migrations» ниже). Отдельного migration runner проекта нет.

## Domain events (loose coupling)

Модули обмениваются side-effects через **domain events** без прямых ссылок между feature modules:

- **Publisher:** core service после успешного `SaveChangesAsync` вызывает `IDomainEventPublisher.PublishAsync(...)`.
- **Consumer:** модуль-подписчик регистрирует `IDomainEventHandler<TEvent>` в своём DI.
- **Contracts:** payload events живут в отдельных `*.Events.Contracts` проектах (без DbContext, DTO facade, SignalR).

**Пример (реализовано):** Content `CommentService` публикует `CommentCreatedEvent` → Notifications `CreateNotificationOnCommentCreatedHandler` создаёт notification для автора поста (кроме self-comment). Content **не зависит** от Notifications.

**Пример (реализовано):** Content `ReactionService` публикует `ReactionUpsertedEvent` только при **первой** реакции пользователя на пост → Notifications `CreateNotificationOnReactionUpsertedHandler` создаёт notification для автора поста (кроме self-reaction; update типа реакции event не публикует). Content **не зависит** от Notifications.

**Пример (реализовано):** Network `ContactService` публикует `ContactRequestSentEvent` → Notifications `CreateNotificationOnContactRequestSentHandler` создаёт notification для получателя request (кроме self-request). Network **не зависит** от Notifications.

**Пример (реализовано):** Network `ContactService` публикует `ContactRequestAcceptedEvent` → Notifications `CreateNotificationOnContactRequestAcceptedHandler` создаёт notification для отправителя request (requester). Network **не зависит** от Notifications.

**Текущий transport:** in-memory (`InMemoryDomainEventPublisher` в Identity.DI). При выделении microservices — заменить publisher на broker/outbox; handlers и event contracts остаются на границе модулей.

### AI module (microservice readiness note)

`AIManagement` регистрирует `IAIService` напрямую в facade DI (`AddAIManagementFacade`), без `AI.Client` / `I*Resource`. Для выделения AI в отдельный сервис потребуется client boundary по тому же паттерну, что у остальных модулей.

## Порядок migrations

`ApplyMigrationsAsync`:

1. Identity
2. Profile
3. Professional
4. Network
5. Content
6. Messaging
7. Jobs
8. Notifications
9. Events

## Паттерны (реально в коде)

- interface-based programming (`I*Service`, `I*Client`, `I*Resource`)
- dependency inversion (facade зависит от `I*Client`, не от DbContext)
- dependency injection (extension methods `Add*Module`, `Add*ManagementFacade`)
- separation of concerns (Controller / Facade Service / Core Service / DataAccess)
- DTO + Request/Response + Parameters/Results
- service layer
- client/resource pattern
- feature-based controllers
- partial facade services
- DataAnnotations validation
- error mapping (`MapErrors` в base controllers)
- DbContext per module, schema per module
- soft delete
- domain events (`UserRegisteredEvent`)
- async/await

## Почему не Repository/UoW как у преподавателя

В проекте используется связка `DbContext + Services + Client/Resource`, потому что:

- граница — модуль и его schema
- меньше лишних абстракций
- удобнее выносить модуль в микросервис позже

## Что нельзя ломать

- controllers только в facade
- core не ссылается на facade
- facade/core не ссылаются на чужой DataAccess
- не переносить бизнес-логику в controller
- не менять net8.0 без отдельного решения
