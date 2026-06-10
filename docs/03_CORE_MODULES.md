# 03. Core-модули

## Общий шаблон core

`Contracts + DataAccess + Services + Client.Contracts + Client + DI`  
Identity дополнительно имеет `Events + Events.Contracts`.

## Identity (`identity`)

- сервисы: `IAuthenticationService`, `IUserService`, `ITokenService`, `IExternalAuthService`, `IRoleService`, `IUserAdminService`
- клиент: `IIdentityClient` (`Users`, `Authentication`, `ExternalAuth`); admin-операции также через `IUserResource` (users/roles/stats)
- сущности: `ApplicationUser`, `RefreshToken` (+ ASP.NET Identity `AspNetRoles`, `AspNetUserRoles`)
- domain event: `UserRegisteredEvent`
- роли: `IdentityRoleNames.Admin`, `IdentityRoleNames.User`
- seed: `IdentityDataSeeder` (роли Admin/User), `AdminSeed` из конфигурации (первый admin только при настроенном Email/Password)
- регистрация: после `CreateAsync` пользователь получает роль `User` (при ошибке назначения роли — rollback через `DeleteAsync`)
- admin users: `IUserAdminService` — list/get/lock/unlock/soft delete/restore, filters (email, role, isDeleted, isLocked, sort), `RevokeAllUserTokensAsync` при lock/delete
- stats: `IdentityStatsDto` + `GetIdentityStatsAsync` (total/deleted/active users)
- JWT: `ClaimTypes.Role` для каждой роли пользователя (см. `05_API_AUTH_JWT.md`)

## Profile (`profile`)

- сервисы: `IProfileService`, `IMessageSettingsService`, `IProfileViewService`
- сущности: `UserProfile`, `MessageSettings`, `ProfileView`
- логика: пустой профиль создается через событие регистрации (fallback есть в flow `/api/profile/me`)

## Professional (`professional`)

- сущности: company/experience/education/certificate/skill/language/recommendation и связки
- сервисы: `ICompanyService`, `IExperienceService`, `IEducationService`, `ICertificateService`, `ISkillService`, `IUserSkillService`, `ILanguageService`, `IUserLanguageService`, `ICertificateSkillService`, `IRecommendedSkillByPositionService`, `IRecommendationService`

## Network (`network`)

- сущности: contacts, follows, blocked_users, user_groups, group_members, group_posts, pages, page_admins, page_followers
- `group_posts` привязывает group к postId; ownership поста оркестрируется facade-слоем через Content client

## Content (`content`)

- сущности: posts, media, post_media, comments, reactions, hashtags, post_hashtags, user_hashtag_follows, saved_posts, reposts, post_views, mentions
- ключевые правила: visibility, reaction upsert, repost_count, soft delete (`DeletedAt`)
- user delete поста: ownership по `UserId` (`IPostService.DeleteAsync`)
- platform admin: `GetAdminPostsAsync` (list incl. deleted, filters/sort), `AdminSoftDeletePostAsync` / `AdminRestorePostAsync` — без проверки владельца, отдельные методы
- stats: `ContentStatsDto` + `GetContentStatsAsync` (total/deleted/active posts)

## Messaging (`messaging`)

- сущности: chats, chat_members, messages, message_reads, message_media
- v1: без realtime

## Jobs (`jobs`)

- сущности: vacancies, user_vacancies_favorites, job_applications, job_search_queries, job_search_results, recommended_job_queries
- v1: company validation через Professional не реализована
- user delete вакансии: ownership по `PostedBy` (`IVacancyService.DeleteAsync`)
- platform admin: `GetAdminVacanciesAsync` (list incl. deleted, filters/sort), `AdminSoftDeleteVacancyAsync` / `AdminRestoreVacancyAsync` — без ownership; при admin delete/restore обновляется `UpdatedAt`
- **recommended job queries**: глобальный справочник; **write** (create/delete) только через Admin API; user API — только `GET /api/jobs/recommended-queries`
- stats: `JobsStatsDto` + `GetJobsStatsAsync` (vacancies + `TotalRecommendedJobQueries`)

## Notifications (`notifications`)

- сущности: notifications, user_activity
- notifications soft delete; user_activity append-only

## Events (`events`)

- сущности: events, event_attendees, event_schedule, event_speakers, event_speaker_map
- не путать с Identity domain events

## Связи между модулями

- через `I*Client` / `I*Resource`
- через `Identity.Events.Contracts` (регистрация → профиль)
- без прямых ссылок на чужой DataAccess
