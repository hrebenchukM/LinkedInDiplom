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
}
