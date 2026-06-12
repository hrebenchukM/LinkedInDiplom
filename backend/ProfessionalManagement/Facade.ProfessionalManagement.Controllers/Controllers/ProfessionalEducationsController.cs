using Facade.ProfessionalManagement.Contracts.Requests.Education;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalEducationsController : ProfessionalManagementControllerBase
{
    public ProfessionalEducationsController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
    }

    // GET api/professional/users/{userId}/educations
    [HttpGet("users/{userId}/educations")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetUserEducations(string userId)
    {
        if (string.IsNullOrWhiteSpace(userId))
        {
            return BadRequest(new { success = false, errors = new[] { "UserId is required." } });
        }

        var educations = await ProfessionalService.GetUserEducationsAsync(userId);

        if (educations is null)
        {
            return NotFoundError(UserProfileNotFoundError);
        }

        return Ok(educations);
    }

    // GET api/professional/me/educations
    [Authorize]
    [HttpGet("me/educations")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyEducations()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var educations = await ProfessionalService.GetMyEducationsAsync(userId);

        return Ok(educations);
    }

    // GET api/professional/me/educations/{educationId}
    [Authorize]
    [HttpGet("me/educations/{educationId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyEducationById(Guid educationId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var education = await ProfessionalService.GetMyEducationByIdAsync(
            userId,
            educationId);

        if (education == null)
            return NotFoundError(EducationNotFoundError);

        return Ok(education);
    }

    // POST api/professional/me/educations
    [Authorize]
    [HttpPost("me/educations")]
    [ProducesResponseType(typeof(EducationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMyEducation([FromBody] CreateEducationRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateMyEducationAsync(
            userId,
            request);

        if (!response.Success)
            return MapEducationError(response);

        return Ok(response);
    }

    // PUT api/professional/me/educations/{educationId}
    [Authorize]
    [HttpPut("me/educations/{educationId:guid}")]
    [ProducesResponseType(typeof(EducationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateMyEducation(
        Guid educationId,
        [FromBody] UpdateEducationRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.UpdateMyEducationAsync(
            userId,
            educationId,
            request);

        if (!response.Success)
            return MapEducationError(response);

        return Ok(response);
    }

    // PATCH api/professional/me/educations/{educationId}
    [Authorize]
    [HttpPatch("me/educations/{educationId:guid}")]
    [ProducesResponseType(typeof(EducationResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchMyEducation(
        Guid educationId,
        [FromBody] PatchEducationRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.PatchMyEducationAsync(
            userId,
            educationId,
            request);

        if (!response.Success)
            return MapEducationError(response);

        return Ok(response);
    }

    // DELETE api/professional/me/educations/{educationId}
    [Authorize]
    [HttpDelete("me/educations/{educationId:guid}")]
    [ProducesResponseType(typeof(EducationResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyEducation(Guid educationId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteMyEducationAsync(
            userId,
            educationId);

        if (!response.Success)
            return MapEducationError(response);

        return Ok(response);
    }
}
