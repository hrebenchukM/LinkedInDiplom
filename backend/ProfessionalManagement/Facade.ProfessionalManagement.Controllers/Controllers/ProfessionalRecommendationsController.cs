using Facade.ProfessionalManagement.Contracts.Requests.Recommendation;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalRecommendationsController : ProfessionalManagementControllerBase
{
    public ProfessionalRecommendationsController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
    }

    // GET api/professional/users/{userId}/recommendations
    [HttpGet("users/{userId}/recommendations")]
    [ProducesResponseType(200)]
    public async Task<IActionResult> GetRecommendationsForUser(string userId)
    {
        var recommendations = await ProfessionalService.GetRecommendationsForUserAsync(userId);

        return Ok(recommendations);
    }

    // GET api/professional/recommendations/{recommendationId}
    [HttpGet("recommendations/{recommendationId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetRecommendationById(Guid recommendationId)
    {
        var recommendation = await ProfessionalService.GetRecommendationByIdAsync(recommendationId);

        if (recommendation == null)
            return NotFound();

        return Ok(recommendation);
    }

    // POST api/professional/recommendations
    [Authorize]
    [HttpPost("recommendations")]
    [ProducesResponseType(typeof(RecommendationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateRecommendation(
        [FromBody] CreateRecommendationRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var authorId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(authorId))
            return Unauthorized();

        var response = await ProfessionalService.CreateRecommendationAsync(
            authorId,
            request);

        if (!response.Success)
            return MapRecommendationError(response);

        return Ok(response);
    }

    // PATCH api/professional/recommendations/{recommendationId}
    [Authorize]
    [HttpPatch("recommendations/{recommendationId:guid}")]
    [ProducesResponseType(typeof(RecommendationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchRecommendation(
        Guid recommendationId,
        [FromBody] PatchRecommendationRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var authorId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(authorId))
            return Unauthorized();

        var response = await ProfessionalService.PatchRecommendationAsync(
            authorId,
            recommendationId,
            request);

        if (!response.Success)
            return MapRecommendationError(response);

        return Ok(response);
    }

    // DELETE api/professional/recommendations/{recommendationId}
    [Authorize]
    [HttpDelete("recommendations/{recommendationId:guid}")]
    [ProducesResponseType(typeof(RecommendationResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteRecommendation(Guid recommendationId)
    {
        var authorId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(authorId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteRecommendationAsync(
            authorId,
            recommendationId);

        if (!response.Success)
            return MapRecommendationError(response);

        return Ok(response);
    }
}
