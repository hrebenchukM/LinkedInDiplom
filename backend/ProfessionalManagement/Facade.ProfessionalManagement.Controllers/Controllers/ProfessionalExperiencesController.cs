using Facade.ProfessionalManagement.Contracts.Requests.Experience;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalExperiencesController : ProfessionalManagementControllerBase
{
    public ProfessionalExperiencesController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
    }

    [Authorize]
    [HttpGet("me/experiences")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyExperiences()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await ProfessionalService.GetMyExperiencesAsync(userId);

        return Ok(items);
    }

    [Authorize]
    [HttpGet("me/experiences/{experienceId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyExperienceById(Guid experienceId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var item = await ProfessionalService.GetMyExperienceByIdAsync(
            userId,
            experienceId);

        if (item == null)
        {
            return NotFoundError(ExperienceNotFoundError);
        }

        return Ok(item);
    }

    [Authorize]
    [HttpPost("me/experiences")]
    [ProducesResponseType(typeof(ExperienceResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMyExperience([FromBody] CreateExperienceRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ProfessionalService.CreateMyExperienceAsync(
            userId,
            request);

        if (!response.Success)
        {
            return MapExperienceError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpPut("me/experiences/{experienceId:guid}")]
    [ProducesResponseType(typeof(ExperienceResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateMyExperience(
        Guid experienceId,
        [FromBody] UpdateExperienceRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ProfessionalService.UpdateMyExperienceAsync(
            userId,
            experienceId,
            request);

        if (!response.Success)
        {
            return MapExperienceError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpPatch("me/experiences/{experienceId:guid}")]
    [ProducesResponseType(typeof(ExperienceResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchMyExperience(
        Guid experienceId,
        [FromBody] PatchExperienceRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ProfessionalService.PatchMyExperienceAsync(
            userId,
            experienceId,
            request);

        if (!response.Success)
        {
            return MapExperienceError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/experiences/{experienceId:guid}")]
    [ProducesResponseType(typeof(ExperienceResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyExperience(Guid experienceId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await ProfessionalService.DeleteMyExperienceAsync(
            userId,
            experienceId);

        if (!response.Success)
        {
            return MapExperienceError(response);
        }

        return Ok(response);
    }
}
