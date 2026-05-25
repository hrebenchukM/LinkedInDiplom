using System.Security.Claims;
using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Requests.Education;
using Facade.ProfessionalManagement.Contracts.Requests.Experience;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

[ApiController]
[Route("api/professional")]
public class ProfessionalController : ControllerBase
{
    private readonly IProfessionalManagementService _professionalManagementService;

    public ProfessionalController(IProfessionalManagementService professionalManagementService)
    {
        _professionalManagementService = professionalManagementService;
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

        var experiences = await _professionalManagementService.GetMyExperiencesAsync(userId);

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

        var experience = await _professionalManagementService.GetMyExperienceByIdAsync(
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

        var response = await _professionalManagementService.CreateMyExperienceAsync(
            userId,
            request);

        if (!response.Success)
            return BadRequest(response);

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

        var response = await _professionalManagementService.UpdateMyExperienceAsync(
            userId,
            experienceId,
            request);

        if (!response.Success)
            return NotFound(response);

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

        var response = await _professionalManagementService.PatchMyExperienceAsync(
            userId,
            experienceId,
            request);

        if (!response.Success)
            return NotFound(response);

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

        var response = await _professionalManagementService.DeleteMyExperienceAsync(
            userId,
            experienceId);

        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub");
    }

    // GET api/professional/me/companies
    [Authorize]
    [HttpGet("me/companies")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetMyCompanies()
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var companies = await _professionalManagementService.GetMyCompaniesAsync(userId);

        return Ok(companies);
    }

    // GET api/professional/companies/{companyId}
    [HttpGet("companies/{companyId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCompanyById(Guid companyId)
    {
        var company = await _professionalManagementService.GetCompanyByIdAsync(companyId);

        if (company == null)
            return NotFound();

        return Ok(company);
    }

    // POST api/professional/me/companies
    [Authorize]
    [HttpPost("me/companies")]
    [ProducesResponseType(typeof(CompanyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateMyCompany([FromBody] CreateCompanyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _professionalManagementService.CreateMyCompanyAsync(
            userId,
            request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
    }

    // PUT api/professional/me/companies/{companyId}
    [Authorize]
    [HttpPut("me/companies/{companyId:guid}")]
    [ProducesResponseType(typeof(CompanyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateMyCompany(
        Guid companyId,
        [FromBody] UpdateCompanyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _professionalManagementService.UpdateMyCompanyAsync(
            userId,
            companyId,
            request);

        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    // PATCH api/professional/me/companies/{companyId}
    [Authorize]
    [HttpPatch("me/companies/{companyId:guid}")]
    [ProducesResponseType(typeof(CompanyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> PatchMyCompany(
        Guid companyId,
        [FromBody] PatchCompanyRequest request)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _professionalManagementService.PatchMyCompanyAsync(
            userId,
            companyId,
            request);

        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    // DELETE api/professional/me/companies/{companyId}
    [Authorize]
    [HttpDelete("me/companies/{companyId:guid}")]
    [ProducesResponseType(typeof(CompanyResponse), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteMyCompany(Guid companyId)
    {
        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _professionalManagementService.DeleteMyCompanyAsync(
            userId,
            companyId);

        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }

    // GET api/professional/academies/{academyId}
    [HttpGet("academies/{academyId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetAcademyById(Guid academyId)
    {
        var academy = await _professionalManagementService.GetAcademyByIdAsync(academyId);

        if (academy == null)
            return NotFound();

        return Ok(academy);
    }

    // POST api/professional/academies
    [Authorize]
    [HttpPost("academies")]
    [ProducesResponseType(typeof(AcademyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateAcademy([FromBody] CreateAcademyRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _professionalManagementService.CreateAcademyAsync(request);

        if (!response.Success)
            return BadRequest(response);

        return Ok(response);
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

        var educations = await _professionalManagementService.GetMyEducationsAsync(userId);

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

        var education = await _professionalManagementService.GetMyEducationByIdAsync(
            userId,
            educationId);

        if (education == null)
            return NotFound();

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _professionalManagementService.CreateMyEducationAsync(
            userId,
            request);

        if (!response.Success)
            return BadRequest(response);

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
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized();

        var response = await _professionalManagementService.UpdateMyEducationAsync(
            userId,
            educationId,
            request);

        if (!response.Success)
            return NotFound(response);

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

        var response = await _professionalManagementService.PatchMyEducationAsync(
            userId,
            educationId,
            request);

        if (!response.Success)
            return NotFound(response);

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

        var response = await _professionalManagementService.DeleteMyEducationAsync(
            userId,
            educationId);

        if (!response.Success)
            return NotFound(response);

        return Ok(response);
    }
}