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

См. [api/POSTMAN_TESTING.md](api/POSTMAN_TESTING.md) — раздел «Messaging SignalR manual testing».

---

## Ограничения v1

- Один instance — без Redis backplane events не cross-node
- Нет typing indicators, online presence
- Нет notification hub (только messaging)
- Token refresh во время active connection — reconnect manually
