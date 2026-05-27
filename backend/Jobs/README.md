# Jobs Module

Jobs is a core module of the LinkedIn Clone **modular monolith prepared for microservices**.  
Target framework: **`net8.0`**.

## Overview

- Module schema: **`jobs`**
- Initial migration: **`AddJobsModule`**
- Core scope:
  - `vacancies`
  - `user_vacancies_favorites`
  - `job_applications`
  - `job_search_queries`
  - `job_search_results`
  - `recommended_job_queries`

## Architecture

Jobs follows the standard core-module structure:

- `Jobs.Contracts`
- `Jobs.DataAccess`
- `Jobs.Services`
- `Jobs.Client.Contracts`
- `Jobs.Client`
- `Jobs.DI`

## DataAccess

`JobsDbContext` is configured with default schema `jobs` and includes:

- `Vacancies`
- `UserVacancyFavorites`
- `JobApplications`
- `JobSearchQueries`
- `JobSearchResults`
- `RecommendedJobQueries`

Migration history for this module is stored in `jobs.__EFMigrationsHistory`.

## Services and Resources

Implemented services/resources:

- `VacancyService` / `VacancyResource`
- `UserVacancyFavoriteService` / `UserVacancyFavoriteResource`
- `JobApplicationService` / `JobApplicationResource`
- `JobSearchQueryService` / `JobSearchQueryResource`
- `JobSearchResultService` / `JobSearchResultResource`
- `RecommendedJobQueryService` / `RecommendedJobQueryResource`

## IJobsClient

`IJobsClient` exposes:

- `Vacancies`
- `Favorites`
- `Applications`
- `SearchQueries`
- `SearchResults`
- `RecommendedQueries`

## Facade Endpoints (`/api/jobs`)

### Vacancies

- `POST /api/jobs/me/vacancies`
- `GET /api/jobs/vacancies`
- `GET /api/jobs/vacancies/{vacancyId}`
- `PATCH /api/jobs/me/vacancies/{vacancyId}`
- `DELETE /api/jobs/me/vacancies/{vacancyId}`

### Favorites

- `POST /api/jobs/me/favorites/{vacancyId}`
- `DELETE /api/jobs/me/favorites/{vacancyId}`
- `GET /api/jobs/me/favorites`

### Applications

- `POST /api/jobs/me/vacancies/{vacancyId}/apply`
- `DELETE /api/jobs/me/applications/{applicationId}`
- `GET /api/jobs/me/applications`
- `GET /api/jobs/me/vacancies/{vacancyId}/applications`

### Search queries/results

- `POST /api/jobs/me/search-queries`
- `GET /api/jobs/me/search-queries`
- `GET /api/jobs/me/search-queries/{searchId}`
- `DELETE /api/jobs/me/search-queries/{searchId}`
- `GET /api/jobs/me/search-queries/{searchId}/results`

### Recommended queries

- `POST /api/jobs/recommended-queries`
- `GET /api/jobs/recommended-queries`
- `DELETE /api/jobs/recommended-queries/{recommendedQueryId}`

## Security and Behavior Rules

- All jobs endpoints require JWT.
- `userId` is taken only from JWT claims (`NameIdentifier` / `sub`).
- Request body never carries current user id.
- Vacancy create/update/delete is owner-only (`PostedBy` == current JWT user).
- `CompanyId` in v1 comes from request body; no Company service validation yet.
- Favorite/apply actions are done by current JWT user only.
- Duplicate active favorite/application returns `400`.
- Applying to own vacancy is forbidden (`400`).
- Search queries belong to current user only.
- Search results are scoped to search queries owned by current user.
- Recommended queries in v1 are JWT-only (no admin role check yet).
- Foreign/inaccessible records return `404`:
  - `Vacancy not found.`
  - `Favorite not found.`
  - `Application not found.`
  - `Search query not found.`
  - `Recommended query not found.`
