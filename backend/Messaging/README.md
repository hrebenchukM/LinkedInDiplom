# Messaging Module

Messaging is a core module of the LinkedIn Clone **modular monolith prepared for microservices**.  
Target framework: **`net8.0`**.

## Overview

- Module schema: **`messaging`**
- Initial migration: **`AddMessagingModule`**
- Core scope:
  - `chats`
  - `chat_members`
  - `messages`
  - `message_reads`
  - `message_media`

## Architecture

Messaging follows the standard core-module structure:

- `Messaging.Contracts`
- `Messaging.DataAccess`
- `Messaging.Services`
- `Messaging.Client.Contracts`
- `Messaging.Client`
- `Messaging.DI`

## DataAccess

`MessagingDbContext` is configured with default schema `messaging` and includes:

- `Chats`
- `ChatMembers`
- `Messages`
- `MessageReads`
- `MessageMedia`

Migration history for this module is stored in `messaging.__EFMigrationsHistory`.

## Services and Resources

Implemented services/resources:

- `ChatService` / `ChatResource`
- `ChatMemberService` / `ChatMemberResource`
- `MessageService` / `MessageResource`
- `MessageReadService` / `MessageReadResource`
- `MessageMediaService` / `MessageMediaResource`

## IMessagingClient

`IMessagingClient` exposes:

- `Chats`
- `ChatMembers`
- `Messages`
- `MessageReads`
- `MessageMedia`

## Facade Endpoints (`/api/messaging`)

### Chats

- `POST /api/messaging/me/chats`
- `GET /api/messaging/me/chats`
- `GET /api/messaging/me/chats/{chatId}`
- `DELETE /api/messaging/me/chats/{chatId}`

### Members

- `POST /api/messaging/me/chats/{chatId}/join`
- `DELETE /api/messaging/me/chats/{chatId}/membership`
- `GET /api/messaging/me/chats/{chatId}/members`

### Messages

- `POST /api/messaging/me/chats/{chatId}/messages`
- `GET /api/messaging/me/chats/{chatId}/messages`
- `GET /api/messaging/me/messages/{messageId}`
- `PATCH /api/messaging/me/messages/{messageId}`
- `DELETE /api/messaging/me/messages/{messageId}`

### Reads

- `POST /api/messaging/me/messages/{messageId}/read`
- `GET /api/messaging/me/messages/{messageId}/reads`

### Message media

- `POST /api/messaging/me/messages/{messageId}/media`
- `GET /api/messaging/me/messages/{messageId}/media`
- `DELETE /api/messaging/me/messages/{messageId}/media/{messageMediaId}`

## Security and Behavior Rules

- All messaging endpoints require JWT.
- `userId` is taken only from JWT claims (`NameIdentifier` / `sub`).
- Request body never carries current user id.
- User sees only own active chats (active membership, active chat).
- Sending a message is allowed only for active chat members.
- Edit/delete message is allowed only for the sender.
- Mark-read is allowed only for active chat members.
- Message read is idempotent.
- Message media attach is allowed only for the message sender.
- Message media stores only URL/reference metadata (no blob in DB).
- Foreign/inaccessible chats or messages return `404`.
- SignalR/WebSocket and real-time delivery are not implemented yet.
