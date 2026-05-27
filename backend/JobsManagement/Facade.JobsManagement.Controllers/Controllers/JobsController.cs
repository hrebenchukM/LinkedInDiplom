using System.Security.Claims;
using Facade.JobsManagement.Contracts.Requests.RecommendedQuery;
using Facade.JobsManagement.Contracts.Requests.SearchQuery;
using Facade.JobsManagement.Contracts.Requests.Vacancy;
using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.JobsManagement.Controllers.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private const string VacancyNotFoundError = "Vacancy not found.";
    private const string FavoriteNotFoundError = "Favorite not found.";
    private const string ApplicationNotFoundError = "Application not found.";
    private const string SearchQueryNotFoundError = "Search query not found.";
    private const string RecommendedQueryNotFoundError = "Recommended query not found.";

    private readonly IJobsManagementService _jobsManagementService;

    public JobsController(IJobsManagementService jobsManagementService)
    {
        _jobsManagementService = jobsManagementService;
    }

    [Authorize]
    [HttpPost("me/vacancies")]
    [ProducesResponseType(typeof(VacancyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateVacancy([FromBody] CreateVacancyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.CreateVacancyAsync(userId, request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("vacancies")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetVacancies([FromQuery] string? query, [FromQuery] string? location, [FromQuery] Guid? companyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var vacancies = await _jobsManagementService.GetVacanciesAsync(userId, query, location, companyId);
        return Ok(vacancies);
    }

    [Authorize]
    [HttpGet("vacancies/{vacancyId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetVacancyById(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var vacancy = await _jobsManagementService.GetVacancyByIdAsync(userId, vacancyId);
        if (vacancy is null)
            return NotFound();

        return Ok(vacancy);
    }

    [Authorize]
    [HttpPatch("me/vacancies/{vacancyId:guid}")]
    [ProducesResponseType(typeof(VacancyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateVacancy(Guid vacancyId, [FromBody] UpdateVacancyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.UpdateVacancyAsync(userId, vacancyId, request);
        if (!response.Success)
            return MapVacancyError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/vacancies/{vacancyId:guid}")]
    [ProducesResponseType(typeof(VacancyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteVacancy(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.DeleteVacancyAsync(userId, vacancyId);
        if (!response.Success)
            return MapVacancyError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpPost("me/favorites/{vacancyId:guid}")]
    [ProducesResponseType(typeof(UserVacancyFavoriteResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> AddFavorite(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.AddFavoriteAsync(userId, vacancyId);
        if (!response.Success)
            return MapFavoriteError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/favorites/{vacancyId:guid}")]
    [ProducesResponseType(typeof(UserVacancyFavoriteResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> RemoveFavorite(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.RemoveFavoriteAsync(userId, vacancyId);
        if (!response.Success)
            return MapFavoriteError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/favorites")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var favorites = await _jobsManagementService.GetMyFavoritesAsync(userId);
        return Ok(favorites);
    }

    [Authorize]
    [HttpPost("me/vacancies/{vacancyId:guid}/apply")]
    [ProducesResponseType(typeof(JobApplicationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> ApplyToVacancy(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.ApplyToVacancyAsync(userId, vacancyId);
        if (!response.Success)
            return MapApplicationError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/applications/{applicationId:guid}")]
    [ProducesResponseType(typeof(JobApplicationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> WithdrawApplication(Guid applicationId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.WithdrawApplicationAsync(userId, applicationId);
        if (!response.Success)
            return MapApplicationError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/applications")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyApplications()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var applications = await _jobsManagementService.GetMyApplicationsAsync(userId);
        return Ok(applications);
    }

    [Authorize]
    [HttpGet("me/vacancies/{vacancyId:guid}/applications")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetVacancyApplications(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var applications = await _jobsManagementService.GetVacancyApplicationsAsync(userId, vacancyId);
        if (applications is null)
            return NotFound();

        return Ok(applications);
    }

    [Authorize]
    [HttpPost("me/search-queries")]
    [ProducesResponseType(typeof(JobSearchQueryResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateSearchQuery([FromBody] CreateJobSearchQueryRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.CreateSearchQueryAsync(userId, request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/search-queries")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMySearchQueries()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var queries = await _jobsManagementService.GetMySearchQueriesAsync(userId);
        return Ok(queries);
    }

    [Authorize]
    [HttpGet("me/search-queries/{searchId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSearchQueryById(Guid searchId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var query = await _jobsManagementService.GetSearchQueryByIdAsync(userId, searchId);
        if (query is null)
            return NotFound();

        return Ok(query);
    }

    [Authorize]
    [HttpDelete("me/search-queries/{searchId:guid}")]
    [ProducesResponseType(typeof(JobSearchQueryResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteSearchQuery(Guid searchId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.DeleteSearchQueryAsync(userId, searchId);
        if (!response.Success)
            return MapSearchQueryError(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("me/search-queries/{searchId:guid}/results")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSearchResults(Guid searchId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var results = await _jobsManagementService.GetSearchResultsAsync(userId, searchId);
        if (results is null)
            return NotFound();

        return Ok(results);
    }

    [Authorize]
    [HttpPost("recommended-queries")]
    [ProducesResponseType(typeof(RecommendedJobQueryResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateRecommendedQuery([FromBody] CreateRecommendedJobQueryRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.CreateRecommendedQueryAsync(userId, request);
        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    [Authorize]
    [HttpGet("recommended-queries")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetRecommendedQueries()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var queries = await _jobsManagementService.GetRecommendedQueriesAsync(userId);
        return Ok(queries);
    }

    [Authorize]
    [HttpDelete("recommended-queries/{recommendedQueryId:guid}")]
    [ProducesResponseType(typeof(RecommendedJobQueryResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteRecommendedQuery(Guid recommendedQueryId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _jobsManagementService.DeleteRecommendedQueryAsync(userId, recommendedQueryId);
        if (!response.Success)
            return MapRecommendedQueryError(response);

        return Ok(response);
    }

    private IActionResult MapVacancyError(VacancyResponse response)
    {
        if (response.Errors.Contains(VacancyNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapFavoriteError(UserVacancyFavoriteResponse response)
    {
        if (response.Errors.Contains(VacancyNotFoundError) || response.Errors.Contains(FavoriteNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapApplicationError(JobApplicationResponse response)
    {
        if (response.Errors.Contains(VacancyNotFoundError) || response.Errors.Contains(ApplicationNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapSearchQueryError(JobSearchQueryResponse response)
    {
        if (response.Errors.Contains(SearchQueryNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private IActionResult MapRecommendedQueryError(RecommendedJobQueryResponse response)
    {
        if (response.Errors.Contains(RecommendedQueryNotFoundError))
            return NotFound(response);

        return BadRequest(response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }
}
