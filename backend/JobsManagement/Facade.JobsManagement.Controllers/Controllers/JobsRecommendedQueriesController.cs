using Facade.JobsManagement.Contracts.Requests.RecommendedQuery;
using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.JobsManagement.Controllers.Controllers;

public class JobsRecommendedQueriesController : JobsManagementControllerBase
{
    public JobsRecommendedQueriesController(IJobsManagementService jobsManagementService)
        : base(jobsManagementService)
    {
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

        var response = await JobsService.CreateRecommendedQueryAsync(userId, request);
        if (!response.Success)
            return MapRecommendedQueryError(response);

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

        var queries = await JobsService.GetRecommendedQueriesAsync(userId);
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

        var response = await JobsService.DeleteRecommendedQueryAsync(userId, recommendedQueryId);
        if (!response.Success)
            return MapRecommendedQueryError(response);

        return Ok(response);
    }
}
