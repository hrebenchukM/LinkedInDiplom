using Facade.ProfessionalManagement.Contracts.Requests.RecommendedSkillByPosition;
using Facade.ProfessionalManagement.Contracts.Requests.Skill;
using Facade.ProfessionalManagement.Contracts.Requests.UserSkill;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalSkillsController : ProfessionalManagementControllerBase
{
    public ProfessionalSkillsController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
    }

    // GET api/professional/skills/{skillId}
    [HttpGet("skills/{skillId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetSkillById(Guid skillId)
    {
        var skill = await ProfessionalService.GetSkillByIdAsync(skillId);

        if (skill == null)
            return NotFound();

        return Ok(skill);
    }

    // POST api/professional/skills
    [Authorize]
    [HttpPost("skills")]
    [ProducesResponseType(typeof(SkillResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateSkill([FromBody] CreateSkillRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateSkillAsync(request);

        if (!response.Success)
            return MapSkillError(response);

        return Ok(response);
    }

    // GET api/professional/me/skills
    [Authorize]
    [HttpGet("me/skills")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyUserSkills()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var userSkills = await ProfessionalService.GetMyUserSkillsAsync(userId);

        return Ok(userSkills);
    }

    // GET api/professional/me/skills/{userSkillId}
    [Authorize]
    [HttpGet("me/skills/{userSkillId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyUserSkillById(Guid userSkillId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var userSkill = await ProfessionalService.GetMyUserSkillByIdAsync(
            userId,
            userSkillId);

        if (userSkill == null)
            return NotFound();

        return Ok(userSkill);
    }

    // POST api/professional/me/skills
    [Authorize]
    [HttpPost("me/skills")]
    [ProducesResponseType(typeof(UserSkillResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMyUserSkill([FromBody] CreateUserSkillRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateMyUserSkillAsync(
            userId,
            request);

        if (!response.Success)
            return MapUserSkillError(response);

        return Ok(response);
    }

    // PUT api/professional/me/skills/{userSkillId}
    [Authorize]
    [HttpPut("me/skills/{userSkillId:guid}")]
    [ProducesResponseType(typeof(UserSkillResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateMyUserSkill(
        Guid userSkillId,
        [FromBody] UpdateUserSkillRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.UpdateMyUserSkillAsync(
            userId,
            userSkillId,
            request);

        if (!response.Success)
            return MapUserSkillError(response);

        return Ok(response);
    }

    // PATCH api/professional/me/skills/{userSkillId}
    [Authorize]
    [HttpPatch("me/skills/{userSkillId:guid}")]
    [ProducesResponseType(typeof(UserSkillResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchMyUserSkill(
        Guid userSkillId,
        [FromBody] PatchUserSkillRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.PatchMyUserSkillAsync(
            userId,
            userSkillId,
            request);

        if (!response.Success)
            return MapUserSkillError(response);

        return Ok(response);
    }

    // DELETE api/professional/me/skills/{userSkillId}
    [Authorize]
    [HttpDelete("me/skills/{userSkillId:guid}")]
    [ProducesResponseType(typeof(UserSkillResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyUserSkill(Guid userSkillId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteMyUserSkillAsync(
            userId,
            userSkillId);

        if (!response.Success)
            return MapUserSkillError(response);

        return Ok(response);
    }

    // GET api/professional/recommended-skills?position={position}
    [HttpGet("recommended-skills")]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetRecommendedSkillsByPosition([FromQuery] string? position)
    {
        if (string.IsNullOrWhiteSpace(position))
            return BadRequest(new { errors = new[] { "Position is required." } });

        var recommendedSkills = await ProfessionalService.GetRecommendedSkillsByPositionAsync(
            position);

        return Ok(recommendedSkills);
    }

    // POST api/professional/recommended-skills
    [Authorize]
    [HttpPost("recommended-skills")]
    [ProducesResponseType(typeof(RecommendedSkillByPositionResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateRecommendedSkillByPosition(
        [FromBody] CreateRecommendedSkillByPositionRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateRecommendedSkillByPositionAsync(request);

        if (!response.Success)
            return MapRecommendedSkillError(response);

        return Ok(response);
    }

    // DELETE api/professional/recommended-skills/{rspId}
    [Authorize]
    [HttpDelete("recommended-skills/{rspId:guid}")]
    [ProducesResponseType(typeof(RecommendedSkillByPositionResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteRecommendedSkillByPosition(Guid rspId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteRecommendedSkillByPositionAsync(rspId);

        if (!response.Success)
            return MapRecommendedSkillError(response);

        return Ok(response);
    }
}
