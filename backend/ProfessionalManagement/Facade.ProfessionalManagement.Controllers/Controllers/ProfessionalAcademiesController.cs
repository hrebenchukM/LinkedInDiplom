using Facade.FileStorage.Contracts.Upload;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Identity.Contracts.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalAcademiesController : ProfessionalManagementControllerBase
{
    public ProfessionalAcademiesController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
    }

    // GET api/professional/academies/{academyId}
    [HttpGet("academies/{academyId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetAcademyById(Guid academyId)
    {
        var academy = await ProfessionalService.GetAcademyByIdAsync(academyId);

        if (academy == null)
            return NotFoundError(AcademyNotFoundError);

        return Ok(academy);
    }

    // POST api/professional/academies
    [Authorize(Roles = IdentityRoleNames.Admin)]
    [HttpPost("academies")]
    [ProducesResponseType(typeof(AcademyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateAcademy([FromBody] CreateAcademyRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateAcademyAsync(request);

        if (!response.Success)
            return MapAcademyError(response);

        return Ok(response);
    }

    // POST api/professional/academies/{academyId}/logo
    [Authorize(Roles = IdentityRoleNames.Admin)]
    [HttpPost("academies/{academyId:guid}/logo")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(AcademyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UploadAcademyLogo(
        Guid academyId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var validationError = FileUploadValidation.Validate(
            file?.Length,
            FileUploadConstants.ImageMaxSizeBytes,
            FileUploadValidation.ImageTooLargeMessage);
        if (validationError != null)
            return MediaBadRequest(validationError);

        await using var stream = file!.OpenReadStream();

        var response = await ProfessionalService.UploadAcademyLogoAsync(
            userId,
            academyId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        if (!response.Success)
            return MapAcademyError(response);

        return Ok(response);
    }

    private static IActionResult MediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
