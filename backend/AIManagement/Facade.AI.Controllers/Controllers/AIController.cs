using System.Security.Claims;
using Facade.AI.Contracts.Responses;
using Facade.AI.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AI.Controllers.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIManagementService _aiService;

    public AIController(IAIManagementService aiService)
    {
        _aiService = aiService;
    }

    [HttpGet("recommended-jobs")]
    [ProducesResponseType(typeof(RecommendedJobsResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetRecommendedJobs()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _aiService.GetRecommendedJobsAsync(userId);
        return Ok(response);
    }

    [HttpGet("career-advice")]
    [ProducesResponseType(typeof(CareerAdviceResponse), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetCareerAdvice()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _aiService.GetCareerAdviceAsync(userId);
        return Ok(response);
    }
}
