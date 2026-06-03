using Facade.JobsManagement.Contracts.Requests.Vacancy;
using Facade.JobsManagement.Contracts.Responses;
using Facade.JobsManagement.Contracts.Services;
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
    [ProducesResponseType(200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> GetVacancies([FromQuery] string? query, [FromQuery] string? location, [FromQuery] Guid? companyId)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
        {
            return Unauthorized();
        }

        var items = await JobsService.GetVacanciesAsync(userId, query, location, companyId);
        return Ok(items);
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
