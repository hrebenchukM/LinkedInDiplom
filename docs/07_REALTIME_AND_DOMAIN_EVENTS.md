

---

<!-- merged from: 07_REALTIME_AND_DOMAIN_EVENTS.md -->

# SignalR / Realtime (Messaging + Notifications)

# 18. SignalR / Realtime Chat & Notifications

> **Обновлено:** 2026-06-18 — уточнены hub groups, domain events → notifications, frontend wiring, v1 limitations.

---

## Краткая сводка

| Hub | Route | Groups | Server → client events | Frontend client |
|-----|-------|--------|------------------------|-----------------|
| **Messaging** | `/hubs/messaging` | `chat:{chatId}` (after `JoinChat`) | `MessageCreated`, `MessageUpdated`, `MessageDeleted`, `MessageRead`, `MessageMediaAttached` | `frontend/src/features/messaging/signalRService.js` |
| **Notifications** | `/hubs/notifications` | `user:{userId}` (auto on connect from JWT) | `NotificationCreated` | `frontend/src/features/notifications/notificationsSignalRService.js` |

**Limitations v1:**
- SignalR — **realtime delivery только для online** пользователей.
- Offline users получают notifications из **PostgreSQL** через `GET /api/notifications/me` после входа.
- **Нет** Outbox, message broker, push/email, retry для failed hub push.
- HTTP API остаётся **source of truth** для messages и notifications.

**Vite dev proxy:** `/hubs/*` и `/api/*` → `http://localhost:5000` (см. `frontend/vite.config.js`).

---

## Статус

| Компонент | Статус |
|-----------|--------|
| **Messaging** SignalR Hub | **Реализован** (`MessagingHub`, `/hubs/messaging`) |
| Messaging server push events | **Реализованы** (5 типов) |
| **Notifications** SignalR Hub | **Реализован** (`NotificationsHub`, `/hubs/notifications`) |
| Notifications server push events | **Реализован** (`NotificationCreated`) |
| HTTP Messaging API | **Основной flow** — создание чатов, отправка и хранение сообщений |
| HTTP Notifications API | **Источник истины** — список, read, delete |
| Frontend messaging integration | **Реализована** (`frontend/src/features/messaging/signalRService.js`) |
| Frontend notifications integration | **Реализована** (`frontend/src/features/notifications/notificationsSignalRService.js`) |
| Redis backplane / scale-out | **Не реализовано** (ограничение v1) |

### Два hub — зачем раздельно

| Hub | Route | Group | События | Назначение |
|-----|-------|-------|---------|------------|
| **MessagingHub** | `/hubs/messaging` | `chat:{chatId}` | `MessageCreated`, `MessageUpdated`, … | Realtime **чата** — только участники чата (после `JoinChat`) |
| **NotificationsHub** | `/hubs/notifications` | `user:{userId}` | `NotificationCreated` | Realtime **уведомлений** — только получатель (group из JWT при connect) |

Клиент **не** смешивает chat events и notification events: разные URL, разные сервисы на frontend.

**Offline:** SignalR доставляет события только **подключённым** клиентам. Если пользователь offline, notification **всё равно сохраняется в PostgreSQL** и появится через `GET /api/notifications/me` после входа. Push/email/mobile push **не реализованы**.

### HTTP и SignalR — простыми словами

| Слой | За что отвечает |
|------|-----------------|
| **HTTP API** (`/api/messaging/*`) | Создание чатов, список чатов, отправка/редактирование/удаление сообщений, read receipts, загрузка media. Всё сохраняется в PostgreSQL — это **источник истины**. |
| **SignalR** (`/hubs/messaging`) | **Realtime-доставка** уже сохранённых событий другим участникам чата: новое сообщение, правка, удаление, прочтение, media. Клиент **не отправляет** текст сообщения через WebSocket — только получает push после успешного HTTP. |

Типичный сценарий: `POST .../messages` → запись в БД → `MessagingRealtimeNotifier` → `MessageCreated` в group `chat:{chatId}` → открытые вкладки обновляются без polling.

---

## Hub

| Параметр | Значение |
|----------|----------|
| Класс | `MessagingHub` |
| Проект | `Facade.MessagingManagement.Controllers` |
| Route | `/hubs/messaging` |
| Auth | `[Authorize]` — JWT обязателен |

Регистрация в `Facade.API/Program.cs`:

```csharp
app.MapHub<MessagingHub>("/hubs/messaging");
```

---

## Подключение клиента

### URL

```
ws://localhost:5000/hubs/messaging?access_token=<JWT>
```

или HTTPS:

```
wss://localhost:7011/hubs/messaging?access_token=<JWT>
```

JWT передаётся в query `access_token` (настроено в JWT Bearer events для SignalR path).

### JavaScript (@microsoft/signalr)

```javascript
import * as signalR from '@microsoft/signalr';

const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_BASE}/hubs/messaging`, {
    accessTokenFactory: () => localStorage.getItem('accessToken')
  })
  .withAutomaticReconnect()
  .build();

await connection.start();
await connection.invoke('JoinChat', chatId);
```

---

## Методы клиента → сервер

| Method | Parameters | Описание |
|--------|------------|----------|
| `JoinChat` | `Guid chatId` | Проверяет доступ к чату; добавляет connection в group `chat:{chatId}` |
| `LeaveChat` | `Guid chatId` | Убирает connection из group |

---

## События сервер → клиент

Broadcast в group `chat:{chatId}` через `MessagingRealtimeNotifier`:

| Event | Payload | Когда |
|-------|---------|-------|
| `MessageCreated` | `MessageDto` | После успешного `POST .../messages` |
| `MessageUpdated` | `MessageDto` | После `PATCH .../messages/{id}` |
| `MessageDeleted` | `{ chatId, messageId }` | После `DELETE .../messages/{id}` |
| `MessageRead` | `{ chatId, id, messageId, userId, readAt }` | После `POST .../read` |
| `MessageMediaAttached` | `{ chatId, messageId, media }` | После attach/upload media |

---

## Связь с Messaging API

```
1. Client: POST /api/messaging/me/chats/{chatId}/messages  (HTTP)
2. Backend: saves message to DB
3. Backend: MessagingRealtimeNotifier → hub.Clients.Group("chat:{id}").SendAsync("MessageCreated", dto)
4. Other clients in group receive event
```

HTTP остаётся source of truth; SignalR — notification layer.

---

## CORS для SignalR

Development policy `DevelopmentCors`:
- Origins: `localhost:5173`, `127.0.0.1:5173`, `localhost:3000`
- `AllowCredentials: true` (обязательно для SignalR with cookies/tokens)

Production: заполнить `Cors:AllowedOrigins` в appsettings.

---

## Тестирование без frontend

### 1. Swagger + REST

Создать chat и message через `/api/messaging/*`.

### 2. SignalR test client

Использовать Postman WebSocket или скрипт `frontend/scripts/verify-signalr.mjs`:

```bash
cd frontend
node scripts/verify-signalr.mjs
```

### 3. Manual checklist

См. [09_TESTING_AND_POSTMAN.md](09_TESTING_AND_POSTMAN.md) — раздел «Messaging SignalR manual testing».

---

## Ограничения v1 (SignalR)

- Один instance — без Redis backplane events не cross-node
- Нет typing indicators, online presence
- **Нет** push/email/mobile push для notifications
- **Нет** outbox/retry — при падении push после записи в БД клиент узнает о notification через REST
- Token refresh во время active connection — reconnect manually (automatic reconnect в клиенте частично помогает)

---

## Notifications Hub

| Параметр | Значение |
|----------|----------|
| Класс | `NotificationsHub` |
| Проект | `Facade.NotificationsManagement.Controllers` |
| Route | `/hubs/notifications` |
| Auth | `[Authorize]` — JWT обязателен |
| Group | `user:{userId}` — userId из JWT claims при `OnConnectedAsync`; клиент **не** передаёт userId |

Регистрация в `Facade.API/Program.cs`:

```csharp
app.MapHub<NotificationsHub>("/hubs/notifications");
```

JWT для WebSocket: query `access_token` для путей `/hubs/messaging` **и** `/hubs/notifications` (см. `JwtBearerEvents.OnMessageReceived`).

### Подключение клиента

```
ws://localhost:5000/hubs/notifications?access_token=<JWT>
```

Frontend (`notificationsSignalRService.js`):

```javascript
import * as signalR from '@microsoft/signalr';
import { resolveNotificationsSignalRHubUrl } from '../../shared/api/config.js';

const connection = new signalR.HubConnectionBuilder()
  .withUrl(resolveNotificationsSignalRHubUrl(), {
    accessTokenFactory: () => getAccessToken() || '',
  })
  .withAutomaticReconnect()
  .build();

await connection.start();
// Отдельный Join не нужен — hub добавляет connection в user:{userId} при connect
```

### События сервер → клиент

| Event | Payload | Когда |
|-------|---------|-------|
| `NotificationCreated` | `NotificationDto` | После успешного `NotificationService.CreateAsync` (domain event handlers, demo seed) |

Broadcast: `NotificationRealtimeNotifier` → `Clients.Group("user:{notification.UserId}").SendAsync("NotificationCreated", dto)`.

Ошибка push **логируется**, не ломает создание notification в БД.

### Связь с Notifications API

```
1. Domain event (например CommentCreatedEvent)
2. CreateNotificationOnCommentCreatedHandler → NotificationService.CreateAsync
3. Backend: INSERT в notifications.notifications
4. INotificationCreatedPublisher → NotificationRealtimeNotifier → NotificationCreated
5. Online клиент получает push; offline — увидит запись при GET /api/notifications/me
```

HTTP остаётся source of truth; SignalR — realtime layer для **online** пользователей.

### Frontend integration

| Файл | Роль |
|------|------|
| `notificationsSignalRService.js` | Hub connection, `onNotificationCreated` / `offNotificationCreated` |
| `Header.jsx` | Connect при login; unread badge +1 на `NotificationCreated` |
| `NotificationsPage.jsx` | Prepend новой notification в список (без дубликатов по `id`) |

См. [10_FRONTEND_INTEGRATION.md](10_FRONTEND_INTEGRATION.md) — раздел Notifications.


---

<!-- merged from: 07_REALTIME_AND_DOMAIN_EVENTS.md -->

# Domain Events и Notifications

# 19. Domain Events and Notifications

---

## Зачем domain events в modular monolith

Прямой вызов `ContentService → NotificationService` создал бы **жёсткую связь** между модулями.  
Domain events позволяют:

- Content публикует `CommentCreatedEvent` — не знает про Notifications
- Notifications подписывается handler'ом — не знает детали Content
- При переходе к микросервисам event можно заменить на message broker

---

## IDomainEventPublisher

**Interface:** `Identity.Events.Contracts.Abstractions.IDomainEventPublisher`

```csharp
Task PublishAsync<TEvent>(TEvent domainEvent, CancellationToken ct = default) where TEvent : class;
```

**Implementation:** `InMemoryDomainEventPublisher` (`Identity.Events`)

- Resolves all `IDomainEventHandler<TEvent>` from DI
- Invokes sequentially in-process
- **Нет** outbox, **нет** retry, **нет** async queue

**Registration:** `Identity.DI/IdentityModuleServiceCollectionExtensions.cs`

---

## События (7 типов)

| Event | Module | Properties |
|-------|--------|------------|
| `UserRegisteredEvent` | Identity | UserId, UserName, Email, RegisteredAt |
| `CommentCreatedEvent` | Content | CommentId, PostId, PostAuthorUserId, CommentAuthorUserId, CreatedAt |
| `ReactionUpsertedEvent` | Content | ReactionId, PostId, PostAuthorUserId, ActorUserId, ReactionType, IsNewReaction, CreatedAt |
| `MentionAddedEvent` | Content | MentionId, PostId, PostAuthorUserId, MentionedUserId, ActorUserId, CreatedAt |
| `VacancyApplicationSubmittedEvent` | Jobs | ApplicationId, VacancyId, VacancyTitle, ApplicantUserId, PostedByUserId, AppliedAt |
| `ContactRequestSentEvent` | Network | ContactRequestId, SenderUserId, ReceiverUserId, CreatedAt |
| `ContactRequestAcceptedEvent` | Network | ContactRequestId, RequesterUserId, AccepterUserId, AcceptedAt |

---

## Где публикуются

| Service | Events |
|---------|--------|
| `UserService` | `UserRegisteredEvent` |
| `ExternalAuthService` | `UserRegisteredEvent` (new external users) |
| `CommentService` | `CommentCreatedEvent` |
| `ReactionService` | `ReactionUpsertedEvent` |
| `MentionService` | `MentionAddedEvent` |
| `JobApplicationService` | `VacancyApplicationSubmittedEvent` |
| `ContactService` | `ContactRequestSentEvent`, `ContactRequestAcceptedEvent` |

---

## Handlers (7)

| Handler | Event | Effect |
|---------|-------|--------|
| `CreateEmptyProfileWhenUserRegisteredHandler` | UserRegisteredEvent | Creates empty profile via `IProfileService` |
| `CreateNotificationOnCommentCreatedHandler` | CommentCreatedEvent | Notification `post_comment` (skip self) |
| `CreateNotificationOnReactionUpsertedHandler` | ReactionUpsertedEvent | Notification `post_reaction` (new only, skip self) |
| `CreateNotificationOnMentionAddedHandler` | MentionAddedEvent | Notification `post_mention` (skip self) |
| `CreateNotificationOnVacancyApplicationSubmittedHandler` | VacancyApplicationSubmittedEvent | Notification `job_application` (skip self-apply) |
| `CreateNotificationOnContactRequestSentHandler` | ContactRequestSentEvent | Notification `contact_request` |
| `CreateNotificationOnContactRequestAcceptedHandler` | ContactRequestAcceptedEvent | Notification `contact_request_accepted` |

### Notification types (domain events → DB + optional SignalR)

| Domain event | Notification `type` | Recipient |
|--------------|---------------------|-----------|
| `CommentCreatedEvent` | `post_comment` | Post author (not self-comment) |
| `ReactionUpsertedEvent` | `post_reaction` | Post author (new reaction only, not self) |
| `MentionAddedEvent` | `post_mention` | Mentioned user (not self) |
| `VacancyApplicationSubmittedEvent` | `job_application` | Vacancy `PostedBy` (not self-apply) |
| `ContactRequestSentEvent` | `contact_request` | Receiver |
| `ContactRequestAcceptedEvent` | `contact_request_accepted` | Requester |

После `NotificationService.CreateAsync` → `INotificationCreatedPublisher` → `NotificationCreated` в group `user:{userId}` для online clients.

**DI:** Profile.DI + Notifications.DI register handlers.

---

## Flow example: comment → notification

```
1. POST /api/content/posts/{id}/comments
2. CommentService saves comment
3. CommentService → PublishAsync(CommentCreatedEvent)
4. InMemoryDomainEventPublisher resolves handlers
5. CreateNotificationOnCommentCreatedHandler:
   - if commentAuthor != postAuthor
   - NotificationService.CreateAsync(type: post_comment, ...)
6. NotificationService → INotificationCreatedPublisher → SignalR NotificationCreated (user:{postAuthor})
7. Online recipient: Header badge + NotificationsPage без refresh
8. GET /api/notifications/me → new item (всегда, в т.ч. если был offline)
```

---

## Тесты: NoOpDomainEventPublisher

В тестах может использоваться stub/no-op publisher чтобы:
- Не создавать side effects (profiles, notifications)
- Изолировать unit under test

Проверить: `LinkedIn.Tests` — handlers не вызываются если publisher mocked.

---

## Pending events (не реализованы)

- `PostCreatedEvent`

---

## Почему лучше прямых вызовов

| Прямой вызов | Domain events |
|--------------|---------------|
| Content зависит от Notifications | Content знает только свой event contract |
| Circular dependency риск | One-way flow |
| Сложно тестировать | Mock publisher |
| Сложно extract microservice | Event → message queue |

На защите: «Мы используем in-process domain events как подготовку к event-driven architecture при декомпозиции на микросервисы».
