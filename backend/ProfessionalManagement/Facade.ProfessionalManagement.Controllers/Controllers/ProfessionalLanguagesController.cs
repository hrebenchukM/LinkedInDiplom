using Facade.ProfessionalManagement.Contracts.Requests.Language;
using Facade.ProfessionalManagement.Contracts.Requests.UserLanguage;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalLanguagesController : ProfessionalManagementControllerBase
{
    public ProfessionalLanguagesController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
    }

    // GET api/professional/languages/{languageId}
    [HttpGet("languages/{languageId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetLanguageById(Guid languageId)
    {
        var language = await ProfessionalService.GetLanguageByIdAsync(languageId);

        if (language == null)
            return NotFoundError(LanguageNotFoundError);

        return Ok(language);
    }

    // POST api/professional/languages
    [Authorize]
    [HttpPost("languages")]
    [ProducesResponseType(typeof(LanguageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateLanguage([FromBody] CreateLanguageRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateLanguageAsync(request);

        if (!response.Success)
            return MapLanguageError(response);

        return Ok(response);
    }

    // GET api/professional/me/languages
    [Authorize]
    [HttpGet("me/languages")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyUserLanguages()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var userLanguages = await ProfessionalService.GetMyUserLanguagesAsync(userId);

        return Ok(userLanguages);
    }

    // GET api/professional/me/languages/{userLanguageId}
    [Authorize]
    [HttpGet("me/languages/{userLanguageId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyUserLanguageById(Guid userLanguageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var userLanguage = await ProfessionalService.GetMyUserLanguageByIdAsync(
            userId,
            userLanguageId);

        if (userLanguage == null)
            return NotFoundError(UserLanguageNotFoundError);

        return Ok(userLanguage);
    }

    // POST api/professional/me/languages
    [Authorize]
    [HttpPost("me/languages")]
    [ProducesResponseType(typeof(UserLanguageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMyUserLanguage([FromBody] CreateUserLanguageRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateMyUserLanguageAsync(
            userId,
            request);

        if (!response.Success)
            return MapUserLanguageError(response);

        return Ok(response);
    }

    // PUT api/professional/me/languages/{userLanguageId}
    [Authorize]
    [HttpPut("me/languages/{userLanguageId:guid}")]
    [ProducesResponseType(typeof(UserLanguageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateMyUserLanguage(
        Guid userLanguageId,
        [FromBody] UpdateUserLanguageRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.UpdateMyUserLanguageAsync(
            userId,
            userLanguageId,
            request);

        if (!response.Success)
            return MapUserLanguageError(response);

        return Ok(response);
    }

    // PATCH api/professional/me/languages/{userLanguageId}
    [Authorize]
    [HttpPatch("me/languages/{userLanguageId:guid}")]
    [ProducesResponseType(typeof(UserLanguageResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchMyUserLanguage(
        Guid userLanguageId,
        [FromBody] PatchUserLanguageRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.PatchMyUserLanguageAsync(
            userId,
            userLanguageId,
            request);

        if (!response.Success)
            return MapUserLanguageError(response);

        return Ok(response);
    }

    // DELETE api/professional/me/languages/{userLanguageId}
    [Authorize]
    [HttpDelete("me/languages/{userLanguageId:guid}")]
    [ProducesResponseType(typeof(UserLanguageResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyUserLanguage(Guid userLanguageId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteMyUserLanguageAsync(
            userId,
            userLanguageId);

        if (!response.Success)
            return MapUserLanguageError(response);

        return Ok(response);
    }
}
