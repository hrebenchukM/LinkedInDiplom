using Facade.ProfessionalManagement.Contracts.Requests.Academy;
using Facade.ProfessionalManagement.Contracts.Responses;
using Facade.ProfessionalManagement.Contracts.Services;
using Microsoft.AspNetCore.Authorization;
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
    [Authorize]
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
}
