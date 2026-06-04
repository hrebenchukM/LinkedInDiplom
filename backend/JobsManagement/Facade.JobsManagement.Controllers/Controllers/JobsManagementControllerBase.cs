using System.Security.Claims;
using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace Facade.JobsManagement.Controllers.Controllers;

[ApiController]
[Route("api/jobs")]
/// <summary>
/// Базовый controller facade-слоя Jobs.
/// Хранит общую инфраструктурную логику API, а не бизнес-правила вакансий.
/// </summary>
public abstract class JobsManagementControllerBase : ControllerBase
{
    protected const string VacancyNotFoundError = "Vacancy not found.";
    protected const string FavoriteNotFoundError = "Favorite not found.";
    protected const string ApplicationNotFoundError = "Application not found.";
    protected const string SearchQueryNotFoundError = "Search query not found.";
    protected const string RecommendedQueryNotFoundError = "Recommended query not found.";

    protected IJobsManagementService JobsService { get; }

    protected JobsManagementControllerBase(IJobsManagementService jobsManagementService)
    {
        JobsService = jobsManagementService;
    }

    private static readonly HashSet<string> VacancyNotFoundErrors = new(StringComparer.Ordinal)
    {
        VacancyNotFoundError
    };

    private static readonly HashSet<string> FavoriteNotFoundErrors = new(StringComparer.Ordinal)
    {
        VacancyNotFoundError,
        FavoriteNotFoundError
    };

    private static readonly HashSet<string> ApplicationNotFoundErrors = new(StringComparer.Ordinal)
    {
        VacancyNotFoundError,
        ApplicationNotFoundError
    };

    private static readonly HashSet<string> SearchQueryNotFoundErrors = new(StringComparer.Ordinal)
    {
        SearchQueryNotFoundError
    };

    private static readonly HashSet<string> RecommendedQueryNotFoundErrors = new(StringComparer.Ordinal)
    {
        RecommendedQueryNotFoundError
    };

    protected IActionResult MapVacancyError(VacancyResponse response) =>
        MapErrors(response, response.Errors, VacancyNotFoundErrors);

    protected IActionResult MapFavoriteError(UserVacancyFavoriteResponse response) =>
        MapErrors(response, response.Errors, FavoriteNotFoundErrors);

    protected IActionResult MapApplicationError(JobApplicationResponse response) =>
        MapErrors(response, response.Errors, ApplicationNotFoundErrors);

    protected IActionResult MapSearchQueryError(JobSearchQueryResponse response) =>
        MapErrors(response, response.Errors, SearchQueryNotFoundErrors);

    protected IActionResult MapRecommendedQueryError(RecommendedJobQueryResponse response) =>
        MapErrors(response, response.Errors, RecommendedQueryNotFoundErrors);

    protected string? GetCurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? User.FindFirstValue("sub");

    protected IActionResult MapErrors<TResponse>(
        TResponse response,
        IEnumerable<string> errors,
        IReadOnlySet<string> notFoundErrors)
    {
        if (errors.Any(notFoundErrors.Contains))
            return new NotFoundObjectResult(response);

        return new BadRequestObjectResult(response);
    }
}
