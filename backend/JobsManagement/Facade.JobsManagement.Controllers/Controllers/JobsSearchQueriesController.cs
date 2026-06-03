using Facade.JobsManagement.Contracts.Requests.SearchQuery;
using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.JobsManagement.Controllers.Controllers;

public class JobsSearchQueriesController : JobsManagementControllerBase
{
    public JobsSearchQueriesController(IJobsManagementService jobsManagementService)
        : base(jobsManagementService)
    {
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

        var response = await JobsService.CreateSearchQueryAsync(userId, request);
        if (!response.Success)
            return MapSearchQueryError(response);

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

        var queries = await JobsService.GetMySearchQueriesAsync(userId);
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

        var query = await JobsService.GetSearchQueryByIdAsync(userId, searchId);
        if (query is null)
            return NotFoundError(SearchQueryNotFoundError);

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

        var response = await JobsService.DeleteSearchQueryAsync(userId, searchId);
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

        var results = await JobsService.GetSearchResultsAsync(userId, searchId);
        if (results is null)
            return NotFoundError(SearchQueryNotFoundError);

        return Ok(results);
    }
}
