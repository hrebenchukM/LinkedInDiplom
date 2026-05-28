# 04. Facade-модули (BFF)

## Общий шаблон facade

- `Facade.*.Contracts`
- `Facade.*.Services`
- `Facade.*.Controllers`
- `Facade.*.DI`

Controllers лежат только в facade.

## AccountManagement (`/api/auth`)

- сервис: `IAccountManagementService` → `IIdentityClient`
- controller: `AccountController`
- endpoints: register/login/google/facebook/refresh/logout/me
- особенность: не использует base `*ManagementControllerBase`, отличается error mapping

## ProfileManagement (`/api/profile`)

- controllers: profiles, message settings, views, media
- сервис: `IProfileManagementService` → `IProfileClient`
- uploads avatar/header и раздача `/uploads`

## ProfessionalManagement (`/api/professional`)

- controllers: experiences/companies/academies/educations/certificates/skills/languages/recommendations
- сервис: `IProfessionalManagementService` → `IProfessionalClient`

## NetworkManagement (`/api/network`)

- controllers: contacts/follows/blocked/groups/group members/group posts/pages/page admins/page followers
- сервис: `INetworkManagementService` → `INetworkClient`
- orchestration с `IContentClient` для group posts

## ContentManagement (`/api/content`)

- controllers: posts/media/comments/reactions/hashtags/saved/reposts/views/mentions
- сервис: `IContentManagementService` → `IContentClient`

## MessagingManagement (`/api/messaging`)

- controllers: chats/chat members/messages/message reads/message media
- сервис: `IMessagingManagementService` → `IMessagingClient`

## JobsManagement (`/api/jobs`)

- controllers: vacancies/favorites/applications/search queries/recommended queries
- сервис: `IJobsManagementService` → `IJobsClient`

## NotificationsManagement (`/api/notifications`)

- controllers: notifications items, user activity
- сервис: `INotificationsManagementService` → `INotificationsClient`

## EventsManagement (`/api/events`)

- controllers: events/attendees/schedule/speakers/event-speakers
- сервис: `IEventsManagementService` → `IEventsClient`

## Общие правила facade

- JWT current user берется из claims, не из body
- validation через DataAnnotations + ModelState
- ошибки: MapErrors (404 vs 400) для большинства CRUD фасадов
- business logic остается в core services
