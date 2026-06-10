using Facade.AdminManagement.Contracts.Requests;
using Facade.AdminManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Identity.Contracts.Constants;
using Jobs.Contracts.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.AdminManagement.Controllers.Controllers;

[ApiController]
[Route("api/admin/jobs")]
[Authorize(Roles = IdentityRoleNames.Admin)]
public class AdminJobsController : AdminControllerBase
{
    private readonly IAdminManagementService _adminManagementService;

    public AdminJobsController(IAdminManagementService adminManagementService)
    {
        _adminManagementService = adminManagementService;
    }

    [HttpGet("vacancies")]
    [ProducesResponseType(typeof(PagedResponse<AdminVacancyDto>), 200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> GetAdminVacancies(
        [FromQuery] AdminVacanciesQueryRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var vacancies = await _adminManagementService.GetAdminVacanciesAsync(request, cancellationToken);
            return Ok(vacancies);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpDelete("vacancies/{vacancyId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
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
            return MapInvalidOperationException(ex);
        }
    }

    [HttpPatch("vacancies/{vacancyId:guid}/restore")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
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
            return MapInvalidOperationException(ex);
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
        try
        {
            var query = await _adminManagementService.CreateRecommendedJobQueryAsync(request, cancellationToken);
            return Ok(query);
        }
        catch (InvalidOperationException ex)
        {
            return MapInvalidOperationException(ex);
        }
    }

    [HttpDelete("recommended-queries/{recommendedJobQueryId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
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
            return MapInvalidOperationException(ex);
        }
    }
}
