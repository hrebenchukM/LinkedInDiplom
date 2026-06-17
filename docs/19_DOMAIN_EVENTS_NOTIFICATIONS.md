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
