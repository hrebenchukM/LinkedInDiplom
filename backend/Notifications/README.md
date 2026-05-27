# Notifications Module

Notifications is a core module of the LinkedIn Clone **modular monolith prepared for microservices**.  
Target framework: **`net8.0`**.

## Overview

- Module schema: **`notifications`**
- Initial migration: **`AddNotificationsModule`**
- Core scope:
  - `notifications`
  - `user_activity`

## Architecture

Notifications follows the standard core-module structure:

- `Notifications.Contracts`
- `Notifications.DataAccess`
- `Notifications.Services`
- `Notifications.Client.Contracts`
- `Notifications.Client`
- `Notifications.DI`

## DataAccess

`NotificationsDbContext` is configured with default schema `notifications` and includes:

- `Notifications`
- `UserActivities`

Migration history for this module is stored in `notifications.__EFMigrationsHistory`.

## Services and Resources

Implemented services/resources:

- `NotificationService` / `NotificationResource`
- `UserActivityService` / `UserActivityResource`

## INotificationsClient

`INotificationsClient` exposes:

- `Notifications`
- `UserActivity`

## Facade Endpoints (`/api/notifications`)

### Notifications

- `GET /api/notifications/me`
- `GET /api/notifications/me/{notificationId}`
- `PATCH /api/notifications/me/{notificationId}/read`
- `PATCH /api/notifications/me/read-all`
- `DELETE /api/notifications/me/{notificationId}`

### User activity

- `POST /api/notifications/me/activity`
- `GET /api/notifications/me/activity`

## Security and Behavior Rules

- All notifications endpoints require JWT.
- `userId` is taken only from JWT claims (`NameIdentifier` / `sub`).
- Request body never carries current user id.
- User sees only own `notifications` rows.
- Mark-read and delete are allowed only for notification owner.
- Delete notification is soft delete (`deleted_at`).
- Mark-read is idempotent.
- Mark-all-read succeeds even when there are 0 unread rows.
- `user_activity` is append-only in v1.
- List GET endpoints may return `200` + empty array.
- Single-resource endpoints and mutations return `404` for foreign/inaccessible records.
- Public `POST /api/notifications` is intentionally not added in facade v1.
- Notification creation remains available through core/client for future cross-module calls.
- SignalR/WebSocket and real-time delivery are not implemented in v1.
