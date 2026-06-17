

---

<!-- merged from: 07_REALTIME_AND_DOMAIN_EVENTS.md -->

# SignalR / Realtime Chat

# 18. SignalR / Realtime Chat

---

## Статус

| Компонент | Статус |
|-----------|--------|
| SignalR Hub | **Реализован** |
| Server push events | **Реализованы** (5 типов) |
| HTTP Messaging API | **Primary flow** (создание сообщений через REST) |
| Frontend integration | **Pending** |
| Redis backplane / scale-out | **Не реализовано** |

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

## Ограничения v1

- Один instance — без Redis backplane events не cross-node
- Нет typing indicators, online presence
- Нет notification hub (только messaging)
- Token refresh во время active connection — reconnect manually


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

## События (5 типов)

| Event | Module | Properties |
|-------|--------|------------|
| `UserRegisteredEvent` | Identity | UserId, UserName, Email, RegisteredAt |
| `CommentCreatedEvent` | Content | CommentId, PostId, PostAuthorUserId, CommentAuthorUserId, CreatedAt |
| `ReactionUpsertedEvent` | Content | ReactionId, PostId, PostAuthorUserId, ActorUserId, ReactionType, IsNewReaction, CreatedAt |
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
| `ContactService` | `ContactRequestSentEvent`, `ContactRequestAcceptedEvent` |

---

## Handlers (5)

| Handler | Event | Effect |
|---------|-------|--------|
| `CreateEmptyProfileWhenUserRegisteredHandler` | UserRegisteredEvent | Creates empty profile via `IProfileService` |
| `CreateNotificationOnCommentCreatedHandler` | CommentCreatedEvent | Notification `post_comment` (skip self) |
| `CreateNotificationOnReactionUpsertedHandler` | ReactionUpsertedEvent | Notification `post_reaction` (new only, skip self) |
| `CreateNotificationOnContactRequestSentHandler` | ContactRequestSentEvent | Notification `contact_request` |
| `CreateNotificationOnContactRequestAcceptedHandler` | ContactRequestAcceptedEvent | Notification `contact_request_accepted` |

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
6. GET /api/notifications/me → new item
```

---

## Тесты: NoOpDomainEventPublisher

В тестах может использоваться stub/no-op publisher чтобы:
- Не создавать side effects (profiles, notifications)
- Изолировать unit under test

Проверить: `LinkedIn.Tests` — handlers не вызываются если publisher mocked.

---

## Pending events (не реализованы)

- `MentionAddedEvent`
- `VacancyApplicationSubmittedEvent`
- `PostCreatedEvent`
- Realtime notification push via SignalR

---

## Почему лучше прямых вызовов

| Прямой вызов | Domain events |
|--------------|---------------|
| Content зависит от Notifications | Content знает только свой event contract |
| Circular dependency риск | One-way flow |
| Сложно тестировать | Mock publisher |
| Сложно extract microservice | Event → message queue |

На защите: «Мы используем in-process domain events как подготовку к event-driven architecture при декомпозиции на микросервисы».
