using Facade.AdminManagement.Contracts.Requests;
using Facade.AdminManagement.Contracts.Services;
using Identity.Contracts.Constants;
using Jobs.Contracts.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/jobs")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminJobsController : ControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminJobsController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpDelete("vacancies/{vacancyId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AdminSoftDeleteVacancy(Guid vacancyId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminSoftDeleteVacancyAsync(vacancyId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPatch("vacancies/{vacancyId:guid}/restore")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> AdminRestoreVacancy(Guid vacancyId, CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.AdminRestoreVacancyAsync(vacancyId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("recommended-queries")]
    [ProducesResponseType(typeof(IReadOnlyCollection<RecommendedJobQueryDto>), 200)]
    public async Task<IActionResult> GetRecommendedJobQueries(CancellationToken cancellationToken)
    {
        var queries = await _adminManagementService.GetRecommendedJobQueriesAsync(cancellationToken);
        return Ok(queries);
    }

    [HttpPost("recommended-queries")]
    [ProducesResponseType(typeof(RecommendedJobQueryDto), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> CreateRecommendedJobQuery(
        [FromBody] CreateRecommendedJobQueryRequest request,
        CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var query = await _adminManagementService.CreateRecommendedJobQueryAsync(request, cancellationToken);
            return Ok(query);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("recommended-queries/{recommendedJobQueryId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> DeleteRecommendedJobQuery(
        Guid recommendedJobQueryId,
        CancellationToken cancellationToken)
    {
        try
        {
            await _adminManagementService.DeleteRecommendedJobQueryAsync(recommendedJobQueryId, cancellationToken);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
