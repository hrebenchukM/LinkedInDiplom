using Facade.JobsManagement.Contracts.DTOs;
using Facade.JobsManagement.Contracts.Requests.Vacancy;
using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
using Facade.Shared.Contracts.Pagination;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Facade.JobsManagement.Controllers.Controllers;

public class JobsVacanciesController : JobsManagementControllerBase
{
    public JobsVacanciesController(IJobsManagementService jobsManagementService)
        : base(jobsManagementService)
    {
    }

    [Authorize]
    [HttpPost("me/vacancies")]
    [ProducesResponseType(typeof(VacancyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> CreateVacancy([FromBody] CreateVacancyRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await JobsService.CreateVacancyAsync(userId, request);
        if (!response.Success)
        {
            return MapVacancyError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpGet("vacancies")]
    [ProducesResponseType(typeof(PagedResponse<VacancyDto>), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetVacancies(
        [FromQuery] GetVacanciesQueryRequest request,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        try
        {
            var vacancies = await JobsService.GetVacanciesAsync(userId, request, cancellationToken);
            return Ok(vacancies);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, errors = new[] { ex.Message } });
        }
    }

    [Authorize]
    [HttpGet("vacancies/{vacancyId:guid}")]
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetVacancyById(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var item = await JobsService.GetVacancyByIdAsync(userId, vacancyId);
        if (item is null)
        {
            return NotFoundError(VacancyNotFoundError);
        }

        return Ok(item);
    }

    [Authorize]
    [HttpPatch("me/vacancies/{vacancyId:guid}")]
    [ProducesResponseType(typeof(VacancyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateVacancy(Guid vacancyId, [FromBody] UpdateVacancyRequest request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await JobsService.UpdateVacancyAsync(userId, vacancyId, request);
        if (!response.Success)
        {
            return MapVacancyError(response);
        }

        return Ok(response);
    }

    [Authorize]
    [HttpDelete("me/vacancies/{vacancyId:guid}")]
    [ProducesResponseType(typeof(VacancyResponse), 200)]
    [ProducesResponseType(400)]
    [ProducesResponseType(401)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteVacancy(Guid vacancyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var response = await JobsService.DeleteVacancyAsync(userId, vacancyId);
        if (!response.Success)
        {
            return MapVacancyError(response);
        }

        return Ok(response);
    }
}
