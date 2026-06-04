using Facade.ProfessionalManagement.Contracts.Requests.Company;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.ProfessionalManagement.Controllers.Controllers;

public class ProfessionalCompaniesController : ProfessionalManagementControllerBase
{
    public ProfessionalCompaniesController(IProfessionalManagementService professionalManagementService)
        : base(professionalManagementService)
    {
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

        var companies = await ProfessionalService.GetMyCompaniesAsync(userId);

        return Ok(companies);
    }

    // GET api/professional/companies/{companyId}
    [HttpGet("companies/{companyId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetCompanyById(Guid companyId)
    {
        var company = await ProfessionalService.GetCompanyByIdAsync(companyId);

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

        var response = await ProfessionalService.CreateMyCompanyAsync(
            userId,
            request);

        if (!response.Success)
            return MapCompanyError(response);

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

        var response = await ProfessionalService.UpdateMyCompanyAsync(
            userId,
            companyId,
            request);

        if (!response.Success)
            return MapCompanyError(response);

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

        var response = await ProfessionalService.PatchMyCompanyAsync(
            userId,
            companyId,
            request);

        if (!response.Success)
            return MapCompanyError(response);

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

        var response = await ProfessionalService.DeleteMyCompanyAsync(
            userId,
            companyId);

        if (!response.Success)
            return MapCompanyError(response);

        return Ok(response);
    }
}
