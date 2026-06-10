using Facade.ProfessionalManagement.Contracts.Requests.Certificate;
using Facade.ProfessionalManagement.Contracts.Requests.CertificateSkill;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalCertificatesController : ProfessionalManagementControllerBase
{
    public ProfessionalCertificatesController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
    }

    // GET api/professional/me/certificates
    [Authorize]
    [HttpGet("me/certificates")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyCertificates()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var certificates = await ProfessionalService.GetMyCertificatesAsync(userId);

        return Ok(certificates);
    }

    // GET api/professional/me/certificates/{certificateId}
    [Authorize]
    [HttpGet("me/certificates/{certificateId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyCertificateById(Guid certificateId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var certificate = await ProfessionalService.GetMyCertificateByIdAsync(
            userId,
            certificateId);

        if (certificate == null)
            return NotFoundError(CertificateNotFoundError);

        return Ok(certificate);
    }

    // POST api/professional/me/certificates
    [Authorize]
    [HttpPost("me/certificates")]
    [ProducesResponseType(typeof(CertificateResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMyCertificate([FromBody] CreateCertificateRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateMyCertificateAsync(
            userId,
            request);

        if (!response.Success)
            return MapCertificateError(response);

        return Ok(response);
    }

    // PUT api/professional/me/certificates/{certificateId}
    [Authorize]
    [HttpPut("me/certificates/{certificateId:guid}")]
    [ProducesResponseType(typeof(CertificateResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateMyCertificate(
        Guid certificateId,
        [FromBody] UpdateCertificateRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.UpdateMyCertificateAsync(
            userId,
            certificateId,
            request);

        if (!response.Success)
            return MapCertificateError(response);

        return Ok(response);
    }

    // PATCH api/professional/me/certificates/{certificateId}
    [Authorize]
    [HttpPatch("me/certificates/{certificateId:guid}")]
    [ProducesResponseType(typeof(CertificateResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchMyCertificate(
        Guid certificateId,
        [FromBody] PatchCertificateRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.PatchMyCertificateAsync(
            userId,
            certificateId,
            request);

        if (!response.Success)
            return MapCertificateError(response);

        return Ok(response);
    }

    // POST api/professional/me/certificates/{certificateId}/file
    [Authorize]
    [HttpPost("me/certificates/{certificateId:guid}/file")]
    [Consumes("multipart/form-data")]
    [ProducesResponseType(typeof(CertificateResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UploadCertificateFile(
        Guid certificateId,
        IFormFile file,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        if (file == null || file.Length == 0)
            return MediaBadRequest("File is empty.");
        if (file.Length > 10 * 1024 * 1024)
            return MediaBadRequest("File is too large. Maximum size is 10 MB.");

        await using var stream = file.OpenReadStream();

        var response = await ProfessionalService.UploadCertificateFileAsync(
            userId,
            certificateId,
            stream,
            file.FileName,
            file.ContentType,
            cancellationToken);

        if (!response.Success)
            return MapCertificateError(response);

        return Ok(response);
    }

    // DELETE api/professional/me/certificates/{certificateId}
    [Authorize]
    [HttpDelete("me/certificates/{certificateId:guid}")]
    [ProducesResponseType(typeof(CertificateResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyCertificate(Guid certificateId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteMyCertificateAsync(
            userId,
            certificateId);

        if (!response.Success)
            return MapCertificateError(response);

        return Ok(response);
    }

    // GET api/professional/me/certificates/{certificateId}/skills
    [Authorize]
    [HttpGet("me/certificates/{certificateId:guid}/skills")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyCertificateSkills(Guid certificateId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var certificateSkills = await ProfessionalService.GetMyCertificateSkillsAsync(
            userId,
            certificateId);

        if (certificateSkills == null)
            return NotFoundError(CertificateNotFoundError);

        return Ok(certificateSkills);
    }

    // GET api/professional/me/certificates/{certificateId}/skills/{certificateSkillId}
    [Authorize]
    [HttpGet("me/certificates/{certificateId:guid}/skills/{certificateSkillId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetMyCertificateSkillById(
        Guid certificateId,
        Guid certificateSkillId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var certificateSkill = await ProfessionalService.GetMyCertificateSkillByIdAsync(
            userId,
            certificateId,
            certificateSkillId);

        if (certificateSkill == null)
            return NotFoundError(CertificateSkillNotFoundError);

        return Ok(certificateSkill);
    }

    // POST api/professional/me/certificates/{certificateId}/skills
    [Authorize]
    [HttpPost("me/certificates/{certificateId:guid}/skills")]
    [ProducesResponseType(typeof(CertificateSkillResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> CreateMyCertificateSkill(
        Guid certificateId,
        [FromBody] CreateCertificateSkillRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.CreateMyCertificateSkillAsync(
            userId,
            certificateId,
            request);

        if (!response.Success)
            return MapCertificateSkillError(response);

        return Ok(response);
    }

    // DELETE api/professional/me/certificates/{certificateId}/skills/{certificateSkillId}
    [Authorize]
    [HttpDelete("me/certificates/{certificateId:guid}/skills/{certificateSkillId:guid}")]
    [ProducesResponseType(typeof(CertificateSkillResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyCertificateSkill(
        Guid certificateId,
        Guid certificateSkillId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await ProfessionalService.DeleteMyCertificateSkillAsync(
            userId,
            certificateId,
            certificateSkillId);

        if (!response.Success)
            return MapCertificateSkillError(response);

        return Ok(response);
    }

    private static IActionResult MediaBadRequest(string message) =>
        new BadRequestObjectResult(new { success = false, errors = new[] { message } });
}
