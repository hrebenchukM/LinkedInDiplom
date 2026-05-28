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

    // GET api/professional/me/experiences
    [Authorize]
    [HttpGet("me/experiences")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyExperiences()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var experiences = await ProfessionalService.GetMyExperiencesAsync(userId);

        return Ok(experiences);
    }

    // GET api/professional/me/experiences/{experienceId}
    [Authorize]
    [HttpGet("me/experiences/{experienceId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyExperienceById(Guid experienceId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var experience = await ProfessionalService.GetMyExperienceByIdAsync(
            userId,
            experienceId);

        if (experience == null)
            return NotFound();

        return Ok(experience);
    }

    // POST api/professional/me/experiences
    [Authorize]
    [HttpPost("me/experiences")]
    [ProducesResponseType(typeof(ExperienceResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMyExperience([FromBody] CreateExperienceRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateMyExperienceAsync(
            userId,
            request);

        if (!response.Success)
            return MapExperienceError(response);

        return Ok(response);
    }

    // PUT api/professional/me/experiences/{experienceId}
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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.UpdateMyExperienceAsync(
            userId,
            experienceId,
            request);

        if (!response.Success)
            return MapExperienceError(response);

        return Ok(response);
    }

    // PATCH api/professional/me/experiences/{experienceId}
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
            return Unauthorized();

        var response = await ProfessionalService.PatchMyExperienceAsync(
            userId,
            experienceId,
            request);

        if (!response.Success)
            return MapExperienceError(response);

        return Ok(response);
    }

    // DELETE api/professional/me/experiences/{experienceId}
    [Authorize]
    [HttpDelete("me/experiences/{experienceId:guid}")]
    [ProducesResponseType(typeof(ExperienceResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyExperience(Guid experienceId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteMyExperienceAsync(
            userId,
            experienceId);

        if (!response.Success)
            return MapExperienceError(response);

        return Ok(response);
    }
}
