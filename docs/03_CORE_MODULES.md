# 03. Core-модули

## Общий шаблон core

`Contracts + DataAccess + Services + Client.Contracts + Client + DI`  
Identity дополнительно имеет `Events + Events.Contracts`.

## Identity (`identity`)

- сервисы: `IAuthenticationService`, `IUserService`, `ITokenService`, `IExternalAuthService`
- клиент: `IIdentityClient` (`Users`, `Authentication`, `ExternalAuth`)
- сущности: `ApplicationUser`, `RefreshToken`
- domain event: `UserRegisteredEvent`

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
- ключевые правила: visibility, reaction upsert, repost_count, soft delete

## Messaging (`messaging`)

- сущности: chats, chat_members, messages, message_reads, message_media
- v1: без realtime

## Jobs (`jobs`)

- сущности: vacancies, user_vacancies_favorites, job_applications, job_search_queries, job_search_results, recommended_job_queries
- v1: company validation через Professional не реализована

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
