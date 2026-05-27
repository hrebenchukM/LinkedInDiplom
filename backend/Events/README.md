# Events Module

Events is a core module of the LinkedIn Clone **modular monolith prepared for microservices**.  
Target framework: **`net8.0`**.

## Overview

- Module schema: **`events`**
- Initial migration: **`AddEventsModule`**
- Core scope:
  - `events`
  - `event_attendees`
  - `event_schedule`
  - `event_speakers`
  - `event_speaker_map`

## Architecture

Events follows the standard core-module structure:

- `Events.Contracts`
- `Events.DataAccess`
- `Events.Services`
- `Events.Client.Contracts`
- `Events.Client`
- `Events.DI`

Facade layer (BFF):

- `Facade.EventsManagement.Contracts`
- `Facade.EventsManagement.Services`
- `Facade.EventsManagement.Controllers`
- `Facade.EventsManagement.DI`

## DataAccess

`EventsDbContext` is configured with default schema `events` and includes:

- `Events`
- `EventAttendees`
- `EventSchedule`
- `EventSpeakers`
- `EventSpeakerMaps`

Migration history for this module is stored in `events.__EFMigrationsHistory`.

EF Core does not define navigation properties or FK constraints to Identity/Profile/Company in v1 (`organizer_id`, `user_id` are stored as strings).

## Services and Resources

Implemented services/resources:

- `EventService` / `EventResource`
- `EventAttendeeService` / `EventAttendeeResource`
- `EventScheduleService` / `EventScheduleResource`
- `EventSpeakerService` / `EventSpeakerResource`
- `EventSpeakerMapService` / `EventSpeakerMapResource`

## IEventsClient

`IEventsClient` exposes:

- `Events`
- `Attendees`
- `Schedule`
- `Speakers`
- `SpeakerMap`

## Facade Endpoints (`/api/events`)

### Events

- `POST /api/events/me`
- `GET /api/events/me`
- `GET /api/events/{eventId}`
- `PATCH /api/events/me/{eventId}`
- `DELETE /api/events/me/{eventId}`

### Attendees

- `POST /api/events/me/{eventId}/join`
- `DELETE /api/events/me/{eventId}/attendance`
- `GET /api/events/{eventId}/attendees`

### Schedule

- `POST /api/events/me/{eventId}/schedule`
- `GET /api/events/{eventId}/schedule`
- `PATCH /api/events/me/{eventId}/schedule/{scheduleId}`
- `DELETE /api/events/me/{eventId}/schedule/{scheduleId}`

### Speakers

- `POST /api/events/me/speakers`
- `GET /api/events/me/speakers/{speakerId}`
- `PATCH /api/events/me/speakers/{speakerId}`
- `DELETE /api/events/me/speakers/{speakerId}`

### Speaker map

- `POST /api/events/me/{eventId}/speakers`
- `DELETE /api/events/me/{eventId}/speakers/{speakerId}`
- `GET /api/events/{eventId}/speakers`

## Security and Behavior Rules

- All events endpoints require JWT.
- `userId` is taken only from JWT claims (`NameIdentifier` / `sub`).
- Request body never carries current user id.
- `OrganizerId` is set from JWT on the facade layer.
- `OrganizerType` comes from create/update event request body.
- Event owner in v1: `OrganizerId == current userId`.
- Create/update/delete event — owner-only.
- Join/leave attendee — current user only.
- Duplicate active attendee returns `400` (`Already joined this event.`).
- Leave attendee is soft delete (`deleted_at`, status `left`).
- Schedule create/update/delete — event owner-only.
- Speaker create/update/delete — JWT-only in v1 (no separate speaker ownership model).
- Speaker map attach/detach — event owner-only.
- Duplicate speaker map returns `400` (`Speaker already attached to event.`).
- Foreign/inaccessible single-resource and mutation endpoints return `404` (`Event not found.`, `Event attendee not found.`, `Schedule item not found.`, `Speaker not found.`, `Event speaker not found.`).
- Other business validation errors return `400`.
- List GET endpoints may return `200` + empty array when the event does not exist or has no accessible rows.
- Cross-module integrations with Notifications, Content, and Network are **not** implemented in v1.

## Host Integration

Registered in `Facade.API` via:

- `AddEventsModule(configuration, connectionString)`
- `AddEventsManagementFacade()`
- `AddApplicationPart(typeof(EventsController).Assembly)`

Startup migration order includes `EventsDbContext` after Notifications.
